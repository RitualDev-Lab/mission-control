import { cookies } from "next/headers";

export const ALLOWED_ADMIN_USER = "divyanshujethi";
export const SESSION_COOKIE_NAME = "ritual_hq_session";

export interface AdminSession {
  user: string;
  name: string;
  avatarUrl: string;
  authenticatedAt: string;
  method: "oauth" | "token";
}

/**
 * Validates a GitHub Personal Access Token or OAuth Access Token against api.github.com/user
 * to ensure that only the verified owner 'divyanshujethi' is allowed entry.
 */
export async function verifyGitHubIdentity(token: string): Promise<AdminSession | null> {
  try {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${token}`,
        "User-Agent": "RitualDev-Mission-Control",
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    const user = await res.json();

    if (user.login.toLowerCase() !== ALLOWED_ADMIN_USER.toLowerCase()) {
      return null;
    }

    return {
      user: user.login,
      name: user.name || user.login,
      avatarUrl: user.avatar_url,
      authenticatedAt: new Date().toISOString(),
      method: "token",
    };
  } catch {
    return null;
  }
}

/**
 * Reads and verifies the current admin session from HTTP cookies or authorization header.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    // 1. Check direct environment default token if configured for seamless dev mode
    const defaultPat = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionCookie) {
      const decoded = JSON.parse(Buffer.from(sessionCookie, "base64").toString("utf-8")) as AdminSession;
      if (decoded.user.toLowerCase() === ALLOWED_ADMIN_USER.toLowerCase()) {
        return decoded;
      }
    }

    // Fallback: If defaultPat is set in local environment and valid for divyanshujethi
    if (defaultPat) {
      const verified = await verifyGitHubIdentity(defaultPat);
      if (verified) return verified;
    }

    return null;
  } catch {
    return null;
  }
}
