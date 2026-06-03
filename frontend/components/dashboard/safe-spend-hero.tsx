"use client";

import { Info, Sparkles } from "lucide-react";

import { formatCurrency } from "@/lib/format";
import { computeSafeToSpendToday } from "@/lib/mock-data";

export function SafeSpendHero() {
  const { amount, daysLeftInMonth, rationale } = computeSafeToSpendToday();

  return (
    <section className="rounded-3xl border border-border/60 bg-card relative overflow-hidden">
      {/* Soft accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 h-[400px] w-[400px] rounded-full opacity-25 blur-[110px]"
        style={{
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.7) 0%, rgba(19, 24, 37, 0) 70%)",
        }}
      />

      <div className="relative p-7 lg:p-10">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Safe to spend today · Computed by the coach
        </div>
        <div className="flex items-baseline gap-4 mt-3">
          <div className="text-7xl lg:text-8xl font-semibold tracking-tight tabular leading-none">
            {formatCurrency(amount, { compact: true })}
          </div>
          <div className="text-sm text-muted-foreground hidden md:flex flex-col">
            <span>
              <span className="text-foreground">{daysLeftInMonth} days</span> left in June
            </span>
            <span>Updated 4 min ago</span>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-2 max-w-2xl rounded-xl border border-border/60 bg-background/40 p-3.5">
          <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground leading-relaxed">{rationale}</p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 max-w-2xl">
          <Stat label="Monthly income" value={5800} positive />
          <Stat label="Spent this month" value={387} />
          <Stat label="Going to savings" value={420} positive />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, positive }: { label: string; value: number; positive?: boolean }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/30 p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 text-lg font-semibold tabular ${positive ? "text-success" : "text-foreground"}`}
      >
        {positive ? "+" : ""}
        {formatCurrency(value, { compact: true })}
      </div>
    </div>
  );
}
