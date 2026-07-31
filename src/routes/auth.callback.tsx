import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { isNative } from "@/lib/native";
import {
  completeAuthFromUrl,
  isMobileBrowser,
  openInstalledApp,
} from "@/lib/authCallback";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Email verified — Mindful Movement" },
      {
        name: "description",
        content:
          "Your Mindful Movement email is verified. Return to the app to finish setting up your account.",
      },
      { property: "og:title", content: "Email verified — Mindful Movement" },
      {
        property: "og:description",
        content: "Your email is verified. Open Mindful Movement to continue.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthCallback,
});

type State = "working" | "verified" | "error";

function AuthCallback() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [state, setState] = useState<State>("working");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await completeAuthFromUrl(window.location.href);
      if (cancelled) return;
      if (!result.ok) {
        setMessage(result.error);
        setState("error");
        return;
      }
      setState("verified");
      // Inside the native app (or on desktop where there is no app to hand
      // off to) continue straight into the flow. AuthGate decides between
      // onboarding and home based on the loaded profile.
      if (isNative() || !isMobileBrowser()) {
        navigate({ to: "/", replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const showHandoff = state === "verified" && !isNative() && isMobileBrowser();

  return (
    <main className="min-h-screen bg-background text-foreground flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col items-center justify-center px-8 py-20 text-center">
        {state === "working" && (
          <>
            <Loader2 className="size-8 text-primary animate-spin mb-6" />
            <p className="text-muted-foreground">{t("authcb.working")}</p>
          </>
        )}

        {state === "error" && (
          <>
            <AlertCircle className="size-10 text-destructive mb-6" />
            <h1 className="text-2xl font-semibold mb-2">{t("authcb.error_title")}</h1>
            <p className="text-muted-foreground mb-8">
              {message ?? t("authcb.error_body")}
            </p>
            <Button className="w-full" onClick={() => navigate({ to: "/", replace: true })}>
              {t("authcb.back_to_signin")}
            </Button>
          </>
        )}

        {state === "verified" && (
          <>
            <CheckCircle2 className="size-12 text-primary mb-6" />
            <h1 className="text-2xl font-semibold mb-2">{t("authcb.verified_title")}</h1>
            {showHandoff ? (
              <>
                <p className="text-muted-foreground mb-8">{t("authcb.verified_body")}</p>
                <Button className="w-full h-12" onClick={() => openInstalledApp("/")}>
                  {t("authcb.open_app")}
                </Button>
                <button
                  type="button"
                  className="mt-4 text-sm text-muted-foreground underline"
                  onClick={() => navigate({ to: "/", replace: true })}
                >
                  {t("authcb.continue_browser")}
                </button>
              </>
            ) : (
              <p className="text-muted-foreground">{t("authcb.redirecting")}</p>
            )}
          </>
        )}
      </div>
    </main>
  );
}