import { Check, Copy, RefreshCw, Sparkles, TriangleAlert } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageHeader({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-border bg-primary-soft text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

export function Notice({
  tone = "warning",
  children,
}: {
  tone?: "warning" | "muted";
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs",
        tone === "warning"
          ? "border-primary/40 bg-warning-soft text-warning-foreground"
          : "border-border bg-muted text-muted-foreground",
      )}
    >
      <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? <Check /> : <Copy />}
      {copied ? "Copied" : label}
    </Button>
  );
}

export function RegenerateButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={loading}>
      <RefreshCw className={cn(loading && "animate-spin")} />
      Regenerate
    </Button>
  );
}

export function GenerateButton({
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading: boolean; children: ReactNode }) {
  return (
    <Button size="lg" className="rounded-xl" disabled={loading || props.disabled} {...props}>
      <Sparkles className={cn(loading && "animate-pulse")} />
      {loading ? "Working…" : children}
    </Button>
  );
}

export function LoadingSkeleton({ lines = 5 }: { lines?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Generating">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="ai-pulse h-3.5 rounded-full" style={{ width: `${95 - (i % 3) * 18}%` }} />
      ))}
    </div>
  );
}

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center">
      <Icon className="mb-3 h-6 w-6 text-primary" />
      <p className="font-medium">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
      <p className="flex items-start gap-2 text-destructive">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
        {message}
      </p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function Panel({
  title,
  actions,
  children,
  className,
}: {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-card flex flex-col p-5", className)}>
      {title || actions ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title ? <h3 className="text-sm font-semibold">{title}</h3> : <span />}
          <div className="flex flex-wrap gap-2">{actions}</div>
        </div>
      ) : null}
      <div className="flex-1">{children}</div>
    </section>
  );
}

/** Lightweight markdown-ish renderer for AI output. */
export function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;
        if (trimmed.startsWith("## "))
          return (
            <h4 key={i} className="pt-2 text-sm font-semibold tracking-tight">
              {trimmed.slice(3)}
            </h4>
          );
        if (trimmed.startsWith("# "))
          return (
            <h3 key={i} className="pt-2 text-base font-semibold tracking-tight">
              {trimmed.slice(2)}
            </h3>
          );
        if (/^[-*]\s+/.test(trimmed))
          return (
            <p key={i} className="flex gap-2 pl-1 text-muted-foreground">
              <span className="text-primary">•</span>
              <span>{trimmed.replace(/^[-*]\s+/, "")}</span>
            </p>
          );
        return (
          <p key={i} className="text-muted-foreground">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}
