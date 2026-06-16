import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/mm/AppShell";
import {
  ArrowLeft,
  Bell,
  BellOff,
  Sparkles,
  Droplet,
  Wind,
  Check,
  FlaskConical,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import {
  useReminderSettings,
  updateReminderSettings,
  formatHour,
  type ReminderSettings,
} from "@/lib/reminders";
import { useI18n } from "@/lib/i18n";
import { useProfile } from "@/lib/useProfile";
import { isNative } from "@/lib/native";
import {
  ensureNativePermissionAndSync,
  getNativePermission,
  scheduleTestNotification,
  type NativePermissionState,
} from "@/lib/nativeNotifications";

export const Route = createFileRoute("/reminders")({
  head: () => ({
    meta: [
      { title: "Reminders — Mindful Movement" },
      {
        name: "description",
        content: "Customize gentle movement, hydration, and breathing reminders.",
      },
    ],
  }),
  component: RemindersPage,
});

const INTERVAL_OPTIONS: ReminderSettings["intervalMin"][] = [30, 60, 90, 120];

function RemindersPage() {
  const { t, lang } = useI18n();
  const s = useReminderSettings();
  const { profile, updateProfile } = useProfile();
  const inAppOn = profile?.in_app_notifications !== false;
  const toggleInApp = () => {
    if (!profile) return;
    void updateProfile({ in_app_notifications: !inAppOn });
  };
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [nativePerm, setNativePerm] = useState<NativePermissionState>("prompt");
  const native = isNative();
  const openedSyncRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (native) {
      if (openedSyncRef.current) return;
      openedSyncRef.current = true;
      void getNativePermission().then((state) => {
        console.info("[reminders] opened settings, permission ->", state);
        setNativePerm(state);
        void ensureNativePermissionAndSync(s, lang).then((resolved) => {
          console.info("[reminders] opened settings, synced permission ->", resolved);
          setNativePerm(resolved);
          if (resolved === "denied") {
            toast.message(t("reminders.native_denied_title"), {
              description: t("reminders.native_denied_body"),
            });
          }
        });
      });
      return;
    }
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, [native, s, lang, t]);

  const requestPermission = async () => {
    if (native) {
      const result = await ensureNativePermissionAndSync(s, lang);
      console.info("[reminders] requestPermission result ->", result);
      setNativePerm(result);
      if (result === "granted") {
        toast.success(t("reminders.notifs_on"), {
          description: t("reminders.notifs_on_sub"),
        });
      } else if (result === "denied") {
        toast.message(t("reminders.native_denied_title"), {
          description: t("reminders.native_denied_body"),
        });
      }
      return;
    }
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      toast.success(t("reminders.notifs_on"), { description: t("reminders.notifs_on_sub") });
    }
  };

  const toggleEnabled = async () => {
    const nextEnabled = !s.enabled;
    updateReminderSettings({ enabled: nextEnabled });

    if (native && nextEnabled) {
      const nextSettings = { ...s, enabled: true };
      const result = await ensureNativePermissionAndSync(nextSettings, lang);
      console.info("[reminders] enabled reminders, permission ->", result);
      setNativePerm(result);
      if (result === "granted") {
        toast.success(t("reminders.notifs_on"), {
          description: t("reminders.notifs_on_sub"),
        });
      } else if (result === "denied") {
        toast.message(t("reminders.native_denied_title"), {
          description: t("reminders.native_denied_body"),
        });
      }
    }
  };

  const sendTestNotification = async () => {
    if (!native) return;

    const result = await ensureNativePermissionAndSync(s, lang);
    console.info("[reminders] test notification permission ->", result);
    setNativePerm(result);

    if (result === "denied") {
      toast.message(t("reminders.native_denied_title"), {
        description: t("reminders.native_denied_body"),
      });
      return;
    }

    if (result !== "granted") return;

    const ok = await scheduleTestNotification(lang);
    if (ok) {
      toast.success(t("reminders.test_scheduled"), {
        description: t("reminders.test_scheduled_sub"),
      });
    }
  };

  return (
    <AppShell>
      <header className="flex items-center justify-between mb-6">
        <Link
          to="/profile"
          className="size-10 rounded-full bg-card ring-1 ring-black/5 grid place-items-center"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-base font-semibold">{t("reminders.title")}</h1>
        <div className="size-10" />
      </header>

      <p className="text-sm text-muted-foreground mb-6 text-pretty">{t("reminders.intro")}</p>

      <button
        onClick={toggleEnabled}
        className="w-full p-4 rounded-2xl bg-card ring-1 ring-black/5 flex items-center gap-3 mb-6"
      >
        <div
          className={`size-10 rounded-xl grid place-items-center ${
            s.enabled ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
          }`}
        >
          {s.enabled ? <Bell className="size-4" /> : <BellOff className="size-4" />}
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium">{t("reminders.gentle")}</p>
          <p className="text-xs text-muted-foreground">
            {s.enabled ? t("reminders.active_hours_status") : t("reminders.paused_status")}
          </p>
        </div>
        <Toggle on={s.enabled} />
      </button>

      {native ? (
        <>
          {s.enabled && nativePerm !== "granted" ? (
            <button
              onClick={requestPermission}
              className="w-full p-4 rounded-2xl bg-primary/10 ring-1 ring-primary/20 text-primary text-sm font-medium mb-3 text-left"
            >
              {nativePerm === "denied"
                ? t("reminders.native_denied_title")
                : t("reminders.native_request_cta")}
              <span className="block text-xs text-primary/70 font-normal mt-1">
                {nativePerm === "denied"
                  ? t("reminders.native_denied_body")
                  : t("reminders.native_request_sub")}
              </span>
            </button>
          ) : null}

          <button
            onClick={sendTestNotification}
            className="w-full p-4 rounded-2xl bg-card ring-1 ring-black/5 flex items-center gap-3 mb-6 text-left"
          >
            <div className="size-10 rounded-xl bg-secondary grid place-items-center text-foreground">
              <FlaskConical className="size-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{t("reminders.test_button")}</p>
              <p className="text-xs text-muted-foreground">{t("reminders.test_button_sub")}</p>
            </div>
          </button>
        </>
      ) : (
        permission !== "granted" &&
        permission !== "unsupported" &&
        s.enabled && (
          <button
            onClick={requestPermission}
            className="w-full p-4 rounded-2xl bg-primary/10 ring-1 ring-primary/20 text-primary text-sm font-medium mb-6 text-left"
          >
            {t("reminders.enable_browser")}
            <span className="block text-xs text-primary/70 font-normal mt-1">
              {t("reminders.enable_browser_sub")}
            </span>
          </button>
        )
      )}

      <Section title={t("reminders.active_hours")}>
        <div className="p-4 rounded-2xl bg-card ring-1 ring-black/5 space-y-4">
          <HourPicker
            label={t("reminders.start")}
            value={s.startHour}
            onChange={(v) => updateReminderSettings({ startHour: v })}
          />
          <HourPicker
            label={t("reminders.end")}
            value={s.endHour}
            onChange={(v) => updateReminderSettings({ endHour: v })}
          />
          <p className="text-xs text-muted-foreground">
            {t("reminders.quiet_outside", { a: formatHour(s.startHour), b: formatHour(s.endHour) })}
          </p>
        </div>
      </Section>

      <Section title={t("reminders.frequency")}>
        <div className="grid grid-cols-4 gap-2">
          {INTERVAL_OPTIONS.map((min) => {
            const active = s.intervalMin === min;
            return (
              <button
                key={min}
                onClick={() => updateReminderSettings({ intervalMin: min })}
                className={`h-14 rounded-2xl ring-1 text-sm font-medium transition flex flex-col items-center justify-center ${
                  active
                    ? "bg-primary text-primary-foreground ring-primary"
                    : "bg-card ring-black/5 text-foreground"
                }`}
              >
                <span className="text-base leading-none">
                  {min < 60 ? `${min}m` : `${min / 60}h`}
                </span>
                <span
                  className={`text-[10px] mt-1 ${active ? "opacity-80" : "text-muted-foreground"}`}
                >
                  {min === 60 ? t("reminders.hourly") : t("reminders.interval_label")}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title={t("reminders.what_nudge")}>
        <div className="rounded-2xl bg-card ring-1 ring-black/5 divide-y divide-border">
          <NudgeRow
            icon={<Sparkles className="size-4 text-primary" />}
            label={t("reminders.movement")}
            description={t("reminders.movement_desc")}
            on={s.movement}
            onToggle={() => updateReminderSettings({ movement: !s.movement })}
          />
          <NudgeRow
            icon={<Droplet className="size-4 text-primary" />}
            label={t("reminders.hydration")}
            description={t("reminders.hydration_desc")}
            on={s.hydration}
            onToggle={() => updateReminderSettings({ hydration: !s.hydration })}
          />
          <NudgeRow
            icon={<Wind className="size-4 text-accent" />}
            label={t("reminders.breathing")}
            description={t("reminders.breathing_desc")}
            on={s.breath}
            onToggle={() => updateReminderSettings({ breath: !s.breath })}
          />
        </div>
      </Section>

      <Section title={t("reminders.quiet_times")}>
        <button
          onClick={() => updateReminderSettings({ quietWeekends: !s.quietWeekends })}
          className="w-full p-4 rounded-2xl bg-card ring-1 ring-black/5 flex items-center gap-3"
        >
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">{t("reminders.quiet_weekends")}</p>
            <p className="text-xs text-muted-foreground">{t("reminders.no_nudges_weekend")}</p>
          </div>
          <Toggle on={s.quietWeekends} />
        </button>
      </Section>

      <Section title={t("reminders.in_app_section")}>
        <button
          onClick={toggleInApp}
          disabled={!profile}
          className="w-full p-4 rounded-2xl bg-card ring-1 ring-black/5 flex items-center gap-3 text-left disabled:opacity-60"
        >
          <div className="size-10 rounded-xl bg-secondary grid place-items-center text-foreground">
            <MessageSquare className="size-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{t("reminders.in_app_title")}</p>
            <p className="text-xs text-muted-foreground">{t("reminders.in_app_desc")}</p>
          </div>
          <Toggle on={inAppOn} />
        </button>
      </Section>

      <p className="text-xs text-muted-foreground italic text-center mt-2">
        {t("reminders.footer")}
      </p>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 ml-1">
        {title}
      </h3>
      {children}
    </div>
  );
}

function HourPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-10 rounded-xl bg-secondary px-3 text-sm font-medium ring-1 ring-black/5 focus:outline-none focus:ring-primary"
      >
        {Array.from({ length: 24 }).map((_, h) => (
          <option key={h} value={h}>
            {formatHour(h)}
          </option>
        ))}
      </select>
    </div>
  );
}

function NudgeRow({
  icon,
  label,
  description,
  on,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
      <div className="size-9 rounded-lg bg-secondary grid place-items-center">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Toggle on={on} />
    </button>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative inline-flex h-6 w-10 rounded-full transition-colors ${
        on ? "bg-primary" : "bg-secondary"
      }`}
    >
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-background shadow-sm transition-all flex items-center justify-center ${
          on ? "left-[18px]" : "left-0.5"
        }`}
      >
        {on && <Check className="size-3 text-primary" />}
      </span>
    </span>
  );
}
