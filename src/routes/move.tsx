import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/mm/AppShell";
import { useMemo, useState } from "react";
import { movements, CATEGORIES, filterMovementsForParent, type MovementCategory } from "@/lib/movements";
import { MovementCard } from "@/components/mm/MovementCard";
import { useSessionStore } from "@/lib/useSessionStore";
import { useProfile } from "@/lib/useProfile";
import { useI18n } from "@/lib/i18n";
import { useContent } from "@/lib/i18n-content";

export const Route = createFileRoute("/move")({
  head: () => ({
    meta: [
      { title: "Move — Mindful Movement" },
      { name: "description", content: "Gentle daily movement breaks for busy adults." },
    ],
  }),
  component: MovePage,
});

type Filter = "All" | MovementCategory;

const DAILY_SUBTITLES: { en: string; es: string }[] = [
  { en: "Move a little.", es: "Muévete un poco." },
  { en: "Take a mindful moment.", es: "Toma un momento consciente." },
  { en: "Small steps matter.", es: "Los pequeños pasos importan." },
  { en: "Reset and recharge.", es: "Reinicia y recarga." },
  { en: "Gentle movement goes a long way.", es: "El movimiento suave llega lejos." },
  { en: "Consistency beats intensity.", es: "La constancia gana a la intensidad." },
  { en: "One small action at a time.", es: "Una pequeña acción a la vez." },
  { en: "Give yourself a quick reset.", es: "Date un reinicio rápido." },
];

const FEATURED_TITLES = {
  morning: [
    { en: "Morning Awakening", es: "Despertar de la mañana" },
    { en: "Morning Reset", es: "Reinicio matutino" },
    { en: "Start Your Day", es: "Empieza tu día" },
    { en: "Morning Momentum", es: "Ritmo matutino" },
  ],
  afternoon: [
    { en: "Afternoon Reset", es: "Reinicio de la tarde" },
    { en: "Midday Recharge", es: "Recarga del mediodía" },
    { en: "Afternoon Momentum", es: "Ritmo de la tarde" },
    { en: "Refresh & Refocus", es: "Refresca y reenfoca" },
  ],
  evening: [
    { en: "Evening Unwind", es: "Relájate al anochecer" },
    { en: "Evening Reset", es: "Reinicio nocturno" },
    { en: "Wind Down & Move", es: "Calma y muévete" },
    { en: "Gentle Evening Movement", es: "Movimiento suave nocturno" },
  ],
};

const DAILY_FEATURED_MESSAGES: { en: string; es: string }[] = [
  { en: "You've got this.", es: "Tú puedes con esto." },
  { en: "Today is your day.", es: "Hoy es tu día." },
  { en: "One step at a time.", es: "Un paso a la vez." },
  { en: "Keep showing up.", es: "Sigue presentándote." },
  { en: "Every movement counts.", es: "Cada movimiento cuenta." },
  { en: "Small actions create change.", es: "Las pequeñas acciones crean cambio." },
  { en: "Progress is progress.", es: "El progreso es progreso." },
  { en: "Your future self will thank you.", es: "Tu yo futuro te lo agradecerá." },
];

function localDayKey(d: Date): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function hashInt(n: number, salt: number): number {
  let x = (n ^ salt) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 2246822507);
  x = Math.imul(x ^ (x >>> 13), 3266489909);
  x = (x ^ (x >>> 16)) >>> 0;
  return x;
}

function getTimeOfDay(d: Date): "morning" | "afternoon" | "evening" {
  const h = d.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  return "evening";
}

function MovePage() {
  const { t, lang } = useI18n();
  const c = useContent();
  const [active, setActive] = useState<Filter>("All");
  const { completedToday } = useSessionStore();
  const { profile } = useProfile();
  const prefs = profile?.preferred_categories ?? [];
  // Step 1 of the recommendation pipeline: only show movements eligible for
  // this user's lifestyle profile. Parent-only movements never appear for
  // non-parent profiles, regardless of category filter or preferences.
  const lifestyleEligible = useMemo(
    () => filterMovementsByLifestyle(movements, profile?.lifestyle),
    [profile?.lifestyle],
  );

  const { dailySubtitle, featuredTitle, featuredMessage } = useMemo(() => {
    const now = new Date();
    const day = localDayKey(now);
    const tod = getTimeOfDay(now);
    const titlePool = FEATURED_TITLES[tod];
    const sub = DAILY_SUBTITLES[hashInt(day, 1) % DAILY_SUBTITLES.length];
    const title = titlePool[hashInt(day, 2) % titlePool.length];
    const msg = DAILY_FEATURED_MESSAGES[hashInt(day, 3) % DAILY_FEATURED_MESSAGES.length];
    return {
      dailySubtitle: lang === "es" ? sub.es : sub.en,
      featuredTitle: lang === "es" ? title.es : title.en,
      featuredMessage: lang === "es" ? msg.es : msg.en,
    };
  }, [lang]);

  const FILTERS: { id: Filter; label: string }[] = [
    { id: "All", label: t("move.filter.all") },
    ...CATEGORIES.map((cat) => ({ id: cat.id as Filter, label: c.categoryShort(cat.id, cat.short) })),
  ];

  const filtered = useMemo(() => {
    if (active !== "All") return lifestyleEligible.filter((m) => m.category === active);
    if (prefs.length === 0) return lifestyleEligible;
    // Preferred categories first, then the rest — keeps variety without hiding anything.
    const preferred = lifestyleEligible.filter((m) => prefs.includes(m.category));
    const others = lifestyleEligible.filter((m) => !prefs.includes(m.category));
    return [...preferred, ...others];
  }, [active, prefs, lifestyleEligible]);

  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-sm text-muted-foreground">{t("move.eyebrow")}</p>
        <h1 className="text-2xl font-semibold">{dailySubtitle}</h1>
      </header>

      <div className="rounded-3xl bg-foreground text-background p-6 mb-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/30 blur-2xl" />
        <p className="text-xs uppercase tracking-widest text-background/60 mb-2">{t("move.featured")}</p>
        <h2 className="text-xl font-semibold mb-1">{featuredTitle}</h2>
        <p className="text-sm text-background/70 max-w-[260px]">
          {completedToday.length > 0
            ? completedToday.length === 1
              ? t("move.featured.completed_one")
              : t("move.featured.completed_many", { n: completedToday.length })
            : featuredMessage}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-6 px-6 pb-2 mb-6">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap ring-1 ring-black/5 ${
              active === id ? "bg-foreground text-background" : "bg-card text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((m) => (
          <MovementCard key={m.id} movement={m} />
        ))}
      </div>
    </AppShell>
  );
}