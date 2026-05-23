import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/mm/AppShell";
import { ArrowLeft, HelpCircle, Mail } from "lucide-react";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Help & Support — Mindful Movement" },
      { name: "description", content: "Contact Mindful Movement support." },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  return (
    <AppShell>
      <header className="mb-8">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </header>

      <div className="flex flex-col items-center text-center mb-10">
        <div className="size-16 rounded-full bg-secondary ring-1 ring-black/5 mb-4 grid place-items-center">
          <HelpCircle className="size-7 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold">Help &amp; Support</h1>
        <p className="text-sm text-muted-foreground mt-1">We&apos;re here for you.</p>
      </div>

      <div className="rounded-2xl bg-card ring-1 ring-black/5 p-6 text-center">
        <div className="size-10 rounded-full bg-primary/10 text-primary grid place-items-center mx-auto mb-4">
          <Mail className="size-5" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          For customer support, please email us at{" "}
          <a
            href="mailto:test@test.com"
            className="font-medium text-primary hover:underline"
          >
            test@test.com
          </a>
          , and our team will get back to you within 24–48 hours. Thank you.
        </p>
      </div>
    </AppShell>
  );
}
