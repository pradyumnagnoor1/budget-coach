import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full opacity-20 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(10, 14, 26, 0) 70%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-border/60">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/40">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Budget Coach</span>
        </Link>
        <Link
          href="/dashboard"
          className="text-xs text-muted-foreground hover:text-foreground transition"
        >
          Skip to demo
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center px-6 py-10 lg:py-16">
        {children}
      </main>
    </div>
  );
}
