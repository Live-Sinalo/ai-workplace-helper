import { createFileRoute } from "@tanstack/react-router";
import { Lightbulb, Search, Target } from "lucide-react";
import { useState } from "react";
import {
  CopyButton,
  Disclaimer,
  EditableList,
  EmptyOutput,
  GenerateButton,
  LoadingSkeleton,
  OutputCard,
  PageHeader,
  RegenerateButton,
} from "@/components/ai-shared";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { research, type ResearchResult } from "@/lib/mock-ai";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant – Workplace AI" },
      { name: "description", content: "Summarise topics or articles and get key insights and recommendations." },
      { property: "og:title", content: "AI Research Assistant – Workplace AI" },
      { property: "og:description", content: "Summarise topics or articles and get key insights and recommendations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchPage,
});

const SUGGESTIONS = ["Hybrid work productivity", "AI adoption in HR", "Async communication best practices"];

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setResult(await research(topic));
    setLoading(false);
  };
  const update = (p: Partial<ResearchResult>) => setResult((r) => (r ? { ...r, ...p } : r));
  const asText = (r: ResearchResult) =>
    `Summary\n${r.summary}\n\nKey insights\n${r.insights.map((i) => `- ${i}`).join("\n")}\n\nRecommendations\n${r.recommendations
      .map((i, n) => `${n + 1}. ${i}`)
      .join("\n")}`;

  return (
    <div>
      <PageHeader
        icon={Search}
        title="AI Research Assistant"
        description="Enter a topic, question or paste an article to get a summary, insights and next steps."
      />
      <section className="surface-card space-y-4 p-5">
        <Label htmlFor="topic">Topic or article text</Label>
        <Textarea
          id="topic"
          rows={5}
          placeholder="e.g. What are the benefits and risks of four-day work weeks?"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Try:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTopic(s)}
              className="rounded-full border border-input px-3 py-1 text-xs font-medium transition-colors hover:bg-accent"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <GenerateButton loading={loading} disabled={topic.trim().length < 3} onClick={run}>
            Research topic
          </GenerateButton>
          {result && (
            <>
              <CopyButton text={asText(result)} label="Copy all" />
              <RegenerateButton onClick={run} loading={loading} />
            </>
          )}
        </div>
      </section>

      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <OutputCard title="Summary">
              <LoadingSkeleton lines={6} />
            </OutputCard>
            <OutputCard title="Key insights">
              <LoadingSkeleton lines={4} />
            </OutputCard>
            <OutputCard title="Recommendations">
              <LoadingSkeleton lines={4} />
            </OutputCard>
          </div>
        ) : result ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <OutputCard title="Summary">
              <Textarea
                value={result.summary}
                onChange={(e) => update({ summary: e.target.value })}
                className="min-h-56 resize-y text-sm leading-relaxed"
                aria-label="Editable summary"
              />
            </OutputCard>
            <OutputCard
              title="Key insights"
              actions={<Lightbulb className="h-4 w-4 text-warning" />}
            >
              <EditableList items={result.insights} onChange={(insights) => update({ insights })} />
            </OutputCard>
            <OutputCard title="Recommendations" actions={<Target className="h-4 w-4 text-primary" />}>
              <EditableList numbered items={result.recommendations} onChange={(recommendations) => update({ recommendations })} />
            </OutputCard>
          </div>
        ) : (
          <div className="surface-card p-5">
            <EmptyOutput text="Summary, key insights and recommendations will appear here." />
          </div>
        )}
      </div>
      <Disclaimer className="mt-6" />
    </div>
  );
}
