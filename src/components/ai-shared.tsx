import { Check, Copy, RefreshCw, ShieldAlert, Sparkle } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DISCLAIMER } from "@/components/app-layout";
import { cn } from "@/lib/utils";

export function PageHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function Disclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-soft px-3 py-2.5 text-xs text-warning-foreground",
        className,
      )}
    >
      <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        <strong className="font-semibold">Responsible AI: </strong>
        {DISCLAIMER}
      </span>
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
      <Sparkle className={cn(loading && "animate-pulse")} />
      {loading ? "Generating…" : children}
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

export function EmptyOutput({ text }: { text: string }) {
  return (
    <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
      <Sparkle className="mb-2 h-6 w-6 text-primary/60" />
      <p className="max-w-xs text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export function OutputCard({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="surface-card flex flex-col p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="flex gap-2">{actions}</div>
      </div>
      <div className="flex-1">{children}</div>
    </section>
  );
}

export function EditableList({
  items,
  onChange,
  numbered,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  numbered?: boolean;
}) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-2 shrink-0 text-xs font-semibold text-primary">
            {numbered ? `${i + 1}.` : "•"}
          </span>
          <input
            value={item}
            onChange={(e) => onChange(items.map((it, j) => (j === i ? e.target.value : it)))}
            className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm transition-colors hover:border-input focus:border-ring focus:outline-none"
          />
        </li>
      ))}
    </ul>
  );
}
