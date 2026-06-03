import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Bell, Clock, DollarSign, Hash } from "lucide-react";

import { TraceTimeline } from "@/components/coach/trace-timeline";
import { COACHING_RUNS } from "@/lib/mock-data";

export default async function CoachRunPage({ params }: PageProps<"/coach/runs/[id]">) {
  const { id } = await params;
  const run = COACHING_RUNS.find((r) => r.id === id);
  if (!run) notFound();

  const start = parseISO(run.startedAt);
  const end = parseISO(run.completedAt);
  const durationSec = Math.round((end.getTime() - start.getTime()) / 1000);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href="/coach"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to coach
      </Link>

      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
              run.triggerType === "proactive"
                ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                : "bg-muted text-muted-foreground ring-1 ring-border"
            }`}
          >
            {run.triggerType === "proactive" ? "Nightly run" : "Chat"}
          </span>
          {run.notificationSent && (
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-warning/10 text-warning ring-1 ring-warning/30 flex items-center gap-1">
              <Bell className="h-3 w-3" />
              Sent a notification
            </span>
          )}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {run.userDirective ?? "Nightly coach check-in"}
        </h1>
        <div className="flex items-center gap-5 text-xs text-muted-foreground tabular flex-wrap">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {format(start, "MMM d, h:mm a")}
          </span>
          <span className="flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5" />
            {run.iterations} iterations · {durationSec}s
          </span>
          <span className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />
            {(run.totalTokensInput + run.totalTokensOutput).toLocaleString()}{" "}
            tokens · ${run.costUsd.toFixed(4)}
          </span>
        </div>
      </header>

      {/* Coach's final answer */}
      <section className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-5 lg:p-6">
        <div className="text-[11px] uppercase tracking-wider text-primary font-semibold mb-2">
          Coach&apos;s decision
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{run.finalOutput}</p>
      </section>

      {/* System prompt — collapsible */}
      <details className="rounded-2xl border border-border/60 bg-card overflow-hidden group">
        <summary className="px-5 py-4 cursor-pointer text-sm font-medium flex items-center justify-between hover:bg-card/80 transition">
          <span>System prompt</span>
          <span className="text-xs text-muted-foreground">Click to expand</span>
        </summary>
        <pre className="px-5 pb-5 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-mono">
          {run.systemPrompt}
        </pre>
      </details>

      {/* The actual trace */}
      <section className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border/60">
          <h2 className="text-sm font-semibold">Reasoning trace</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Every tool call, every result, every line of reasoning.
          </p>
        </div>
        <TraceTimeline messages={run.messages} />
      </section>
    </div>
  );
}
