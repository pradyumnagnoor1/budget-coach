"use client";

import { format, parseISO } from "date-fns";
import { Repeat } from "lucide-react";

import { formatCurrency } from "@/lib/format";
import { UPCOMING_RECURRING } from "@/lib/mock-data";

export function UpcomingRecurring() {
  const total = UPCOMING_RECURRING.reduce((s, x) => s + x.amount, 0);

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/30">
            <Repeat className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Coming up</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatCurrency(total)} across next 7 days
            </p>
          </div>
        </div>
      </div>

      <ul className="space-y-2.5">
        {UPCOMING_RECURRING.map((sub) => (
          <li
            key={sub.id}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex flex-col items-center justify-center h-9 w-9 rounded-lg bg-background/60 border border-border/60">
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground leading-none">
                  {format(parseISO(sub.nextChargeDate), "MMM")}
                </span>
                <span className="text-sm font-semibold leading-none mt-0.5">
                  {format(parseISO(sub.nextChargeDate), "d")}
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{sub.merchant}</div>
                <div className="text-[11px] text-muted-foreground capitalize">
                  {sub.cadence}
                </div>
              </div>
            </div>
            <div className="text-sm tabular font-medium">
              {formatCurrency(sub.amount)}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
