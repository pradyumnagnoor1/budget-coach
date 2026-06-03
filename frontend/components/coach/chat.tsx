"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Bot,
  Check,
  Loader2,
  Sparkles,
  Wrench,
} from "lucide-react";

import { COACHING_RUNS } from "@/lib/mock-data";

type StreamItem =
  | { kind: "tool"; name: string; args: string; status: "running" | "done" }
  | { kind: "text"; text: string };

type Message =
  | { role: "user"; text: string }
  | { role: "assistant"; items: StreamItem[]; streaming: boolean };

const STARTERS = [
  "Can I afford a $90 dinner this weekend?",
  "What did I spend on coffee last month?",
  "Why is dining over budget?",
  "Cancel anything I haven't used?",
];

/**
 * Simulated agent response sequence. Until the backend SSE is wired up,
 * this mimics what a real Claude tool-use stream would feel like.
 */
const SCRIPT: StreamItem[] = [
  {
    kind: "tool",
    name: "get_budget_for_category",
    args: '{"category": "Dining out"}',
    status: "running",
  },
  {
    kind: "tool",
    name: "calculate_safe_daily_spend",
    args: '{"target_date": "2026-06-08"}',
    status: "running",
  },
  {
    kind: "tool",
    name: "get_upcoming_recurring",
    args: '{"days_ahead": 7}',
    status: "running",
  },
  {
    kind: "text",
    text: "Honest answer: a $90 dinner this weekend lands you at about $362 in dining — $112 over your $250 budget. You've got two recurring charges ($30) and groceries ($60ish) coming this week, so going through with it would push your safe-to-spend down to around $14/day for the rest of June.\n\nIf you want to do it without a tradeoff, push it to next Saturday — by then you'll have your June 5 paycheck cleared, which gives you room.",
  },
];

export function CoachChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim()) return;
    setInput("");
    setMessages((m) => [
      ...m,
      { role: "user", text },
      { role: "assistant", items: [], streaming: true },
    ]);

    // Simulate streamed tool calls + final text
    let i = 0;
    const queue = SCRIPT.slice();

    const interval = setInterval(() => {
      if (i >= queue.length) {
        // Mark all running tools done, end streaming
        setMessages((m) => {
          const next = [...m];
          const last = next[next.length - 1];
          if (last?.role === "assistant") {
            next[next.length - 1] = {
              ...last,
              items: last.items.map((it) =>
                it.kind === "tool" ? { ...it, status: "done" } : it
              ),
              streaming: false,
            };
          }
          return next;
        });
        clearInterval(interval);
        return;
      }
      const item = queue[i];
      setMessages((m) => {
        const next = [...m];
        const last = next[next.length - 1];
        if (last?.role === "assistant") {
          next[next.length - 1] = { ...last, items: [...last.items, item] };
        }
        return next;
      });
      i += 1;
    }, 650);
  }

  const recentRuns = COACHING_RUNS.slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 max-w-6xl mx-auto h-[calc(100vh-9rem)]">
      <section className="flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/40">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Your coach</h2>
              <p className="text-[11px] text-muted-foreground">
                Claude Sonnet · 12 tools available · streams reasoning
              </p>
            </div>
          </div>
          <span className="text-[11px] text-success flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Online
          </span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/30 mb-4">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Ask me anything about your money.</h3>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
                I&apos;ll pull from your actual transactions and budgets. You&apos;ll
                see every tool call I make, in real time.
              </p>

              <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-sm rounded-xl border border-border/60 bg-background/40 hover:bg-background/70 hover:border-border/80 px-3.5 py-3 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, mi) => (
            <div key={mi} className="space-y-3">
              {m.role === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-2.5 text-sm">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {m.items.map((item, ii) => {
                    if (item.kind === "tool") {
                      const running = item.status === "running" && m.streaming && ii === m.items.length - 1;
                      return (
                        <div
                          key={ii}
                          className="rounded-xl border border-border/60 bg-background/40 px-3.5 py-2.5"
                        >
                          <div className="flex items-center gap-2 text-xs">
                            <Wrench className="h-3.5 w-3.5 text-primary" />
                            <span className="font-mono font-medium text-foreground">{item.name}</span>
                            <span className="font-mono text-muted-foreground/80 truncate">{item.args}</span>
                            <span className="ml-auto flex items-center gap-1 text-[10px] uppercase tracking-wider">
                              {running ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                  <span className="text-primary">Running</span>
                                </>
                              ) : (
                                <>
                                  <Check className="h-3 w-3 text-success" />
                                  <span className="text-success">Done</span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={ii}
                        className="max-w-[85%] rounded-2xl rounded-bl-md bg-card border border-border/60 px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed"
                      >
                        {item.text}
                      </div>
                    );
                  })}
                  {m.streaming && (
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pl-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Thinking…
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-border/60 p-3"
        >
          <div className="flex items-end gap-2 rounded-xl border border-border/60 bg-background/40 px-3 py-2 focus-within:ring-2 focus-within:ring-ring transition">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask your coach…"
              className="flex-1 resize-none bg-transparent outline-none text-sm placeholder:text-muted-foreground/70 max-h-32"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </form>
      </section>

      <aside className="hidden lg:flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="px-4 py-4 border-b border-border/60">
          <h3 className="text-sm font-semibold">Recent runs</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Both your chats and the nightly coach
          </p>
        </div>
        <ul className="flex-1 overflow-y-auto divide-y divide-border/40">
          {recentRuns.map((r) => (
            <li key={r.id}>
              <a
                href={`/coach/runs/${r.id}`}
                className="block px-4 py-3.5 hover:bg-background/40 transition"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
                      r.triggerType === "proactive"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {r.triggerType === "proactive" ? "Nightly" : "Chat"}
                  </span>
                  {r.notificationSent && (
                    <span className="text-[10px] text-warning">· notified</span>
                  )}
                </div>
                <div className="text-xs text-foreground line-clamp-2 leading-snug">
                  {r.userDirective ?? r.finalOutput}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1.5 tabular flex items-center gap-2">
                  <span>{r.iterations} iter</span>
                  <span>·</span>
                  <span>{r.totalTokensInput + r.totalTokensOutput} tok</span>
                  <span>·</span>
                  <span>${r.costUsd.toFixed(4)}</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
