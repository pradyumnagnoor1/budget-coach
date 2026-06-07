import { redirect } from "next/navigation";

import { BACKEND_URL } from "@/lib/api";

/**
 * Cognito redirects here with ?code=...&state=... after Google sign-in.
 * We forward to the backend, which exchanges the code, sets the session
 * cookie, and bounces the user to /dashboard.
 *
 * Cookies are scoped by domain (not port), so the bc_oauth_state cookie
 * set by the backend on /auth/login at :8000 still rides this request.
 */
export default async function CallbackPage({
  searchParams,
}: PageProps<"/auth/callback">) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (typeof params.code === "string") qs.set("code", params.code);
  if (typeof params.state === "string") qs.set("state", params.state);
  if (typeof params.error === "string") qs.set("error", params.error);
  redirect(`${BACKEND_URL}/auth/callback?${qs.toString()}`);
}
