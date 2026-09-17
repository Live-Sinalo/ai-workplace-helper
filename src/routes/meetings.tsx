import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck } from "lucide-react";
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
import { summarizeMeeting, type MeetingSummary } from "@/lib/mock-ai";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer – Workplace AI" },
      { name: "description", content: "Convert meeting notes into a summary, key decisions and action items." },
      { property: "og:title", content: "Meeting Notes Summarizer – Workplace AI" },
      { property: "og:description", content: "Convert meeting notes into a summary, key decisions and action items." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MeetingsPage,
});

const SAMPLE = `Kickoff for the new onboarding flow.
Priya walked through the current drop-off numbers — 40% leave at step 3.
Team agreed to simplify step 3 to a single screen.
Sam will prepare wireframes by Friday.
Alex should review the analytics setup and update the dashboard.
We decided to run a two-week A/B test starting next sprint.
Need to schedule a follow-up with the support team.`;

function MeetingsPage() {
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<MeetingSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setResult(await summarizeMeeting(notes));
    setLoading(false);
  };

  const asText = (r: MeetingSummary) =>
    `Summary\n${r.summary}\n\nKey decisions\n${r.decisions.map((d) => `- ${d}`).join("\n")}\n\nAction items\n${r.actions
      .map((a) => `- ${a.task} (${a.owner}, due ${a.due})`)
      .join("\n")}`;

  const update = (patch: Partial<MeetingSummary>) => setResult((r) => (r ? { ...r, ...patch } : r));

  return (
    <div>
      <PageHeader
        icon={CalendarCheck}
        title="Meeting Notes Summarizer"
        description="Paste rough notes and get a clean summary, the decisions made, and who owns what."
      />
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="surface-card space-y-4 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="notes">Meeting notes</Label>
            <button type="button" onClick={() => setNotes(SAMPLE)} className="text-xs font-medium text-primary hover:underline">
              Use sample notes
            </button>
          </div>
          <Textarea
            id="notes"
            rows={16}
            placeholder="Paste your meeting notes, transcript or bullet points here…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-sm leading-relaxed"
          />
          <GenerateButton loading={loading} disabled={notes.trim().length < 10} onClick={run}>
            Summarize notes
          </GenerateButton>
        </section>

        <div className="space-y-4 lg:col-span-3">
          <OutputCard
            title="Summary"
            actions={
              result && (
                <>
                  <CopyButton text={asText(result)} label="Copy all" />
                  <RegenerateButton onClick={run} loading={loading} />
                </>
              )
            }
          >
            {loading ? (
              <LoadingSkeleton lines={4} />
            ) : result ? (
              <Textarea
                value={result.summary}
                onChange={(e) => update({ summary: e.target.value })}
                className="min-h-28 resize-y text-sm leading-relaxed"
                aria-label="Editable summary"
              />
            ) : (
              <EmptyOutput text="Your summary, key decisions and action items will appear here." />
            )}
          </OutputCard>

          {(loading || result) && (
            <div className="grid gap-4 md:grid-cols-2">
              <OutputCard title="Key decisions">
                {loading || !result ? (
                  <LoadingSkeleton lines={3} />
                ) : (
                  <EditableList items={result.decisions} onChange={(decisions) => update({ decisions })} />
                )}
              </OutputCard>
              <OutputCard title="Action items">
                {loading || !result ? (
                  <LoadingSkeleton lines={4} />
                ) : (
                  <ul className="space-y-3">
                    {result.actions.map((a, i) => (
                      <li key={i} className="rounded-xl border border-border p-3">
                        <input
                          value={a.task}
                          onChange={(e) =>
                            update({
                              actions: result.actions.map((x, j) => (j === i ? { ...x, task: e.target.value } : x)),
                            })
                          }
                          className="w-full bg-transparent text-sm font-medium focus:outline-none"
                        />
                        <div className="mt-1.5 flex gap-2 text-xs text-muted-foreground">
                          <span className="rounded-full bg-primary-soft px-2 py-0.5 font-medium text-accent-foreground">
                            {a.owner}
                          </span>
                          <span className="rounded-full bg-muted px-2 py-0.5">Due {a.due}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </OutputCard>
            </div>
          )}
        </div>
      </div>
      <Disclaimer className="mt-6" />
    </div>
  );
}
