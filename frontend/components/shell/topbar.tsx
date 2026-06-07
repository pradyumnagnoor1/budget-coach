"use client";

import { Bell, LogOut, Search } from "lucide-react";

import { SIGN_OUT_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { NOTIFICATIONS } from "@/lib/mock-data";

export function Topbar() {
  const { user } = useAuth();
  const unread = NOTIFICATIONS.filter((n) => !n.readAt).length;

  return (
    <header className="flex items-center justify-between gap-4 px-6 lg:px-10 py-4 border-b border-border/60 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-3 max-w-md w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transactions, merchants, categories…"
            className="w-full rounded-lg bg-card/60 border border-border/60 pl-9 pr-3 py-1.5 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!user.isAuthenticated && (
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border/60 px-2 py-1 rounded">
            Demo mode
          </span>
        )}

        <button
          aria-label="Notifications"
          className="relative h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border/60 bg-card/60 hover:bg-card transition"
        >
          <Bell className="h-4 w-4 text-foreground/80" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-[10px] font-semibold text-primary-foreground flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2.5 pl-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 ring-1 ring-primary/40 flex items-center justify-center text-xs font-semibold text-primary">
            {user.avatarInitials}
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-medium">{user.name.split(" ")[0]}</span>
            <span className="text-[11px] text-muted-foreground">{user.email}</span>
          </div>
          {user.isAuthenticated && (
            <form action={SIGN_OUT_URL} method="POST">
              <button
                type="submit"
                aria-label="Sign out"
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-card/60 transition ml-1"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
