"use client";

import { Bot, MessageCircle, Sparkles, User, Wrench } from "lucide-react";

import type { CoachingMessage } from "@/lib/mock-data";

export function TraceTimeline({ messages }: { messages: CoachingMessage[] }) {
  return (
    <ol className="relative px-5 lg:px-8 py-6 space-y-6">
      {/* Timeline rail */}
      <div className="absolute top-6 bottom-6 left-9 lg:left-12 w-px bg-border/60" />

      {messages.map((msg, i) => (
        <li key={i} className="relative pl-10 lg:pl-14">
          {/* Node */}
          <div
            className={`absolute left-5 lg:left-8 top-0.5 flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-card ${
              msg.role === "user"
                ? "bg-muted text-muted-foreground"
                : "bg-primary/15 text-primary ring-1 ring-primary/30"
            }`}
          >
            {msg.role === "user" ? (
              <User className="h-3.5 w-3.5" />
            ) : (
              <Bot className="h-3.5 w-3.5" />
            )}
          </div>

          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {msg.role === "user" ? "User / Tool result" : "Assistant"}
            </div>

            {typeof msg.content === "string" ? (
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
            ) : (
              <div className="space-y-2.5">
                {msg.content.map((block, bi) => {
                  if (block.type === "text") {
                    return (
                      <div
                        key={bi}
                        className="text-sm leading-relaxed whitespace-pre-wrap flex items-start gap-2"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <span>{block.text}</span>
                      </div>
                    );
                  }
                  if (block.type === "tool_use") {
                    return (
                      <div
                        key={bi}
                        className="rounded-xl border border-primary/30 bg-primary/[0.04] p-3"
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <Wrench className="h-3.5 w-3.5 text-primary" />
                          <span className="font-mono font-medium text-primary">
                            {block.name}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground ml-auto">
                            tool_use
                          </span>
                        </div>
                        <pre className="mt-2 text-[11px] font-mono text-muted-foreground whitespace-pre-wrap break-all">
                          {JSON.stringify(block.input, null, 2)}
                        </pre>
                      </div>
                    );
                  }
                  if (block.type === "tool_result") {
                    return (
                      <div
                        key={bi}
                        className="rounded-xl border border-border/60 bg-background/40 p-3"
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            tool_result
                          </span>
                        </div>
                        <pre className="mt-2 text-[11px] font-mono text-muted-foreground whitespace-pre-wrap break-all">
                          {prettyJson(block.content)}
                        </pre>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function prettyJson(s: string): string {
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch {
    return s;
  }
}
