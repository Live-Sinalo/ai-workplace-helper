import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ListTodo, Trash2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { planTasks, type PlannedTask, type Priority } from "@/lib/mock-ai";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "AI Task Planner – Workplace AI" },
      { name: "description", content: "Turn goals into structured tasks with priorities and suggested deadlines." },
      { property: "og:title", content: "AI Task Planner – Workplace AI" },
      { property: "og:description", content: "Turn goals into structured tasks with priorities and suggested deadlines." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TasksPage,
});

const PRIORITIES: Priority[] = ["High", "Medium", "Low"];
const priorityClass: Record<Priority, string> = {
  High: "bg-destructive/10 text-destructive",
  Medium: "bg-warning-soft text-warning-foreground",
  Low: "bg-primary-soft text-accent-foreground",
};

function TasksPage() {
  const [goal, setGoal] = useState("");
  const [timeframe, setTimeframe] = useState("2 weeks");
  const [tasks, setTasks] = useState<PlannedTask[] | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setTasks(await planTasks(goal, timeframe));
    setLoading(false);
  };

  const patch = (id: string, p: Partial<PlannedTask>) =>
    setTasks((ts) => ts?.map((t) => (t.id === id ? { ...t, ...p } : t)) ?? null);

  const asText = (ts: PlannedTask[]) =>
    ts.map((t) => `${t.done ? "[x]" : "[ ]"} ${t.title} — ${t.priority} priority, due ${t.deadline}`).join("\n");

  const done = tasks?.filter((t) => t.done).length ?? 0;

  return (
    <div>
      <PageHeader
        icon={ListTodo}
        title="AI Task Planner"
        description="Describe a goal and get a structured plan with priorities and suggested deadlines."
      />
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="surface-card space-y-4 p-5 lg:col-span-2">
          <div className="space-y-2">
            <Label htmlFor="goal">Goal *</Label>
            <Textarea
              id="goal"
              rows={5}
              placeholder="e.g. Launch the new customer feedback survey across all regions"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeframe">Timeframe</Label>
            <Input id="timeframe" placeholder="e.g. 2 weeks, 1 month, this quarter" value={timeframe} onChange={(e) => setTimeframe(e.target.value)} />
          </div>
          <GenerateButton loading={loading} disabled={goal.trim().length < 5} onClick={run}>
            Plan tasks
          </GenerateButton>
        </section>

        <div className="lg:col-span-3">
          <OutputCard
            title={tasks ? `Task plan · ${done}/${tasks.length} complete` : "Task plan"}
            actions={
              tasks && (
                <>
                  <CopyButton text={asText(tasks)} />
                  <RegenerateButton onClick={run} loading={loading} />
                </>
              )
            }
          >
            {loading ? (
              <LoadingSkeleton lines={6} />
            ) : tasks ? (
              <ul className="space-y-2">
                {tasks.map((t) => (
                  <li
                    key={t.id}
                    className={cn(
                      "grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-xl border border-border p-3 transition-colors",
                      t.done && "bg-muted/50",
                    )}
                  >
                    <Checkbox
                      checked={t.done}
                      onCheckedChange={(v) => patch(t.id, { done: v === true })}
                      className="mt-1"
                      aria-label="Mark complete"
                    />
                    <div className="min-w-0">
                      <input
                        value={t.title}
                        onChange={(e) => patch(t.id, { title: e.target.value })}
                        className={cn(
                          "w-full bg-transparent text-sm font-medium focus:outline-none",
                          t.done && "text-muted-foreground line-through",
                        )}
                      />
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <select
                          value={t.priority}
                          onChange={(e) => patch(t.id, { priority: e.target.value as Priority })}
                          className={cn("cursor-pointer rounded-full border-0 px-2 py-0.5 font-medium", priorityClass[t.priority])}
                          aria-label="Priority"
                        >
                          {PRIORITIES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          <input
                            value={t.deadline}
                            onChange={(e) => patch(t.id, { deadline: e.target.value })}
                            className="w-16 bg-transparent focus:outline-none"
                            aria-label="Deadline"
                          />
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTasks((ts) => ts?.filter((x) => x.id !== t.id) ?? null)}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remove task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyOutput text="Your prioritised task list will appear here. Edit titles, priorities and dates inline." />
            )}
          </OutputCard>
        </div>
      </div>
      <Disclaimer className="mt-6" />
    </div>
  );
}
