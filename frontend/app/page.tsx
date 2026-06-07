import Link from "next/link";
import { ArrowRight, Brain, Eye, Sparkles, TrendingUp } from "lucide-react";

import { SIGN_IN_URL } from "@/lib/api";

export default function LandingPage() {
  return (
    <div className="flex flex-col flex-1 bg-background relative overflow-hidden">
      {/* Background gradient orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full opacity-30 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.55) 0%, rgba(10, 14, 26, 0) 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -left-40 h-[400px] w-[600px] rounded-full opacity-20 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, rgba(10, 14, 26, 0) 70%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 lg:px-16 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/40">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="text-base font-semibold tracking-tight">Budget Coach</span>
        </div>
        <a
          href={SIGN_IN_URL}
          className="text-sm text-muted-foreground hover:text-foreground transition"
        >
          Sign in
        </a>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center text-center px-6 pt-20 pb-24 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Built on Claude · Real bank connections via Plaid
        </div>

        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
          The first budgeting app that tells you{" "}
          <span className="text-primary">what to do</span>.
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-xl">
          An AI coach watches your spending, knows your budgets, and only
          interrupts when there&apos;s something specific worth saying. Silence
          is built in.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <a
            href={SIGN_IN_URL}
            className="group inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition shadow-[0_0_40px_-10px_rgba(139,92,246,0.6)]"
          >
            Continue with Google
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </a>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl border border-border/60 bg-card/40 text-foreground hover:bg-card transition"
          >
            View the demo
          </Link>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Demo mode uses seeded data — no bank connection required.
        </p>
      </main>

      <section className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto px-6 lg:px-16 pb-24">
        <FeatureCard
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
          title="Forecast-forward"
          body="The hero number is what you can safely spend today — not what you spent last month. The app helps you decide, not just remember."
        />
        <FeatureCard
          icon={<Brain className="h-4 w-4 text-primary" />}
          title="Agentic, not chatbot"
          body="The coach autonomously chains through 12 financial tools, decides whether to alert you, and explains its reasoning. Most nights, it stays quiet."
        />
        <FeatureCard
          icon={<Eye className="h-4 w-4 text-primary" />}
          title="See the reasoning"
          body="Every coaching decision shows its full tool-call trace. You can audit what the agent looked at, what it considered, and why it spoke up."
        />
      </section>

      <footer className="relative z-10 border-t border-border/60 px-6 lg:px-16 py-6 text-xs text-muted-foreground flex items-center justify-between max-w-7xl mx-auto w-full">
        <span>© 2026 Budget Coach</span>
        <span className="flex items-center gap-4">
          <a href="#" className="hover:text-foreground transition">Privacy</a>
          <a href="#" className="hover:text-foreground transition">Terms</a>
          <a href="#" className="hover:text-foreground transition">GitHub</a>
        </span>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-5 hover:bg-card/80 transition">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/30">
          {icon}
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
