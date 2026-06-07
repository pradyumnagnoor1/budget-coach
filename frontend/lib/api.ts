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

// ---------- Plaid ----------

export type PlaidExchangeResult = {
  plaid_item_id: string;
  institution_name: string | null;
  accounts_synced: number;
  transactions_added: number;
};

async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ""}`);
  }
  return (await res.json()) as T;
}

export async function createPlaidLinkToken(): Promise<string> {
  const data = await postJson<{ link_token: string }>("/api/plaid/link-token");
  return data.link_token;
}

export async function exchangePlaidPublicToken(
  publicToken: string
): Promise<PlaidExchangeResult> {
  return postJson<PlaidExchangeResult>("/api/plaid/exchange", {
    public_token: publicToken,
  });
}
