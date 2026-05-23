import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/mm/AppShell";
import { Bell, Heart, Settings, HelpCircle, LogOut, ChevronRight, Pencil } from "lucide-react";
import { useSessionStore } from "@/lib/useSessionStore";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/useProfile";
import { EditProfileDialog } from "@/components/mm/EditProfileDialog";
import { getLifestyle } from "@/lib/lifestyles";
import { useState } from "react";

type Item = {
  icon: typeof Bell;
  label: string;
  to?: "/reminders";
};

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Mindful Movement" },
      { name: "description", content: "Your profile, preferences, and reminders." },
    ],
  }),
  component: ProfilePage,
});

const groups: { title: string; items: Item[] }[] = [
  {
    title: "Wellness",
    items: [
      { icon: Bell, label: "Reminders", to: "/reminders" },
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
  const { streak, totalXp, completedToday } = useSessionStore();
  const { user, signOut } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const displayName =
    profile?.full_name ??
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email ??
    "Friend";
  const initial = displayName.charAt(0).toUpperCase();
  const lifestyle = getLifestyle(profile?.lifestyle);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const stats = [
    { label: "Day streak", value: String(streak) },
    { label: "Total XP", value: totalXp >= 1000 ? `${(totalXp / 1000).toFixed(1)}k` : String(totalXp) },
    { label: "Today", value: String(completedToday.length) },
  ];
  return (
    <AppShell>
      <header className="flex flex-col items-center text-center mb-8">
        <div className="size-24 rounded-full bg-secondary ring-1 ring-black/5 mb-4 grid place-items-center text-2xl font-semibold text-muted-foreground">
          {initial}
        </div>
        <h1 className="text-xl font-semibold">{displayName}</h1>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        <button
          onClick={() => setEditOpen(true)}
          disabled={loading || !profile}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:opacity-50"
        >
          <Pencil className="size-3" /> Edit profile
        </button>
        {profile && (lifestyle || profile.fitness_level || profile.work_style) && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-3">
            {lifestyle && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                <lifestyle.icon className="size-3" /> {lifestyle.label}
              </span>
            )}
            {profile.fitness_level && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary capitalize">
                {profile.fitness_level}
              </span>
            )}
            {profile.work_style && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary capitalize">
                {profile.work_style}
              </span>
            )}
          </div>
        )}
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
              {g.items.map(({ icon: Icon, label, to }) => {
                const content = (
                  <>
                    <div className="size-8 rounded-lg bg-secondary grid place-items-center">
                      <Icon className="size-4" />
                    </div>
                    <span className="text-sm font-medium flex-1">{label}</span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </>
                );
                return to ? (
                  <Link
                    key={label}
                    to={to}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    key={label}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <button
          onClick={handleSignOut}
          className="w-full h-12 rounded-2xl bg-card ring-1 ring-black/5 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </div>

      {profile && (
        <EditProfileDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          profile={profile}
          onSave={updateProfile}
        />
      )}
    </AppShell>
  );
}