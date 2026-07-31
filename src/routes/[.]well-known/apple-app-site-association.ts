import { createFileRoute } from "@tanstack/react-router";

/**
 * Apple Universal Links association file.
 *
 * Served as `application/json` from the app domain so tapping an
 * https://mindfulmovement.lovable.app/... link opens the installed iOS app.
 *
 * Set APPLE_APP_SITE_ASSOCIATION_APP_IDS to
 * "<TEAMID>.app.lovable.mindfulmovement" (comma separated for multiple apps).
 * Until it is set, the placeholder below is served and iOS falls back to the
 * browser, where the verified-email confirmation page takes over.
 */
export const Route = createFileRoute("/.well-known/apple-app-site-association")({
  server: {
    handlers: {
      GET: async () => {
        const appIDs = (process.env["APPLE_APP_SITE_ASSOCIATION_APP_IDS"] ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const body = {
          applinks: {
            details: [
              {
                appIDs:
                  appIDs.length > 0 ? appIDs : ["TEAMID.app.lovable.mindfulmovement"],
                components: [
                  { "/": "/auth/callback", comment: "Email verification callback" },
                  { "/": "/reset-password", comment: "Password reset" },
                  { "/": "/onboarding", comment: "Profile setup" },
                  { "/": "/home", comment: "Home" },
                ],
              },
            ],
          },
        };
        return new Response(JSON.stringify(body), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});