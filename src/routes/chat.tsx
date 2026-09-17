import { createFileRoute } from "@tanstack/react-router";
import { Bot, Copy, RefreshCw, SendHorizonal, Trash2, User } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Disclaimer } from "@/components/ai-shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatReply } from "@/lib/mock-ai";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot – Workplace AI" },
      { name: "description", content: "An interactive workplace assistant for quick answers, drafts and planning." },
      { property: "og:title", content: "AI Chatbot – Workplace AI" },
      { property: "og:description", content: "An interactive workplace assistant for quick answers, drafts and planning." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const STARTERS = [
  "Help me write a status update for my manager",
  "How should I prioritise my week?",
  "Summarise the pros and cons of async standups",
  "Draft a polite reminder email",
];

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function Markdownish({ text }: { text: string }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return null;
        const bullet = line.match(/^[-•]\s+(.*)/);
        const num = line.match(/^(\d+)\.\s+(.*)/);
        if (bullet) return <p key={i} className="flex gap-2 pl-1"><span className="text-primary">•</span><span>{inline(bullet[1])}</span></p>;
        if (num) return <p key={i} className="flex gap-2 pl-1"><span className="font-semibold text-primary">{num[1]}.</span><span>{inline(num[2])}</span></p>;
        return <p key={i}>{inline(line)}</p>;
      })}
    </div>
  );
}

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || thinking) return;
    setInput("");
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", content: t }]);
    setThinking(true);
    const reply = await chatReply(t);
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: reply }]);
    setThinking(false);
  };

  const regenerate = async () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser || thinking) return;
    setMessages((m) => (m[m.length - 1]?.role === "assistant" ? m.slice(0, -1) : m));
    setThinking(true);
    const reply = await chatReply(lastUser.content);
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: reply }]);
    setThinking(false);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] min-h-[520px] flex-col">
      <div className="surface-card flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">Workplace Assistant</p>
              <p className="text-[11px] text-muted-foreground">Session only · not saved</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setMessages([])}>
              <Trash2 /> Clear
            </Button>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
                <Bot className="h-7 w-7" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">How can I help today?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Ask about drafting, planning, summarising, or anything work-related.
              </p>
              <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="rounded-xl border border-input px-3 py-2.5 text-left text-sm transition-colors hover:border-primary/50 hover:bg-accent/50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-5">
              {messages.map((m, i) => {
                const isLast = i === messages.length - 1;
                return (
                  <div key={m.id} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                    <span
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                        m.role === "user" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground",
                      )}
                    >
                      {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </span>
                    <div className={cn("min-w-0 max-w-[85%]", m.role === "user" && "text-right")}>
                      {m.role === "user" ? (
                        <p className="inline-block rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-left text-sm text-primary-foreground">
                          {m.content}
                        </p>
                      ) : (
                        <div className="rounded-2xl rounded-tl-sm bg-muted/60 px-4 py-3">
                          <Markdownish text={m.content} />
                          <div className="mt-2 flex gap-1 border-t border-border/60 pt-2">
                            <button
                              type="button"
                              onClick={async () => {
                                await navigator.clipboard.writeText(m.content);
                                toast.success("Copied to clipboard");
                              }}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                              <Copy className="h-3 w-3" /> Copy
                            </button>
                            {isLast && (
                              <button
                                type="button"
                                onClick={regenerate}
                                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              >
                                <RefreshCw className="h-3 w-3" /> Regenerate
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {thinking && (
                <div className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-muted/60 px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="border-t border-border p-3 sm:p-4">
          <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-input bg-background p-2 focus-within:ring-1 focus-within:ring-ring">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              rows={1}
              placeholder="Message your assistant…"
              className="max-h-40 min-h-10 flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
              aria-label="Message"
            />
            <Button type="submit" size="icon" className="shrink-0 rounded-xl" disabled={!input.trim() || thinking} aria-label="Send">
              <SendHorizonal />
            </Button>
          </div>
        </form>
      </div>
      <Disclaimer className="mt-4" />
    </div>
  );
}
