import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useState } from "react";
import {
  CopyButton,
  Disclaimer,
  EmptyOutput,
  GenerateButton,
  LoadingSkeleton,
  OutputCard,
  PageHeader,
  RegenerateButton,
} from "@/components/ai-shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateEmail, type EmailTone } from "@/lib/mock-ai";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator – Workplace AI" },
      { name: "description", content: "Generate professional emails in formal, friendly or persuasive tones, then edit and copy." },
      { property: "og:title", content: "Smart Email Generator – Workplace AI" },
      { property: "og:description", content: "Generate professional emails in formal, friendly or persuasive tones." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailPage,
});

const TONES: { value: EmailTone; label: string; hint: string }[] = [
  { value: "formal", label: "Formal", hint: "Polished and professional" },
  { value: "friendly", label: "Friendly", hint: "Warm and approachable" },
  { value: "persuasive", label: "Persuasive", hint: "Confident and compelling" },
];

function EmailPage() {
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [points, setPoints] = useState("");
  const [tone, setTone] = useState<EmailTone>("formal");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const result = await generateEmail({ recipient, purpose, points, tone });
    setOutput(result);
    setLoading(false);
  };

  const canRun = purpose.trim().length > 0;

  return (
    <div>
      <PageHeader
        icon={Mail}
        title="Smart Email Generator"
        description="Describe the email you need, pick a tone, and refine the draft before sending."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface-card space-y-5 p-5">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input id="recipient" placeholder="e.g. Maria, Head of Operations" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose *</Label>
            <Input id="purpose" placeholder="e.g. Request approval for the Q4 budget" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="points">Key points (one per line)</Label>
            <Textarea
              id="points"
              rows={5}
              placeholder={"Budget increased by 8%\nCovers two new hires\nNeed sign-off by Friday"}
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Tone</Label>
            <div className="grid grid-cols-3 gap-2">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTone(t.value)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left transition-colors",
                    tone === t.value
                      ? "border-primary bg-primary-soft text-accent-foreground"
                      : "border-input hover:bg-accent/50",
                  )}
                >
                  <span className="block text-sm font-semibold">{t.label}</span>
                  <span className="block text-[11px] text-muted-foreground">{t.hint}</span>
                </button>
              ))}
            </div>
          </div>
          <GenerateButton loading={loading} disabled={!canRun} onClick={run}>
            Generate email
          </GenerateButton>
        </section>

        <OutputCard
          title="Draft"
          actions={
            output && (
              <>
                <CopyButton text={output} />
                <RegenerateButton onClick={run} loading={loading} />
              </>
            )
          }
        >
          {loading ? (
            <LoadingSkeleton lines={8} />
          ) : output ? (
            <Textarea
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              className="min-h-80 resize-y text-sm leading-relaxed"
              aria-label="Editable email draft"
            />
          ) : (
            <EmptyOutput text="Your generated email will appear here. You can edit it directly before copying." />
          )}
        </OutputCard>
      </div>
      <Disclaimer className="mt-6" />
    </div>
  );
}
