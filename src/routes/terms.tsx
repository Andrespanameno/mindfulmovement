import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/mm/AppShell";
import { ArrowLeft, FileText } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Mindful Movement" },
      { name: "description", content: "Mindful Movement terms of service." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
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
          <FileText className="size-6 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold">Terms of Service</h1>
      </div>

      <div className="rounded-2xl bg-card ring-1 ring-black/5 p-6 space-y-5 text-sm text-muted-foreground leading-relaxed">
        <p>
          By using the Mindful Movement app, you agree to these Terms of Service. Please read them carefully before continuing.
        </p>

        <div>
          <h2 className="text-foreground font-medium mb-2">Use of the App</h2>
          <p>
            Mindful Movement is designed to support your wellness journey with gentle movement reminders, hydration tracking, and progress insights. It is not a substitute for professional medical advice, diagnosis, or treatment.
          </p>
        </div>

        <div>
          <h2 className="text-foreground font-medium mb-2">Your Account</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Please notify us immediately of any unauthorized use.
          </p>
        </div>

        <div>
          <h2 className="text-foreground font-medium mb-2">Content and Intellectual Property</h2>
          <p>
            All content within the app, including text, graphics, and software, is the property of Mindful Movement or its licensors and is protected by applicable intellectual property laws.
          </p>
        </div>

        <div>
          <h2 className="text-foreground font-medium mb-2">Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Mindful Movement shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app.
          </p>
        </div>

        <div>
          <h2 className="text-foreground font-medium mb-2">Changes to These Terms</h2>
          <p>
            We may modify these Terms of Service at any time. Continued use of the app after changes constitutes your acceptance of the revised terms.
          </p>
        </div>

        <p>
          If you have any questions about these Terms, please contact us at{" "}
          <a href="mailto:test@test.com" className="font-medium text-primary hover:underline">
            test@test.com
          </a>.
        </p>
      </div>
    </AppShell>
  );
}
