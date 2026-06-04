import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/mm/AppShell";
import { ArrowLeft, Shield } from "lucide-react";
import { useI18n } from "@/lib/i18n";

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
  const { t } = useI18n();
  return (
    <AppShell>
      <header className="mb-6">
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          {t("common.back")}
        </Link>
      </header>

      <div className="flex flex-col items-center text-center mb-8">
        <div className="size-14 rounded-full bg-secondary ring-1 ring-black/5 mb-3 grid place-items-center">
          <Shield className="size-6 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold">{t("privacy.title")}</h1>
      </div>

      <div className="rounded-2xl bg-card ring-1 ring-black/5 p-6 space-y-5 text-sm text-muted-foreground leading-relaxed">
        <p>{t("privacy.intro")}</p>
        <div>
          <h2 className="text-foreground font-medium mb-2">{t("privacy.h.collect")}</h2>
          <p>{t("privacy.p.collect")}</p>
        </div>
        <div>
          <h2 className="text-foreground font-medium mb-2">{t("privacy.h.use")}</h2>
          <p>{t("privacy.p.use")}</p>
        </div>
        <div>
          <h2 className="text-foreground font-medium mb-2">{t("privacy.h.security")}</h2>
          <p>{t("privacy.p.security")}</p>
        </div>
        <div>
          <h2 className="text-foreground font-medium mb-2">{t("privacy.h.choices")}</h2>
          <p>{t("privacy.p.choices")}</p>
        </div>
        <div>
          <h2 className="text-foreground font-medium mb-2">{t("privacy.h.changes")}</h2>
          <p>{t("privacy.p.changes")}</p>
        </div>
        <p>
          {t("privacy.contact_pre")}
          <a href="mailto:support@mindfulmovementapp.com" className="font-medium text-primary hover:underline">
            support@mindfulmovementapp.com
          </a>
          {t("privacy.contact_post")}
        </p>
      </div>
    </AppShell>
  );
}
