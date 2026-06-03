"use client";

import { format, parseISO } from "date-fns";
import { ExternalLink, Repeat } from "lucide-react";

import { CATEGORY_BY_ID, SUBSCRIPTIONS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";

export default function SubscriptionsPage() {
  const totalMonthly = SUBSCRIPTIONS.filter((s) => s.cadence === "monthly").reduce(
    (sum, s) => sum + s.amount,
    0
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {SUBSCRIPTIONS.length} active recurring charges · detected automatically
        </p>
      </header>

      <section className="rounded-2xl border border-border/60 bg-card p-5 lg:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Total monthly
            </div>
            <div className="text-3xl font-semibold tabular mt-1">
              {formatCurrency(totalMonthly)}
            </div>
          </div>
          <Repeat className="h-5 w-5 text-primary" />
        </div>

        <ul className="divide-y divide-border/40">
          {SUBSCRIPTIONS.map((s) => {
            const cat = CATEGORY_BY_ID[s.categoryId];
            return (
              <li key={s.id} className="py-3.5 flex items-center gap-3 group">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-base"
                  style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                >
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{s.merchant}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Next charge {format(parseISO(s.nextChargeDate), "MMM d")} · {cat.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm tabular font-medium">{formatCurrency(s.amount)}</div>
                  <div className="text-[11px] text-muted-foreground capitalize">{s.cadence}</div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 ml-2">
                  Cancel
                  <ExternalLink className="h-3 w-3" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
