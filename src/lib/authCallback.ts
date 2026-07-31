import { supabase } from "@/integrations/supabase/client";

/**
 * Email-verification / auth callback plumbing shared by the web callback
 * route and the native deep-link bridge.
 *
 * Supabase can hand the callback back in three shapes depending on the
 * configured flow, so all of them are handled:
 *  - PKCE:      ?code=...
 *  - implicit:  #access_token=...&refresh_token=...
 *  - OTP link:  ?token_hash=...&type=signup
 */

/** Custom URL scheme registered by the native apps. */
export const APP_SCHEME = "mindfulmovement";
/** Public HTTPS origin used for Universal Links / App Links. */
export const APP_UNIVERSAL_ORIGIN = "https://mindfulmovement.lovable.app";

export interface AuthCallbackParams {
  code: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenHash: string | null;
  type: string | null;
  errorMessage: string | null;
}

export function parseAuthCallbackParams(rawUrl: string): AuthCallbackParams {
  let query = new URLSearchParams();
  let hash = new URLSearchParams();
  try {
    const url = new URL(rawUrl);
    query = url.searchParams;
    hash = new URLSearchParams(url.hash.replace(/^#/, ""));
  } catch {
    /* malformed URL — fall through with empty params */
  }
  const pick = (key: string) => query.get(key) ?? hash.get(key);
  return {
    code: pick("code"),
    accessToken: pick("access_token"),
    refreshToken: pick("refresh_token"),
    tokenHash: pick("token_hash"),
    type: pick("type"),
    errorMessage:
      pick("error_description") ?? pick("error") ?? null,
  };
}

export function hasAuthCallbackPayload(rawUrl: string): boolean {
  const p = parseAuthCallbackParams(rawUrl);
  return !!(p.code || p.accessToken || p.tokenHash || p.errorMessage);
}

export interface CompleteAuthResult {
  ok: boolean;
  error: string | null;
}

/**
 * Turn a verification callback URL into a real Supabase session.
 * Safe to call twice for the same URL — a second attempt with an already
 * consumed token resolves as ok when a session is present.
 */
export async function completeAuthFromUrl(rawUrl: string): Promise<CompleteAuthResult> {
  const p = parseAuthCallbackParams(rawUrl);
  if (p.errorMessage) return { ok: false, error: p.errorMessage };

  try {
    if (p.accessToken && p.refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: p.accessToken,
        refresh_token: p.refreshToken,
      });
      if (!error) return { ok: true, error: null };
      return await fallbackToExistingSession(error.message);
    }

    if (p.code) {
      const { error } = await supabase.auth.exchangeCodeForSession(p.code);
      if (!error) return { ok: true, error: null };
      return await fallbackToExistingSession(error.message);
    }

    if (p.tokenHash) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: p.tokenHash,
        type: (p.type as "signup" | "email" | "recovery" | "invite" | "magiclink") ?? "signup",
      });
      if (!error) return { ok: true, error: null };
      return await fallbackToExistingSession(error.message);
    }
  } catch (err) {
    return await fallbackToExistingSession(
      err instanceof Error ? err.message : "Verification failed",
    );
  }

  // No payload at all — the session may already be established (Supabase's
  // client can consume the URL itself before we get here).
  return await fallbackToExistingSession(null);
}

async function fallbackToExistingSession(error: string | null): Promise<CompleteAuthResult> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session) return { ok: true, error: null };
  } catch {
    /* ignore */
  }
  return { ok: false, error };
}

/**
 * Best-effort attempt to hand off from a mobile browser into the installed
 * native app. Tries the custom scheme first (works when the app is
 * installed) and falls back to the HTTPS Universal Link / App Link.
 */
export function openInstalledApp(path = "/"): void {
  if (typeof window === "undefined") return;
  const clean = path.startsWith("/") ? path : `/${path}`;
  const schemeUrl = `${APP_SCHEME}://${clean.replace(/^\//, "")}`;
  const universalUrl = `${APP_UNIVERSAL_ORIGIN}${clean}`;

  let handedOff = false;
  const onHide = () => {
    handedOff = true;
  };
  document.addEventListener("visibilitychange", onHide, { once: true });
  window.addEventListener("pagehide", onHide, { once: true });

  window.location.href = schemeUrl;

  window.setTimeout(() => {
    document.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("pagehide", onHide);
    if (!handedOff && !document.hidden) {
      // App not installed (or scheme blocked) — the HTTPS link opens the app
      // when Universal/App Links are verified, otherwise stays in browser.
      window.location.href = universalUrl;
    }
  }, 1200);
}

/** Heuristic: is this a phone/tablet browser where the app could be installed? */
export function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod|android/i.test(navigator.userAgent);
}