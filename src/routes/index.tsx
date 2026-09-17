import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bot, CalendarCheck, ListTodo, Mail, Search, Sparkle } from "lucide-react";
import { Disclaimer } from "@/components/ai-shared";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard – Workplace AI Productivity Assistant" },
      { name: "description", content: "Quick access to AI tools for emails, meeting notes, task planning, research and chat." },
      { property: "og:title", content: "Dashboard – Workplace AI Productivity Assistant" },
      { property: "og:description", content: "Quick access to AI tools for emails, meeting notes, task planning, research and chat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  {
    to: "/email",
    icon: Mail,
    title: "Smart Email Generator",
    description: "Draft professional emails in formal, friendly or persuasive tones.",
    tag: "Writing",
  },
  {
    to: "/meetings",
    icon: CalendarCheck,
    title: "Meeting Notes Summarizer",
    description: "Turn raw notes into a summary, key decisions and action items.",
    tag: "Meetings",
  },
  {
    to: "/tasks",
    icon: ListTodo,
    title: "AI Task Planner",
    description: "Break goals into prioritised tasks with suggested deadlines.",
    tag: "Planning",
  },
  {
    to: "/research",
    icon: Search,
    title: "AI Research Assistant",
    description: "Summarise topics and get key insights and recommendations.",
    tag: "Research",
  },
  {
    to: "/chat",
    icon: Bot,
    title: "AI Chatbot",
    description: "Ask your workplace assistant anything, in a natural conversation.",
    tag: "Assistant",
  },
] as const;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Dashboard() {
  return (
    <div className="space-y-8">
      <section className="surface-card relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary-soft blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-accent-foreground">
            <Sparkle className="h-3.5 w-3.5" /> Your AI toolkit
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{greeting()}. What shall we get done?</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Five focused assistants for the everyday work that eats your time. Every result is editable, copyable and
            easy to regenerate.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Bot className="h-4 w-4" /> Start a chat
            </Link>
            <Link
              to="/email"
              className="inline-flex items-center gap-2 rounded-xl border border-input bg-card px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
            >
              <Mail className="h-4 w-4" /> Draft an email
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="text-lg font-semibold">AI tools</h3>
            <p className="text-sm text-muted-foreground">Pick a tool to get started.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {TOOLS.map(({ to, icon: Icon, title, description, tag }) => (
            <Link key={to} to={to} className="surface-card surface-card-interactive group flex flex-col p-5">
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {tag}
                </span>
              </div>
              <h4 className="mt-4 font-semibold">{title}</h4>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
          <div className="surface-card flex flex-col justify-center border-dashed bg-transparent p-5 shadow-none">
            <h4 className="font-semibold">How it works</h4>
            <ol className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li>1. Give the tool a little context.</li>
              <li>2. Review and edit the generated result.</li>
              <li>3. Copy it, or regenerate for another take.</li>
            </ol>
          </div>
        </div>
      </section>

      <Disclaimer />
    </div>
  );
}
