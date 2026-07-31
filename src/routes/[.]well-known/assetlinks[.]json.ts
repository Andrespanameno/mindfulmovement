import { createFileRoute } from "@tanstack/react-router";

/**
 * Android App Links verification file.
 *
 * Set ANDROID_APP_LINK_FINGERPRINTS to the app-signing certificate SHA-256
 * fingerprints (comma separated, uppercase colon-delimited) from Play Console
 * → Setup → App integrity. Until then Android treats the link as unverified
 * and opens the browser, where the confirmation page takes over.
 */
export const Route = createFileRoute("/.well-known/assetlinks.json")({
  server: {
    handlers: {
      GET: async () => {
        const fingerprints = (process.env["ANDROID_APP_LINK_FINGERPRINTS"] ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const body = [
          {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: {
              namespace: "android_app",
              package_name: "app.lovable.mindfulmovement",
              sha256_cert_fingerprints: fingerprints,
            },
          },
        ];
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