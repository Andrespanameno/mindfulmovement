import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/mm/AppShell";
import { Bell, Heart, Settings, HelpCircle, LogOut, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Mindful Movement" },
      { name: "description", content: "Your profile, preferences, and reminders." },
    ],
  }),
  component: ProfilePage,
});

const stats = [
  { label: "Day streak", value: "12" },
  { label: "Total XP", value: "2.1k" },
  { label: "Sessions", value: "48" },
];

const groups = [
  {
    title: "Wellness",
    items: [
      { icon: Bell, label: "Reminders" },
      { icon: Heart, label: "Favorites" },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: Settings, label: "Settings" },
      { icon: HelpCircle, label: "Help & support" },
    ],
  },
];

function ProfilePage() {
  return (
    <AppShell>
      <header className="flex flex-col items-center text-center mb-8">
        <div className="size-24 rounded-full bg-secondary ring-1 ring-black/5 mb-4 grid place-items-center text-2xl font-semibold text-muted-foreground">
          A
        </div>
        <h1 className="text-xl font-semibold">Alex Rivera</h1>
        <p className="text-sm text-muted-foreground">Member since Oct 2023</p>
      </header>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-2xl bg-card ring-1 ring-black/5 text-center"
          >
            <p className="text-xl font-semibold">{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g.title}>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 ml-1">
              {g.title}
            </h4>
            <div className="rounded-2xl bg-card ring-1 ring-black/5 divide-y divide-border">
              {g.items.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                >
                  <div className="size-8 rounded-lg bg-secondary grid place-items-center">
                    <Icon className="size-4" />
                  </div>
                  <span className="text-sm font-medium flex-1">{label}</span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <Link
          to="/"
          className="w-full h-12 rounded-2xl bg-card ring-1 ring-black/5 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground"
        >
          <LogOut className="size-4" /> Sign out
        </Link>
      </div>
    </AppShell>
  );
}