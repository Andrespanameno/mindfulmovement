import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/mm/AppShell";
import { ArrowLeft, Shield, FileText, ChevronRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Mindful Movement" },
      { name: "description", content: "App settings and legal information." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const items = [
    { icon: Sparkles, label: "How It Works", to: "/how-it-works" },
    { icon: Shield, label: "Privacy Policy", to: "/privacy" },
    { icon: FileText, label: "Terms of Service", to: "/terms" },
  ];

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

      <div className="mb-8">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Legal and app information.</p>
      </div>

      <div className="rounded-2xl bg-card ring-1 ring-black/5 divide-y divide-border mb-auto">
        {items.map(({ icon: Icon, label, to }) => (
          <Link
            key={label}
            to={to}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
          >
            <div className="size-8 rounded-lg bg-secondary grid place-items-center">
              <Icon className="size-4" />
            </div>
            <span className="text-sm font-medium flex-1">{label}</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        Mindful Movement v0.1 Beta
      </p>
    </AppShell>
  );
}
