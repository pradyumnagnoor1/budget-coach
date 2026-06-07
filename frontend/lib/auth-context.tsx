"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { fetchMe, type AuthenticatedUser } from "@/lib/api";
import { MOCK_USER } from "@/lib/mock-data";

type DisplayUser = {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  isAuthenticated: boolean;
};

const fallback: DisplayUser = {
  id: MOCK_USER.id,
  name: MOCK_USER.name,
  email: MOCK_USER.email,
  avatarInitials: MOCK_USER.avatarInitials,
  isAuthenticated: false,
};

const AuthContext = createContext<{ user: DisplayUser; isLoading: boolean }>({
  user: fallback,
  isLoading: true,
});

function toDisplay(u: AuthenticatedUser): DisplayUser {
  const initials = u.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatarInitials: initials || "?",
    isAuthenticated: true,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DisplayUser>(fallback);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchMe().then((u) => {
      if (cancelled) return;
      if (u) setUser(toDisplay(u));
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
