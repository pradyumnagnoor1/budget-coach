"use client";

import Link from "next/link";
import { ArrowRight, Bell, MessageSquare } from "lucide-react";

import { NOTIFICATIONS } from "@/lib/mock-data";

export function CoachCard() {
  const latest = NOTIFICATIONS[0];
  if (!latest) return null;

  return (
    <section className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.08] via-card to-card p-5 lg:p-6 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full opacity-30 blur-3xl bg-primary"
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-primary font-medium uppercase tracking-wider">
            <Bell className="h-3.5 w-3.5" />
            From your coach · 14h ago
          </div>
          <Link
            href={`/coach/runs/${latest.coachingRunId}`}
            className="text-xs text-muted-foreground hover:text-foreground transition"
          >
            See reasoning →
          </Link>
        </div>

        <h3 className="text-lg font-semibold mb-2">{latest.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {latest.message}
        </p>

        <Link
          href="/coach"
          className="mt-5 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition"
        >
          <MessageSquare className="h-4 w-4" />
          Ask a follow-up
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
