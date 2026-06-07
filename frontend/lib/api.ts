export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export const SIGN_IN_URL = `${BACKEND_URL}/auth/login`;
export const SIGN_OUT_URL = `${BACKEND_URL}/auth/logout`;

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  cognito_sub: string;
};

export async function fetchMe(): Promise<AuthenticatedUser | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as AuthenticatedUser;
  } catch {
    return null;
  }
}
