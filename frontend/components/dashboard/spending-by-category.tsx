"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatCurrency } from "@/lib/format";
import { getSpendingByCategory } from "@/lib/mock-data";

export function SpendingByCategory() {
  const data = getSpendingByCategory();
  const total = data.reduce((s, d) => s + d.spent, 0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 lg:p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-base font-semibold">Where it went</h2>
          <p className="text-xs text-muted-foreground mt-0.5">May 2026</p>
        </div>
        <span className="text-xs text-muted-foreground tabular">
          Total: {formatCurrency(total)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-4 items-center">
        <div className="h-52 -ml-2">
          {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="spent"
                innerRadius={56}
                outerRadius={88}
                strokeWidth={0}
                paddingAngle={2}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.category.color} />
                ))}
              </Pie>
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  fontSize: 12,
                  padding: "8px 12px",
                }}
                formatter={(value: number) => [formatCurrency(value), ""]}
                labelFormatter={(_, payload) => {
                  const cat = payload?.[0]?.payload?.category;
                  return cat?.name ?? "";
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          )}
        </div>

        <ul className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {data.slice(0, 6).map((d) => {
            const pct = total ? Math.round((d.spent / total) * 100) : 0;
            return (
              <li key={d.category.id} className="flex items-center gap-2.5 text-xs">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: d.category.color }}
                />
                <span className="flex-1 truncate">{d.category.name}</span>
                <span className="text-muted-foreground tabular">{pct}%</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
