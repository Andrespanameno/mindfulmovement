import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/mm/AppShell";
import { ArrowLeft, Shield } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Mindful Movement" },
      { name: "description", content: "Mindful Movement privacy policy." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <AppShell>
      <header className="mb-6">
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </header>

      <div className="flex flex-col items-center text-center mb-8">
        <div className="size-14 rounded-full bg-secondary ring-1 ring-black/5 mb-3 grid place-items-center">
          <Shield className="size-6 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold">Privacy Policy</h1>
      </div>

      <div className="rounded-2xl bg-card ring-1 ring-black/5 p-6 space-y-5 text-sm text-muted-foreground leading-relaxed">
        <p>
          This Privacy Policy describes how Mindful Movement collects, uses, and protects your personal information when you use our app.
        </p>

        <div>
          <h2 className="text-foreground font-medium mb-2">Information We Collect</h2>
          <p>
            We collect information you provide directly, such as your profile details, wellness preferences, and session activity. This helps us personalize your experience and track your progress.
          </p>
        </div>

        <div>
          <h2 className="text-foreground font-medium mb-2">How We Use Your Information</h2>
          <p>
            We use your data to deliver personalized movement recommendations, track your wellness journey, send helpful reminders, and improve the app experience.
          </p>
        </div>

        <div>
          <h2 className="text-foreground font-medium mb-2">Data Security</h2>
          <p>
            We take reasonable measures to protect your information from unauthorized access, disclosure, or loss. Your data is stored securely and encrypted in transit.
          </p>
        </div>

        <div>
          <h2 className="text-foreground font-medium mb-2">Your Choices</h2>
          <p>
            You can update your profile, adjust reminder preferences, or contact us to inquire about your data at any time.
          </p>
        </div>

        <div>
          <h2 className="text-foreground font-medium mb-2">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted within the app, and we encourage you to review it periodically.
          </p>
        </div>

        <p>
          If you have any questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:test@test.com" className="font-medium text-primary hover:underline">
            test@test.com
          </a>.
        </p>
      </div>
    </AppShell>
  );
}
