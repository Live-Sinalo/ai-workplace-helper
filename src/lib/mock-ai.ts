// Temporary mock AI engine. Frontend only: nothing is sent or stored anywhere.

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)] as T;

function firstSentence(text: string, fallback: string) {
  const s = text.trim().split(/[.\n!?]/)[0]?.trim();
  return s && s.length > 3 ? s : fallback;
}

export type EmailTone = "formal" | "friendly" | "persuasive";

export async function generateEmail(input: {
  recipient: string;
  purpose: string;
  points: string;
  tone: EmailTone;
}): Promise<string> {
  await wait(900 + Math.random() * 600);
  const name = input.recipient.trim() || "there";
  const topic = firstSentence(input.purpose, "our upcoming project");
  const points = input.points
    .split(/\n|;/)
    .map((p) => p.trim())
    .filter(Boolean);
  const bullets = points.length
    ? points.map((p) => `• ${p}`).join("\n")
    : "• Confirm the timeline and key milestones\n• Align on responsibilities and next steps";

  const openers: Record<EmailTone, string[]> = {
    formal: [
      `Dear ${name},\n\nI hope this message finds you well. I am writing regarding ${topic}.`,
      `Dear ${name},\n\nThank you for your time. I would like to follow up on ${topic}.`,
    ],
    friendly: [
      `Hi ${name},\n\nHope your week is going well! I wanted to touch base about ${topic}.`,
      `Hey ${name},\n\nQuick note on ${topic} — I think we're in a great spot.`,
    ],
    persuasive: [
      `Hi ${name},\n\nI'll keep this brief, because I believe ${topic} is an opportunity we shouldn't let pass.`,
      `Hello ${name},\n\nThere's a strong case for moving forward on ${topic}, and I'd love your support.`,
    ],
  };
  const closers: Record<EmailTone, string[]> = {
    formal: [
      `Please let me know if you require any further information. I look forward to your response.\n\nKind regards,\n[Your name]`,
      `I would appreciate your feedback at your earliest convenience.\n\nSincerely,\n[Your name]`,
    ],
    friendly: [
      `Let me know what you think — happy to chat whenever suits you.\n\nThanks so much,\n[Your name]`,
      `Looking forward to hearing from you!\n\nCheers,\n[Your name]`,
    ],
    persuasive: [
      `Can we lock in 20 minutes this week to move this forward? I'm confident the results will speak for themselves.\n\nBest,\n[Your name]`,
      `The sooner we act, the greater the return. I'd welcome the chance to walk you through the details.\n\nWarm regards,\n[Your name]`,
    ],
  };
  const middles: Record<EmailTone, string> = {
    formal: "To summarise the key points:",
    friendly: "Here's the quick rundown:",
    persuasive: "Here's why this matters:",
  };

  return `${pick(openers[input.tone])}\n\n${middles[input.tone]}\n${bullets}\n\n${pick(closers[input.tone])}`;
}

export interface MeetingSummary {
  summary: string;
  decisions: string[];
  actions: { task: string; owner: string; due: string }[];
}

export async function summarizeMeeting(notes: string): Promise<MeetingSummary> {
  await wait(1000 + Math.random() * 600);
  const lines = notes
    .split(/\n|(?<=[.!?])\s+/)
    .map((l) => l.replace(/^[-•*\d.)\s]+/, "").trim())
    .filter((l) => l.length > 8);
  const owners = ["Alex", "Priya", "Sam", "Jordan", "Taylor"];
  const dues = ["Fri", "next Mon", "end of week", "in 2 weeks", "next sprint"];
  const decisionsFromNotes = lines.filter((l) => /decid|agree|approve|will|go with|final/i.test(l));
  const actionsFromNotes = lines.filter((l) => /need|should|follow|send|prepare|review|schedule|draft|update/i.test(l));

  const decisions = (decisionsFromNotes.length ? decisionsFromNotes : lines).slice(0, 3);
  const actions = (actionsFromNotes.length ? actionsFromNotes : lines.slice(1)).slice(0, 4);

  return {
    summary:
      lines.length > 0
        ? `The team met to discuss ${firstSentence(lines[0] ?? "", "project progress").toLowerCase()}. ${
            lines.length > 2 ? `Discussion covered ${lines.length} key points, ` : "Discussion focused on priorities, "
          }with alignment reached on next steps and clear ownership assigned for follow-up items.`
        : "The team met to discuss project progress and aligned on next steps.",
    decisions: decisions.length
      ? decisions
      : ["Proceed with the proposed approach", "Revisit scope at the next check-in"],
    actions: (actions.length ? actions : ["Share meeting recap with stakeholders", "Schedule follow-up session"]).map(
      (task, i) => ({ task, owner: owners[i % owners.length] ?? "Team", due: dues[i % dues.length] ?? "TBD" }),
    ),
  };
}

