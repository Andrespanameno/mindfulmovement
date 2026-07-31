import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/useProfile";

const PUBLIC_ROUTES = new Set(["/", "/reset-password", "/auth/callback"]);

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isPublic = PUBLIC_ROUTES.has(pathname);
  const isOnboarding = pathname === "/onboarding";
  const needsOnboarding = !!profile && !profile.onboarding_completed;
  // A signed-in user on a protected screen must not paint anything until we
  // know their onboarding status — otherwise Home flashes for a frame right
  // after email verification.
  const awaitingProfile = !!session && !isPublic && !isOnboarding && (profileLoading || !profile);

  useEffect(() => {
    if (loading) return;
    if (!session && !isPublic) {
      navigate({ to: "/", replace: true });
      return;
    }
    if (session && pathname === "/") {
      // Route first-time users straight to onboarding; never via /home.
      if (profileLoading || !profile) return;
      navigate({ to: needsOnboarding ? "/onboarding" : "/home", replace: true });
      return;
    }
    if (session && !profileLoading && needsOnboarding && !isOnboarding && !isPublic) {
      navigate({ to: "/onboarding", replace: true });
      return;
    }
    if (session && profile?.onboarding_completed && isOnboarding) {
      navigate({ to: "/home", replace: true });
    }
  }, [session, loading, pathname, isPublic, isOnboarding, profile, profileLoading, needsOnboarding, navigate]);

  if (loading || awaitingProfile) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session && !isPublic) return null;
  // Onboarding pending: hold the loader instead of rendering the protected
  // screen while the redirect to /onboarding is in flight.
  if (session && needsOnboarding && !isOnboarding && !isPublic) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}