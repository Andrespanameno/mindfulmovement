import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export type Lang = "en" | "es";

const STORAGE_KEY = "mm-lang";

const dict: Record<string, { en: string; es: string }> = {
  "common.back": { en: "Back", es: "Volver" },
  "common.cancel": { en: "Cancel", es: "Cancelar" },
  "common.save": { en: "Save changes", es: "Guardar cambios" },
  "common.saving": { en: "Saving…", es: "Guardando…" },
  "common.on": { en: "On", es: "Activado" },
  "common.off": { en: "Off", es: "Desactivado" },
  "common.done": { en: "Done", es: "Hecho" },
  "common.start": { en: "Start", es: "Empezar" },
  "common.continue": { en: "Continue", es: "Continuar" },
  "common.skip": { en: "Skip for now", es: "Omitir por ahora" },
  "common.one_moment": { en: "One moment…", es: "Un momento…" },
  "common.language": { en: "Language", es: "Idioma" },

  "nav.home": { en: "Home", es: "Inicio" },
  "nav.move": { en: "Move", es: "Mover" },
  "nav.progress": { en: "Progress", es: "Progreso" },
  "nav.profile": { en: "Profile", es: "Perfil" },

  "auth.signin.title": { en: "Welcome back to your center", es: "Bienvenido de nuevo a tu centro" },
  "auth.signin.sub": { en: "Take a deep breath. Let's start your day with intention.", es: "Respira profundo. Empecemos el día con intención." },
  "auth.signin.cta": { en: "Enter your space", es: "Entrar a tu espacio" },
  "auth.signup.title": { en: "Begin your gentle journey", es: "Comienza tu camino tranquilo" },
  "auth.signup.sub": { en: "Small actions create big change. Create your space.", es: "Las acciones pequeñas crean grandes cambios. Crea tu espacio." },
  "auth.signup.cta": { en: "Create account", es: "Crear cuenta" },
  "auth.forgot.title": { en: "Let's get you back in", es: "Vamos a recuperar tu acceso" },
  "auth.forgot.sub": { en: "We'll send a reset link to your email.", es: "Te enviaremos un enlace de recuperación a tu correo." },
  "auth.forgot.cta": { en: "Send reset link", es: "Enviar enlace" },
  "auth.name": { en: "Your name", es: "Tu nombre" },
  "auth.email": { en: "Email address", es: "Correo electrónico" },
  "auth.password": { en: "Password", es: "Contraseña" },
  "auth.forgot_link": { en: "Forgot your password?", es: "¿Olvidaste tu contraseña?" },
  "auth.new_here": { en: "New to Mindful Movement?", es: "¿Nuevo en Mindful Movement?" },
  "auth.begin": { en: "Begin journey", es: "Comenzar" },
  "auth.back_signin": { en: "Back to sign in", es: "Volver a iniciar sesión" },
  "auth.invalid": { en: "Invalid email or password.", es: "Correo o contraseña no válidos." },
  "auth.signup.success": { en: "Account created. Check your email to confirm, then sign in.", es: "Cuenta creada. Revisa tu correo para confirmar y luego inicia sesión." },
  "auth.reset.success": { en: "Reset link sent. Check your email.", es: "Enlace enviado. Revisa tu correo." },

  "home.greeting": { en: "Good morning, {name}", es: "Buenos días, {name}" },
  "home.title": { en: "Today is a fresh start", es: "Hoy es un nuevo comienzo" },
  "home.guided.eyebrow": { en: "Guided session", es: "Sesión guiada" },
  "home.guided.title": { en: "Start a 5-minute reset", es: "Comienza un reinicio de 5 minutos" },
  "home.guided.sub": { en: "A few gentle movements, timed for you.", es: "Unos movimientos suaves, con tu propio ritmo." },
  "home.hydration.title": { en: "Hydration Goal", es: "Meta de hidratación" },
  "home.hydration.reached": { en: "Goal reached. Beautifully done.", es: "Meta lograda. Muy bien hecho." },
  "home.hydration.remaining": { en: "{n} oz to reach your mark.", es: "{n} oz para alcanzar tu meta." },
  "home.xp_today": { en: "XP Today", es: "XP de hoy" },
  "home.xp_tip": { en: "Every movement counts.", es: "Cada movimiento cuenta." },

  "move.eyebrow": { en: "Today's invitation", es: "Tu invitación de hoy" },
  "move.title": { en: "Move a little", es: "Muévete un poco" },
  "move.featured": { en: "Featured", es: "Destacado" },
  "move.featured.title": { en: "Morning Awakening", es: "Despertar de la mañana" },
  "move.featured.sub_default": { en: "A few minutes is all it takes to feel a shift.", es: "Unos minutos bastan para sentir un cambio." },
  "move.featured.completed_one": { en: "1 session completed today. Keep flowing.", es: "1 sesión completada hoy. Sigue fluyendo." },
  "move.featured.completed_many": { en: "{n} sessions completed today. Keep flowing.", es: "{n} sesiones completadas hoy. Sigue fluyendo." },
  "move.filter.all": { en: "All", es: "Todo" },

  "hydration.title": { en: "Hydration", es: "Hidratación" },
  "hydration.of_today": { en: "of {goal} oz today", es: "de {goal} oz hoy" },
  "hydration.goal_complete": { en: "Goal complete", es: "Meta cumplida" },
  "hydration.to_go": { en: "{n} oz to go · small sips, steady progress.", es: "Faltan {n} oz · sorbos pequeños, progreso constante." },
  "hydration.quick_add": { en: "Quick add", es: "Añadir rápido" },
  "hydration.undo": { en: "Undo last {n} oz", es: "Deshacer últimas {n} oz" },
  "hydration.reminders_label": { en: "Hydration reminders", es: "Recordatorios de hidratación" },
  "hydration.reminders_on": { en: "Gentle nudge every {n} min while open", es: "Aviso suave cada {n} min mientras estés aquí" },
  "hydration.reminders_off": { en: "Off — turn on to get a gentle nudge", es: "Desactivado — actívalo para recibir un aviso suave" },
  "hydration.toast.logged": { en: "+{n} oz logged", es: "+{n} oz registrado" },
  "hydration.toast.xp": { en: "+{xp} XP · Small sips, big impact.", es: "+{xp} XP · Sorbos pequeños, gran impacto." },
  "hydration.toast.keep": { en: "Keep sipping gently.", es: "Sigue bebiendo con calma." },
  "hydration.toast.goal": { en: "Daily hydration goal reached 🌿", es: "Meta diaria de hidratación lograda 🌿" },
  "hydration.toast.goal_sub": { en: "Beautifully done. Your body thanks you.", es: "Muy bien hecho. Tu cuerpo te lo agradece." },
  "hydration.toast.sip": { en: "Time for a sip 💧", es: "Es momento de un sorbo 💧" },
  "hydration.toast.sip_sub": { en: "A quick glass keeps you steady.", es: "Un vaso rápido te mantiene en equilibrio." },

  "progress.title": { en: "Your Journey", es: "Tu camino" },
  "progress.sub": { en: "Small actions, real change — here's how it's adding up.", es: "Acciones pequeñas, cambios reales — así va sumando." },
  "progress.this_week": { en: "This week", es: "Esta semana" },
  "progress.this_month": { en: "This month", es: "Este mes" },
  "progress.highlights": { en: "Highlights", es: "Aspectos destacados" },
  "progress.active_days": { en: "Active days", es: "Días activos" },
  "progress.active_days_hint": { en: "You showed up.", es: "Estuviste presente." },
  "progress.sessions": { en: "Sessions", es: "Sesiones" },
  "progress.minutes": { en: "Minutes moved", es: "Minutos en movimiento" },
  "progress.minutes_hint_week": { en: "{h} hrs this week", es: "{h} h esta semana" },
  "progress.minutes_hint_month": { en: "{h} hrs this month", es: "{h} h este mes" },
  "progress.pushups": { en: "Pushups", es: "Flexiones" },
  "progress.squats": { en: "Squats", es: "Sentadillas" },
  "progress.breathing": { en: "Breathing", es: "Respiración" },
  "progress.hydration": { en: "Hydration", es: "Hidratación" },
  "progress.movement_minutes": { en: "Movement minutes", es: "Minutos de movimiento" },
  "progress.last_7": { en: "Last 7 days", es: "Últimos 7 días" },
  "progress.last_30": { en: "Last 30 days", es: "Últimos 30 días" },
  "progress.streak_history": { en: "Streak history", es: "Historial de racha" },
  "progress.peak": { en: "Peak run: {n} days", es: "Mejor racha: {n} días" },
  "progress.current_best": { en: "Current {c} · Best {b}", es: "Actual {c} · Mejor {b}" },
  "progress.lifetime": { en: "Lifetime totals", es: "Totales acumulados" },
  "progress.total_sessions": { en: "Movement sessions", es: "Sesiones de movimiento" },
  "progress.total_minutes": { en: "Movement minutes", es: "Minutos de movimiento" },
  "progress.total_pushups": { en: "Total pushups", es: "Total de flexiones" },
  "progress.total_squats": { en: "Total squats", es: "Total de sentadillas" },
  "progress.total_breathing": { en: "Breathing sessions", es: "Sesiones de respiración" },
  "progress.milestones": { en: "Milestones", es: "Logros" },
  "progress.ready": { en: "Ready when you are", es: "Listo cuando tú lo estés" },
  "progress.from_prev": { en: "from {n} last period", es: "desde {n} en el período anterior" },

  "profile.edit": { en: "Edit profile", es: "Editar perfil" },
  "profile.day_streak": { en: "Day streak", es: "Racha diaria" },
  "profile.total_xp": { en: "Total XP", es: "XP total" },
  "profile.today": { en: "Today", es: "Hoy" },
  "profile.group.wellness": { en: "Wellness", es: "Bienestar" },
  "profile.group.account": { en: "Account", es: "Cuenta" },
  "profile.menu.reminders": { en: "Reminders", es: "Recordatorios" },
  "profile.menu.settings": { en: "Settings", es: "Ajustes" },
  "profile.menu.support": { en: "Help & support", es: "Ayuda y soporte" },
  "profile.signout": { en: "Sign out", es: "Cerrar sesión" },
  "profile.streak": { en: "Streak", es: "Racha" },
  "profile.days": { en: "days", es: "días" },
  "profile.best": { en: "Best: {n} days", es: "Mejor: {n} días" },

  "settings.title": { en: "Settings", es: "Ajustes" },
  "settings.sub": { en: "Legal and app information.", es: "Información legal y de la app." },
  "settings.item.how": { en: "How It Works", es: "Cómo funciona" },
  "settings.item.privacy": { en: "Privacy Policy", es: "Política de privacidad" },
  "settings.item.terms": { en: "Terms of Service", es: "Términos de servicio" },
  "settings.version": { en: "Mindful Movement v0.1 Beta", es: "Mindful Movement v0.1 Beta" },
  "settings.language.label": { en: "Language", es: "Idioma" },
  "settings.language.hint": { en: "Choose your preferred language.", es: "Elige tu idioma preferido." },

  "support.title": { en: "Help & Support", es: "Ayuda y soporte" },
  "support.sub": { en: "We're here for you.", es: "Estamos aquí para ti." },
  "support.body_pre": { en: "For customer support, please email us at ", es: "Para soporte, escríbenos a " },
  "support.body_post": { en: ", and our team will get back to you within 24–48 hours. Thank you.", es: ", y nuestro equipo te responderá en 24–48 horas. Gracias." },

  "reminders.title": { en: "Reminders", es: "Recordatorios" },
  "reminders.intro": { en: "Soft nudges to move, hydrate, and breathe — only when it fits your day.", es: "Avisos suaves para moverte, hidratarte y respirar — solo cuando encajan en tu día." },
  "reminders.gentle": { en: "Gentle reminders", es: "Recordatorios suaves" },
  "reminders.active_hours_status": { en: "Active during your hours", es: "Activos en tus horarios" },
  "reminders.paused_status": { en: "All reminders paused", es: "Todos los recordatorios en pausa" },
  "reminders.enable_browser": { en: "Enable browser notifications →", es: "Activar notificaciones del navegador →" },
  "reminders.enable_browser_sub": { en: "Otherwise reminders show as soft in-app toasts.", es: "De lo contrario, los recordatorios aparecen como avisos dentro de la app." },
  "reminders.active_hours": { en: "Active hours", es: "Horas activas" },
  "reminders.start": { en: "Start", es: "Inicio" },
  "reminders.end": { en: "End", es: "Fin" },
  "reminders.quiet_outside": { en: "Quiet outside {a} – {b}.", es: "Silencio fuera de {a} – {b}." },
  "reminders.frequency": { en: "Frequency", es: "Frecuencia" },
  "reminders.hourly": { en: "hourly", es: "cada hora" },
  "reminders.interval_label": { en: "interval", es: "intervalo" },
  "reminders.what_nudge": { en: "What to nudge", es: "Qué recordar" },
  "reminders.movement": { en: "Movement", es: "Movimiento" },
  "reminders.movement_desc": { en: "Stand, stretch, walk.", es: "Ponte de pie, estírate, camina." },
  "reminders.hydration": { en: "Hydration", es: "Hidratación" },
  "reminders.hydration_desc": { en: "Sip-by-sip check-ins.", es: "Pequeños sorbos a tu ritmo." },
  "reminders.breathing": { en: "Breathing", es: "Respiración" },
  "reminders.breathing_desc": { en: "A few intentional breaths.", es: "Unas respiraciones conscientes." },
  "reminders.quiet_times": { en: "Quiet times", es: "Momentos en silencio" },
  "reminders.quiet_weekends": { en: "Quiet on weekends", es: "Silencio los fines de semana" },
  "reminders.no_nudges_weekend": { en: "No nudges Sat & Sun.", es: "Sin avisos sábado y domingo." },
  "reminders.footer": { en: "Supportive, never demanding.", es: "Acompañando, nunca exigiendo." },
  "reminders.notifs_on": { en: "Notifications on", es: "Notificaciones activadas" },
  "reminders.notifs_on_sub": { en: "We'll nudge you gently.", es: "Te avisaremos con suavidad." },

  "onb.step": { en: "Step {n} of 3", es: "Paso {n} de 3" },
  "onb.step1.title": { en: "What does your day look like?", es: "¿Cómo es tu día?" },
  "onb.step1.sub": { en: "Pick the lifestyle that fits best. You can change this anytime.", es: "Elige el estilo de vida que mejor te describa. Puedes cambiarlo cuando quieras." },
  "onb.step2.title": { en: "What feels most supportive?", es: "¿Qué te apoyaría más?" },
  "onb.step2.sub": { en: "Choose any goals that matter to you. Skip if you'd rather explore.", es: "Elige los objetivos que te importen. Sáltatelo si prefieres explorar." },
  "onb.step3.title": { en: "When should we check in?", es: "¿Cuándo te recordamos?" },
  "onb.step3.sub": { en: "Gentle reminders, on your schedule.", es: "Recordatorios suaves, a tu ritmo." },
  "onb.start_rotation": { en: "We'll start your rotation with", es: "Empezaremos tu rotación con" },
  "onb.tune_later": { en: "You can fine-tune this anytime from your profile.", es: "Puedes ajustarlo cuando quieras desde tu perfil." },
  "onb.reminder_window": { en: "Reminder window", es: "Ventana de recordatorios" },
  "onb.how_often": { en: "How often?", es: "¿Con qué frecuencia?" },
  "onb.back": { en: "Back", es: "Atrás" },
  "onb.enter": { en: "Enter your space", es: "Entrar a tu espacio" },
  "onb.choose_lifestyle": { en: "Choose a lifestyle to continue.", es: "Elige un estilo de vida para continuar." },
  "onb.welcome": { en: "Welcome in. Your space is ready.", es: "Bienvenido. Tu espacio está listo." },
  "onb.window.morning": { en: "Morning", es: "Mañana" },
  "onb.window.workday": { en: "Workday", es: "Jornada laboral" },
  "onb.window.afternoon": { en: "Afternoon", es: "Tarde" },
  "onb.window.all_day": { en: "All day", es: "Todo el día" },
  "onb.interval.30": { en: "Every 30 min", es: "Cada 30 min" },
  "onb.interval.60": { en: "Every hour", es: "Cada hora" },
  "onb.interval.90": { en: "Every 90 min", es: "Cada 90 min" },
  "onb.interval.120": { en: "Every 2 hours", es: "Cada 2 horas" },

  "session.guided": { en: "Guided session", es: "Sesión guiada" },
  "session.left": { en: "{t} left", es: "{t} restante" },
  "session.step_of": { en: "Step {i} of {n}", es: "Paso {i} de {n}" },
  "session.up_next": { en: "Up next", es: "A continuación" },
  "session.pause": { en: "Pause", es: "Pausar" },
  "session.resume": { en: "Resume", es: "Reanudar" },
  "session.next": { en: "Next", es: "Siguiente" },
  "session.complete": { en: "Session complete", es: "Sesión completa" },
  "session.movements": { en: "{n} movements", es: "{n} movimientos" },
  "session.min": { en: "{n} min", es: "{n} min" },
  "session.back_home": { en: "Back home", es: "Volver al inicio" },
  "session.view_progress": { en: "View progress", es: "Ver progreso" },
  "session.preparing": { en: "Preparing your session…", es: "Preparando tu sesión…" },
  "session.finish_first": { en: "Finish the timer to continue", es: "Termina el temporizador para continuar" },

  "edit.title": { en: "Edit profile", es: "Editar perfil" },
  "edit.desc": { en: "Personalize Mindful Movement to fit your day.", es: "Personaliza Mindful Movement a tu día." },
  "edit.name": { en: "Your name", es: "Tu nombre" },
  "edit.fitness": { en: "Fitness level", es: "Nivel físico" },
  "edit.fitness.placeholder": { en: "Select your level", es: "Elige tu nivel" },
  "edit.lifestyle": { en: "Lifestyle", es: "Estilo de vida" },
  "edit.lifestyle.placeholder": { en: "Select your lifestyle", es: "Elige tu estilo de vida" },
  "edit.work_style": { en: "Work style", es: "Estilo de trabajo" },
  "edit.work_style.placeholder": { en: "How do you spend your day?", es: "¿Cómo pasas tu día?" },
  "edit.goals": { en: "Wellness goals", es: "Objetivos de bienestar" },
  "edit.water": { en: "Daily water goal (oz)", es: "Meta diaria de agua (oz)" },
  "edit.updated": { en: "Profile updated", es: "Perfil actualizado" },

  "error.404_title": { en: "Page not found", es: "Página no encontrada" },
  "error.404_sub": { en: "The page you're looking for doesn't exist or has been moved.", es: "La página que buscas no existe o fue movida." },
  "error.go_home": { en: "Go home", es: "Ir al inicio" },
  "error.title": { en: "This page didn't load", es: "La página no cargó" },
  "error.sub": { en: "Something went wrong on our end. You can try refreshing or head back home.", es: "Algo salió mal de nuestro lado. Intenta recargar o vuelve al inicio." },
  "error.try_again": { en: "Try again", es: "Intentar de nuevo" },
};

function format(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function readInitialLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "es" ? "es" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(readInitialLang());
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("language")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      const remote = (data as { language?: string } | null)?.language;
      if (remote === "es" || remote === "en") {
        setLangState(remote);
        try {
          window.localStorage.setItem(STORAGE_KEY, remote);
        } catch {
          /* ignore */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      try {
        window.localStorage.setItem(STORAGE_KEY, l);
      } catch {
        /* ignore */
      }
      if (user) {
        void supabase.from("profiles").update({ language: l }).eq("id", user.id);
      }
    },
    [user],
  );

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const entry = dict[key];
      if (!entry) return key;
      return format(entry[lang] ?? entry.en, vars);
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      lang: "en",
      setLang: () => {},
      t: (key, vars) => format(dict[key]?.en ?? key, vars),
    };
  }
  return ctx;
}