export type Priority = "High" | "Medium" | "Low";
export interface PlannedTask {
  id: string;
  title: string;
  priority: Priority;
  deadline: string;
  done: boolean;
}

export async function planTasks(goal: string, timeframe: string): Promise<PlannedTask[]> {
  await wait(1000 + Math.random() * 500);
  const g = firstSentence(goal, "the goal");
  const days = /week/i.test(timeframe) ? 7 : /month/i.test(timeframe) ? 30 : /quarter/i.test(timeframe) ? 90 : 14;
  const fmt = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };
  const templates: { title: string; priority: Priority; at: number }[] = [
    { title: `Define success criteria and scope for "${g}"`, priority: "High", at: 0.08 },
    { title: `Research and gather requirements`, priority: "High", at: 0.2 },
    { title: `Draft an initial plan and share with stakeholders`, priority: "Medium", at: 0.35 },
    { title: `Execute core work for ${g.toLowerCase()}`, priority: "High", at: 0.6 },
    { title: `Review progress and collect feedback`, priority: "Medium", at: 0.8 },
    { title: `Finalise, document and communicate results`, priority: "Low", at: 1 },
  ];
  return templates.map((t, i) => ({
    id: `${Date.now()}-${i}`,
    title: t.title,
    priority: t.priority,
    deadline: fmt(Math.max(1, Math.round(days * t.at))),
    done: false,
  }));
}

export interface ResearchResult {
  summary: string;
  insights: string[];
  recommendations: string[];
}

export async function research(topic: string): Promise<ResearchResult> {
  await wait(1100 + Math.random() * 600);
  const t = firstSentence(topic, "this topic");
  return {
    summary: `${t} is an area of growing relevance in modern workplaces. Current thinking emphasises a balance between efficiency gains and thoughtful governance, with early adopters reporting measurable improvements when adoption is paired with clear guidelines and training. Sources broadly agree that outcomes depend more on implementation quality than on the tools themselves.`,
    insights: [
      `Adoption of ${t.toLowerCase()} is accelerating, but maturity varies widely across teams.`,
      "Organisations that define clear success metrics up front see higher return on effort.",
      "Change management and training are consistently cited as the biggest determinants of success.",
      "Risks are mostly operational (quality, consistency) rather than technical.",
    ],
    recommendations: [
      `Run a focused 4–6 week pilot on ${t.toLowerCase()} with one team before wider rollout.`,
      "Establish a lightweight review process for outputs used in decisions.",
      "Track two or three concrete metrics (time saved, quality, satisfaction).",
      "Share learnings across teams to avoid duplicated effort.",
    ],
  };
}

export async function chatReply(prompt: string): Promise<string> {
  await wait(700 + Math.random() * 600);
  const p = prompt.toLowerCase();
  if (/hello|hi\b|hey/.test(p)) return "Hello! I'm your workplace assistant. I can help draft emails, plan tasks, summarise notes, or think through a problem. What are you working on?";
  if (/email|write to|message/.test(p))
    return "Happy to help with that email. For the best result, tell me:\n\n1. Who it's for\n2. What you want them to do\n3. The tone you'd like (formal, friendly or persuasive)\n\nOr open the **Smart Email Generator** for a guided version.";
  if (/meeting|notes|summar/.test(p))
    return "I can turn meeting notes into a crisp summary with decisions and action items. Paste the notes here, or use the **Meeting Notes Summarizer** for a structured output you can edit and copy.";
  if (/task|plan|goal|deadline|priorit/.test(p))
    return "Let's break that down. A good approach is:\n\n- **Clarify the outcome** — what does done look like?\n- **List the steps** — 4–6 concrete tasks\n- **Prioritise** — what unblocks everything else?\n- **Set deadlines** — work backwards from your target date\n\nWant me to draft a task list? Tell me the goal and timeframe.";
  if (/research|explain|what is|how does/.test(p))
    return `Here's a quick overview:\n\n"${prompt.trim()}" touches on a few key ideas. In short, the most useful framing is to look at *why it matters*, *what the main trade-offs are*, and *what action you can take next*.\n\nWould you like a deeper summary with key insights and recommendations? The **Research Assistant** can help with that.`;
  if (/thank/.test(p)) return "You're welcome! Let me know if there's anything else I can help with.";
  return pick([
    `Good question. Based on what you've shared — "${prompt.trim()}" — I'd suggest starting by clarifying the outcome you want, then identifying the one or two actions that would move it forward this week. Want me to turn that into a plan?`,
    `Here's how I'd approach "${prompt.trim()}":\n\n1. Gather the relevant context\n2. Identify stakeholders and constraints\n3. Draft a short proposal or next step\n\nI can help with any of these — just let me know which.`,
    `Thanks for the context. A practical next step for "${prompt.trim()}" is to write down the decision you need to make and the information you're missing. From there I can help draft a message, a plan, or a summary.`,
  ]);
}
