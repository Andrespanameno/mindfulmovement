import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/mm/AppShell";
import { ArrowLeft, FileText } from "lucide-react";
import { useI18n } from "@/lib/i18n";

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
          <FileText className="size-6 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold">{t("terms.title")}</h1>
      </div>

      <div className="rounded-2xl bg-card ring-1 ring-black/5 p-6 space-y-5 text-sm text-muted-foreground leading-relaxed">
        <p>{t("terms.intro")}</p>
        <div>
          <h2 className="text-foreground font-medium mb-2">{t("terms.h.use")}</h2>
          <p>{t("terms.p.use")}</p>
        </div>
        <div>
          <h2 className="text-foreground font-medium mb-2">{t("terms.h.account")}</h2>
          <p>{t("terms.p.account")}</p>
        </div>
        <div>
          <h2 className="text-foreground font-medium mb-2">{t("terms.h.ip")}</h2>
          <p>{t("terms.p.ip")}</p>
        </div>
        <div>
          <h2 className="text-foreground font-medium mb-2">{t("terms.h.liability")}</h2>
          <p>{t("terms.p.liability")}</p>
        </div>
        <div>
          <h2 className="text-foreground font-medium mb-2">{t("terms.h.changes")}</h2>
          <p>{t("terms.p.changes")}</p>
        </div>
        <p>
          {t("terms.contact_pre")}
          <a href="mailto:support@mindfulmovementapp.com" className="font-medium text-primary hover:underline">
            support@mindfulmovementapp.com
          </a>.
        </p>
      </div>
    </AppShell>
  );
}
