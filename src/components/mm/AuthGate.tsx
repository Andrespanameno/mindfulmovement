import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/useProfile";

const PUBLIC_ROUTES = new Set(["/", "/reset-password"]);

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isPublic = PUBLIC_ROUTES.has(pathname);
  const isOnboarding = pathname === "/onboarding";

  useEffect(() => {
    if (loading) return;
    if (!session && !isPublic) {
      navigate({ to: "/", replace: true });
      return;
    }
    if (session && pathname === "/") {
      navigate({ to: "/home", replace: true });
      return;
    }
    if (session && !profileLoading && profile && !profile.onboarding_completed && !isOnboarding && !isPublic) {
      navigate({ to: "/onboarding", replace: true });
      return;
    }
    if (session && profile?.onboarding_completed && isOnboarding) {
      navigate({ to: "/home", replace: true });
    }
  }, [session, loading, pathname, isPublic, isOnboarding, profile, profileLoading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session && !isPublic) return null;

  return <>{children}</>;
}