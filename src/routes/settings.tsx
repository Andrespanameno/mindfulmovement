import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/mm/AppShell";
import { ArrowLeft, Shield, FileText, ChevronRight, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/mm/LanguageToggle";

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
  const { t } = useI18n();
  const items = [
    { icon: Sparkles, label: t("settings.item.how"), to: "/how-it-works" },
    { icon: Shield, label: t("settings.item.privacy"), to: "/privacy" },
    { icon: FileText, label: t("settings.item.terms"), to: "/terms" },
  ];

  return (
    <AppShell>
      <header className="mb-8">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          {t("common.back")}
        </Link>
      </header>

      <div className="mb-8">
        <h1 className="text-xl font-semibold">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("settings.sub")}</p>
      </div>

      <div className="mb-6 rounded-2xl bg-card ring-1 ring-black/5 p-4 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium">{t("settings.language.label")}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t("settings.language.hint")}</p>
        </div>
        <LanguageToggle />
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
        {t("settings.version")}
      </p>
    </AppShell>
  );
}
