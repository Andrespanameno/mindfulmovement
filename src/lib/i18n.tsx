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

  "tutorial.aria": { en: "Welcome tour", es: "Recorrido de bienvenida" },

  "welcome.title": { en: "Welcome to Mindful Movement", es: "Bienvenido a Mindful Movement" },
  "welcome.body1": {
    en: "Life gets busy. Your health shouldn't have to wait.",
    es: "La vida es ajetreada. Tu salud no debería esperar.",
  },
  "welcome.body2": {
    en: "Mindful Movement helps improve your physical and mental well-being through simple movement, breathing, hydration, and mindfulness breaks that fit into even the busiest day.",
    es: "Mindful Movement te ayuda a mejorar tu bienestar físico y mental con pausas simples de movimiento, respiración, hidratación y atención plena que encajan hasta en el día más ocupado.",
  },
  "welcome.body3": {
    en: "Micro consistency. Macro results.",
    es: "Micro constancia. Macro resultados.",
  },
  "welcome.cta": { en: "Got It", es: "Entendido" },

  "tutorial.skip_aria": { en: "Skip tour", es: "Omitir recorrido" },
  "tutorial.skip": { en: "Skip", es: "Omitir" },
  "tutorial.next": { en: "Next", es: "Siguiente" },
  "tutorial.got_it": { en: "Got it", es: "Entendido" },
  "tutorial.step_of": { en: "{a} of {b}", es: "{a} de {b}" },
  "tutorial.guided.title": { en: "Guided sessions", es: "Sesiones guiadas" },
  "tutorial.guided.body": {
    en: "Your guided sessions help you reset, move, and recharge in just a few minutes throughout the day.",
    es: "Tus sesiones guiadas te ayudan a hacer una pausa, moverte y recargar energía en pocos minutos durante el día.",
  },
  "tutorial.xp.title": { en: "XP & leveling", es: "XP y niveles" },
  "tutorial.xp.body": {
    en: "Completing movements earns XP. Levels are a gentle reflection of your consistency over time.",
    es: "Completar movimientos te da XP. Los niveles son un reflejo suave de tu constancia con el tiempo.",
  },
  "tutorial.hydration.title": { en: "Hydration goal", es: "Meta de hidratación" },
  "tutorial.hydration.body": {
    en: "Log water through the day to build a steady hydration habit, sip by sip.",
    es: "Registra el agua que tomas durante el día para crear un hábito constante, sorbo a sorbo.",
  },
  "tutorial.move.title": { en: "Movement tab", es: "Pestaña de movimiento" },
  "tutorial.move.body": {
    en: "Tap here to explore all movements, stretches, breathing exercises, and resets.",
    es: "Toca esta pestaña para explorar movimientos, estiramientos, respiraciones y pausas.",
  },
  "tutorial.progress.title": { en: "Progress tab", es: "Pestaña de progreso" },
  "tutorial.progress.body": {
    en: "Track your weekly and monthly progress: consistency, movement, hydration, and milestones.",
    es: "Sigue tu progreso semanal y mensual: constancia, movimiento, hidratación y logros.",
  },
  "tutorial.profile.title": { en: "Profile", es: "Perfil" },
  "tutorial.profile.body": {
    en: "Manage your preferences, reminders, language, and settings anytime.",
    es: "Gestiona tus preferencias, recordatorios, idioma y ajustes cuando quieras.",
  },

  "nav.home": { en: "Home", es: "Inicio" },
  "nav.move": { en: "Move", es: "Movimiento" },
  "nav.progress": { en: "Progress", es: "Progreso" },
  "nav.profile": { en: "Profile", es: "Perfil" },

  "auth.signin.title": { en: "Welcome back to your center", es: "¡Qué bueno verte de nuevo!" },
  "auth.signin.sub": { en: "Take a deep breath. Let's start your day with intention.", es: "Respira profundo. Comencemos el día con intención." },
  "auth.signin.cta": { en: "Enter your space", es: "Entrar a tu espacio" },
  "auth.signup.title": { en: "Begin your gentle journey", es: "Empieza tu camino, a tu ritmo" },
  "auth.signup.sub": { en: "Small actions create big change. Create your space.", es: "Las acciones pequeñas hacen grandes cambios. Crea tu espacio." },
  "auth.signup.cta": { en: "Create account", es: "Crear cuenta" },
  "auth.forgot.title": { en: "Let's get you back in", es: "Recuperemos tu acceso" },
  "auth.forgot.sub": { en: "We'll send a reset link to your email.", es: "Te enviaremos un enlace de recuperación a tu correo." },
  "auth.forgot.cta": { en: "Send reset link", es: "Enviar enlace" },
  "auth.name": { en: "Your name", es: "Tu nombre" },
  "auth.email": { en: "Email address", es: "Correo electrónico" },
  "auth.password": { en: "Password", es: "Contraseña" },
  "auth.forgot_link": { en: "Forgot your password?", es: "¿Olvidaste tu contraseña?" },
  "auth.new_here": { en: "New to Mindful Movement?", es: "¿Nuevo en Mindful Movement?" },
  "auth.begin": { en: "Begin journey and create an account", es: "Comenzar y crear una cuenta" },
  "auth.back_signin": { en: "Back to sign in", es: "Volver a iniciar sesión" },
  "auth.invalid": { en: "Invalid email or password.", es: "El correo o la contraseña no coinciden." },
  "auth.signup.success": { en: "Account created. Check your email to confirm, then sign in.", es: "Cuenta creada. Revisa tu correo para confirmar y luego inicia sesión." },
  "auth.reset.success": { en: "Reset link sent. Check your email.", es: "Enlace enviado. Revisa tu correo." },
  "auth.validation.email_required": {
    en: "Please enter your email address.",
    es: "Por favor, ingresa tu correo electrónico.",
  },
  "auth.validation.email_invalid": {
    en: "Please enter a valid email address (e.g. name@example.com).",
    es: "Ingresa un correo electrónico válido (ej. nombre@ejemplo.com).",
  },
  "auth.validation.email_incomplete": {
    en: "Please enter a part following '@'. Email is incomplete.",
    es: "Ingresa la parte que va después del '@'. El correo está incompleto.",
  },
  "auth.validation.password_required": {
    en: "Please enter your password.",
    es: "Ingresa tu contraseña.",
  },
  "auth.validation.password_short": {
    en: "Password must be at least 6 characters.",
    es: "La contraseña debe tener al menos 6 caracteres.",
  },
  "auth.validation.name_required": {
    en: "Please enter your name.",
    es: "Ingresa tu nombre.",
  },

  "home.greeting.morning": { en: "Good morning, {name}", es: "Buenos días, {name}" },
  "home.greeting.afternoon": { en: "Good afternoon, {name}", es: "Buenas tardes, {name}" },
  "home.greeting.evening": { en: "Good evening, {name}", es: "Buenas noches, {name}" },
  "home.title": { en: "Today is a fresh start", es: "Hoy empieza de nuevo" },
  "home.guided.eyebrow": { en: "Guided session", es: "Sesión guiada" },
  "home.guided.title": { en: "Start a 5-minute reset", es: "Date una pausa de 5 minutos" },
  "home.guided.sub": { en: "A few gentle movements, timed for you.", es: "Unos movimientos suaves, a tu ritmo." },
  "home.hydration.title": { en: "Hydration Goal", es: "Meta de hidratación" },
  "home.hydration.reached": { en: "Goal reached. Beautifully done.", es: "¡Meta cumplida! Muy bien hecho." },
  "home.hydration.remaining": { en: "{n} oz to reach your mark.", es: "{n} oz para alcanzar tu meta." },
  "home.xp_today": { en: "XP Today", es: "XP de hoy" },
  "home.xp_tip": { en: "Every movement counts.", es: "Cada movimiento suma." },

  "move.eyebrow": { en: "Today's invitation", es: "Tu propuesta de hoy" },
  "move.title": { en: "Move a little", es: "Muévete un poco" },
  "move.featured": { en: "Featured", es: "Destacado" },
  "move.featured.title": { en: "Morning Awakening", es: "Despertar de la mañana" },
  "move.featured.sub_default": { en: "A few minutes is all it takes to feel a shift.", es: "Con unos minutos ya vas a sentir el cambio." },
  "move.featured.completed_one": { en: "1 session completed today. Keep flowing.", es: "Llevas 1 sesión hoy. Sigue así." },
  "move.featured.completed_many": { en: "{n} sessions completed today. Keep flowing.", es: "Llevas {n} sesiones hoy. Sigue así." },
  "move.filter.all": { en: "All", es: "Todo" },

  "hydration.title": { en: "Hydration", es: "Hidratación" },
  "hydration.of_today": { en: "of {goal} oz today", es: "de {goal} oz hoy" },
  "hydration.goal_complete": { en: "Goal complete", es: "Meta cumplida" },
  "hydration.to_go": { en: "{n} oz to go · small sips, steady progress.", es: "Te faltan {n} oz · sorbos pequeños, vas muy bien." },
  "hydration.quick_add": { en: "Quick add", es: "Agregar rápido" },
  "hydration.undo": { en: "Undo last {n} oz", es: "Deshacer las últimas {n} oz" },
  "hydration.reminders_label": { en: "Hydration reminders", es: "Recordatorios de hidratación" },
  "hydration.reminders_on": { en: "Gentle nudge every {n} min while open", es: "Recordatorio suave cada {n} min mientras tengas la app abierta" },
  "hydration.reminders_off": { en: "Off, turn on to get a gentle nudge", es: "Desactivado. Actívalo para recibir un recordatorio suave" },
  "hydration.toast.logged": { en: "+{n} oz logged", es: "+{n} oz anotadas" },
  "hydration.toast.xp": { en: "+{xp} XP · Small sips, big impact.", es: "+{xp} XP · Sorbos pequeños, gran diferencia." },
  "hydration.toast.keep": { en: "Keep sipping gently.", es: "Sigue así, sin presiones." },
  "hydration.toast.goal": { en: "Daily hydration goal reached 🌿", es: "¡Meta de hidratación cumplida! 🌿" },
  "hydration.toast.goal_sub": { en: "Beautifully done. Your body thanks you.", es: "Muy bien hecho. Tu cuerpo te lo agradece." },
  "hydration.toast.sip": { en: "Time for a sip 💧", es: "Momento para un sorbo 💧" },
  "hydration.toast.sip_sub": { en: "A quick glass keeps you steady.", es: "Un vasito te ayuda a mantener el ritmo." },
  "hydration.keep_going": { en: "Keep Going", es: "Continuar" },
  "hydration.keep_going_started": { en: "New round started", es: "¡Comenzó una ronda nueva!" },
  "hydration.keep_going_sub": { en: "Keep the momentum, every sip counts.", es: "Sigue así, cada sorbo suma." },
  "hydration.total_today": { en: "Total today", es: "Total de hoy" },
  "hydration.round": { en: "Round", es: "Ronda" },

  "progress.title": { en: "Your Journey", es: "Tu camino" },
  "progress.sub": { en: "Small actions, real change, here's how it's adding up.", es: "Acciones pequeñas, cambios reales. Así vas avanzando." },
  "progress.this_week": { en: "This week", es: "Esta semana" },
  "progress.this_month": { en: "This month", es: "Este mes" },
  "progress.highlights": { en: "Highlights", es: "Aspectos destacados" },
  "progress.active_days_week": { en: "Active days this week", es: "Días activos esta semana" },
  "progress.active_days_month": { en: "Active days this month", es: "Días activos este mes" },
  "progress.active_days_hint": { en: "You showed up", es: "Días en los que estuviste presente" },
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
  "progress.streak_history": { en: "Streak history", es: "Historial de constancia" },
  "progress.peak_one": { en: "Peak run: 1 day", es: "Tu mejor constancia: 1 día seguido" },
  "progress.peak_other": { en: "Peak run: {n} days", es: "Tu mejor constancia: {n} días seguidos" },
  "progress.current_best": { en: "Current {c} · Best {b}", es: "Actual {c} · Mejor {b}" },
  "progress.lifetime": { en: "Lifetime totals", es: "Totales acumulados" },
  "progress.total_sessions": { en: "Movement sessions", es: "Sesiones de movimiento" },
  "progress.total_minutes": { en: "Movement minutes", es: "Minutos de movimiento" },
  "progress.total_pushups": { en: "Total pushups", es: "Total de flexiones" },
  "progress.total_squats": { en: "Total squats", es: "Total de sentadillas" },
  "progress.total_breathing": { en: "Breathing sessions", es: "Sesiones de respiración" },
  "progress.milestones": { en: "Milestones", es: "Logros" },
  "progress.ready": { en: "Ready when you are", es: "Cuando tú quieras" },
  "progress.from_prev": { en: "from {n} last period", es: "antes eran {n}" },
  "progress.vs_prev": { en: "vs prev", es: "vs. periodo anterior" },
  "progress.pp_week": { en: "pp wk/wk", es: "pts respecto a la semana pasada" },
  "progress.pp_month": { en: "pp mo/mo", es: "pts respecto al mes pasado" },
  "progress.day_label": { en: "Day {n}", es: "Día {n}" },
  "progress.streak_label": { en: "streak {n}", es: "constancia {n}" },

  "progress.sum.sessions_one_week": { en: "You completed 1 mindful movement this week.", es: "Completaste 1 sesión de movimiento esta semana." },
  "progress.sum.sessions_many_week": { en: "You completed {n} mindful movements this week.", es: "Completaste {n} sesiones de movimiento esta semana." },
  "progress.sum.sessions_one_month": { en: "You completed 1 mindful movement this month.", es: "Completaste 1 sesión de movimiento este mes." },
  "progress.sum.sessions_many_month": { en: "You completed {n} mindful movements this month.", es: "Completaste {n} sesiones de movimiento este mes." },
  "progress.sum.hours_week": { en: "You accumulated {h} hours of intentional movement this week.", es: "Sumaste {h} horas de movimiento esta semana." },
  "progress.sum.hours_month": { en: "You accumulated {h} hours of intentional movement this month.", es: "Sumaste {h} horas de movimiento este mes." },
  "progress.sum.pushups": { en: "Your pushups improved from {a} to {b}.", es: "Tus flexiones mejoraron de {a} a {b}." },
  "progress.sum.squats": { en: "Your squats improved from {a} to {b}.", es: "Tus sentadillas mejoraron de {a} a {b}." },
  "progress.sum.hydration_week": { en: "Your hydration consistency improved this week (+{n} points).", es: "Te hidrataste con más constancia esta semana (+{n} puntos)." },
  "progress.sum.hydration_month": { en: "Your hydration consistency improved this month (+{n} points).", es: "Te hidrataste con más constancia este mes (+{n} puntos)." },
  "progress.sum.consistency_week": { en: "Your consistency improved this week (+{n}%).", es: "Vas con más constancia esta semana (+{n}%)." },
  "progress.sum.consistency_month": { en: "Your consistency improved this month (+{n}%).", es: "Vas con más constancia este mes (+{n}%)." },
  "progress.sum.breathing_one_week": { en: "You took 1 mindful breathing session this week.", es: "Hiciste 1 sesión de respiración esta semana." },
  "progress.sum.breathing_many_week": { en: "You took {n} mindful breathing sessions this week.", es: "Hiciste {n} sesiones de respiración esta semana." },
  "progress.sum.breathing_one_month": { en: "You took 1 mindful breathing session this month.", es: "Hiciste 1 sesión de respiración este mes." },
  "progress.sum.breathing_many_month": { en: "You took {n} mindful breathing sessions this month.", es: "Hiciste {n} sesiones de respiración este mes." },

  "profile.edit": { en: "Edit profile", es: "Editar perfil" },
  "profile.day_streak": { en: "Streak", es: "Constancia" },
  "profile.total_xp": { en: "Total XP", es: "XP total" },
  "profile.today": { en: "Today", es: "Hoy" },
  "profile.group.wellness": { en: "Wellness", es: "Bienestar" },
  "profile.group.account": { en: "Account", es: "Cuenta" },
  "profile.menu.reminders": { en: "Reminders", es: "Recordatorios" },
  "profile.menu.settings": { en: "Settings", es: "Ajustes" },
  "profile.menu.support": { en: "Help & support", es: "Ayuda y soporte" },
  "profile.signout": { en: "Sign out", es: "Cerrar sesión" },
  "profile.streak": { en: "Streak", es: "Constancia" },
  "profile.days": { en: "days", es: "días" },
  "profile.best_one": { en: "Best: 1 day", es: "Mejor: 1 día" },
  "profile.best_other": { en: "Best: {n} days", es: "Mejor: {n} días" },

  "xp.level": { en: "Level {n}", es: "Nivel {n}" },
  "xp.to_next": { en: "{a} / {b} XP to Level {n}", es: "{a} / {b} XP para el nivel {n}" },

  "mv.cat_label": { en: "Category", es: "Categoría" },
  "mv.start": { en: "Start", es: "Empezar" },
  "mv.done": { en: "Done", es: "Hecho" },
  "mv.undo": { en: "Undo", es: "Deshacer" },
  "mv.min_short": { en: "min", es: "min" },
  "mv.toast.undone": { en: "Undone · -{xp} XP", es: "Marcado como no hecho · -{xp} XP" },
  "mv.toast.undone_sub": { en: "No worries, marked as not done.", es: "Sin problema, marcado como no hecho." },
  "mv.toast.xp": { en: "+{xp} XP", es: "+{xp} XP" },

  "edit.cancel": { en: "Cancel", es: "Cancelar" },
  "edit.save": { en: "Save changes", es: "Guardar cambios" },
  "edit.saving": { en: "Saving…", es: "Guardando…" },

  "how.title": { en: "How It Works", es: "Cómo funciona" },
  "how.intro": {
    en: "Mindful Movement helps busy adults build healthier daily habits through small intentional movement sessions that fit naturally into real life.",
    es: "Mindful Movement te ayuda, en medio de un día ocupado, a crear hábitos más saludables con sesiones cortas de movimiento que encajan naturalmente en tu rutina.",
  },
  "how.schedule": {
    en: "Set your preferred reminder schedule and complete short guided movement resets throughout the day based on your lifestyle and routine.",
    es: "Configura tus recordatorios y completa breves reinicios de movimiento guiado a lo largo del día según tu estilo de vida y rutina.",
  },
  "how.combines": { en: "The app combines:", es: "La app combina:" },
  "how.feature.micro": { en: "Micro workouts", es: "Micro entrenamientos" },
  "how.feature.mobility": { en: "Mobility", es: "Movilidad" },
  "how.feature.posture": { en: "Posture resets", es: "Reinicios de postura" },
  "how.feature.breathing": { en: "Breathing exercises", es: "Ejercicios de respiración" },
  "how.feature.hydration": { en: "Hydration reminders", es: "Recordatorios de hidratación" },
  "how.feature.prompts": { en: "Mindful wellness prompts", es: "Mensajes de bienestar" },
  "how.track": {
    en: "Track your consistency, movement, hydration, breathing, and progress over time, one small action at a time.",
    es: "Sigue tu constancia, movimiento, hidratación, respiración y progreso a lo largo del tiempo, una pequeña acción a la vez.",
  },
  "how.philosophy_label": { en: "Core Philosophy", es: "Filosofía central" },
  "how.philosophy": { en: "\"Micro actions. Macro results.\"", es: "\"Acciones micro. Resultados macro.\"" },

  "privacy.title": { en: "Privacy Policy", es: "Política de privacidad" },
  "privacy.intro": {
    en: "This Privacy Policy describes how Mindful Movement collects, uses, and protects your personal information when you use our app.",
    es: "Esta Política de Privacidad describe cómo Mindful Movement recopila, utiliza y protege tu información personal cuando usas la app.",
  },
  "privacy.h.collect": { en: "Information We Collect", es: "Información que recopilamos" },
  "privacy.p.collect": {
    en: "We collect information you provide directly, such as your profile details, wellness preferences, and session activity. This helps us personalize your experience and track your progress.",
    es: "Recopilamos la información que nos das directamente, como datos de tu perfil, preferencias de bienestar y actividad de sesiones. Esto nos ayuda a personalizar tu experiencia y seguir tu progreso.",
  },
  "privacy.h.use": { en: "How We Use Your Information", es: "Cómo usamos tu información" },
  "privacy.p.use": {
    en: "We use your data to deliver personalized movement recommendations, track your wellness journey, send helpful reminders, and improve the app experience.",
    es: "Usamos tus datos para ofrecer recomendaciones de movimiento personalizadas, seguir tu camino de bienestar, enviar recordatorios útiles y mejorar la app.",
  },
  "privacy.h.security": { en: "Data Security", es: "Seguridad de los datos" },
  "privacy.p.security": {
    en: "We take reasonable measures to protect your information from unauthorized access, disclosure, or loss. Your data is stored securely and encrypted in transit.",
    es: "Tomamos medidas razonables para proteger tu información frente a accesos no autorizados, divulgación o pérdida. Tus datos se almacenan de forma segura y se cifran en tránsito.",
  },
  "privacy.h.choices": { en: "Your Choices", es: "Tus opciones" },
  "privacy.p.choices": {
    en: "You can update your profile, adjust reminder preferences, or contact us to inquire about your data at any time.",
    es: "Puedes actualizar tu perfil, ajustar los recordatorios o contactarnos para consultar sobre tus datos en cualquier momento.",
  },
  "privacy.h.changes": { en: "Changes to This Policy", es: "Cambios en esta política" },
  "privacy.p.changes": {
    en: "We may update this Privacy Policy from time to time. Any changes will be posted within the app, and we encourage you to review it periodically.",
    es: "Podemos actualizar esta Política de Privacidad de vez en cuando. Publicaremos cualquier cambio dentro de la app y te animamos a revisarla periódicamente.",
  },
  "privacy.contact_pre": { en: "If you have any questions about this Privacy Policy, please contact us at ", es: "Si tienes preguntas sobre esta Política de Privacidad, contáctanos en " },
  "privacy.contact_post": { en: ".", es: "." },

  "terms.title": { en: "Terms of Service", es: "Términos de servicio" },
  "terms.intro": {
    en: "By using the Mindful Movement app, you agree to these Terms of Service. Please read them carefully before continuing.",
    es: "Al usar la app Mindful Movement, aceptas estos Términos de Servicio. Léelos con atención antes de continuar.",
  },
  "terms.h.use": { en: "Use of the App", es: "Uso de la app" },
  "terms.p.use": {
    en: "Mindful Movement is designed to support your wellness journey with gentle movement reminders, hydration tracking, and progress insights. It is not a substitute for professional medical advice, diagnosis, or treatment.",
    es: "Mindful Movement está diseñada para acompañar tu camino de bienestar con recordatorios suaves de movimiento, seguimiento de hidratación y resúmenes de progreso. No sustituye consejo médico profesional, diagnóstico o tratamiento.",
  },
  "terms.h.account": { en: "Your Account", es: "Tu cuenta" },
  "terms.p.account": {
    en: "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Please notify us immediately of any unauthorized use.",
    es: "Eres responsable de mantener la confidencialidad de tus credenciales y de toda la actividad bajo tu cuenta. Avísanos de inmediato si detectas un uso no autorizado.",
  },
  "terms.h.ip": { en: "Content and Intellectual Property", es: "Contenido y propiedad intelectual" },
  "terms.p.ip": {
    en: "All content within the app, including text, graphics, and software, is the property of Mindful Movement or its licensors and is protected by applicable intellectual property laws.",
    es: "Todo el contenido de la app, incluidos textos, gráficos y software, es propiedad de Mindful Movement o sus licenciantes y está protegido por las leyes de propiedad intelectual aplicables.",
  },
  "terms.h.liability": { en: "Limitation of Liability", es: "Limitación de responsabilidad" },
  "terms.p.liability": {
    en: "To the fullest extent permitted by law, Mindful Movement shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app.",
    es: "En la medida máxima permitida por la ley, Mindful Movement no será responsable de daños indirectos, incidentales o consecuentes derivados del uso de la app.",
  },
  "terms.h.changes": { en: "Changes to These Terms", es: "Cambios a estos términos" },
  "terms.p.changes": {
    en: "We may modify these Terms of Service at any time. Continued use of the app after changes constitutes your acceptance of the revised terms.",
    es: "Podemos modificar estos Términos de Servicio en cualquier momento. El uso continuado de la app tras los cambios implica tu aceptación de los términos revisados.",
  },
  "terms.contact_pre": { en: "If you have any questions about these Terms, please contact us at ", es: "Si tienes preguntas sobre estos Términos, contáctanos en " },

  "settings.title": { en: "Settings", es: "Ajustes" },
  "settings.sub": { en: "Legal and app information.", es: "Información legal y de la app." },
  "settings.item.how": { en: "How It Works", es: "Cómo funciona" },
  "settings.item.privacy": { en: "Privacy Policy", es: "Política de privacidad" },
  "settings.item.terms": { en: "Terms of Service", es: "Términos de servicio" },
  "settings.version": { en: "Mindful Movement v0.1 Beta", es: "Mindful Movement v0.1 Beta" },
  "settings.language.label": { en: "Language", es: "Idioma" },
  "settings.language.hint": { en: "Choose your preferred language.", es: "Elige tu idioma preferido." },
  "settings.replay_tour": { en: "Replay welcome tour", es: "Repetir tutorial de bienvenida" },
  "settings.replay_preparing": { en: "Preparing…", es: "Preparando…" },
  "settings.delete_account": { en: "Delete account", es: "Eliminar cuenta" },
  "settings.delete_confirm_title": { en: "Delete your account?", es: "¿Eliminar tu cuenta?" },
  "settings.delete_confirm_desc": {
    en: "This will permanently remove your profile, progress, hydration history, streaks, XP, and saved data. This action cannot be undone.",
    es: "Se eliminarán de forma permanente tu perfil, progreso, historial de hidratación, constancia, XP y datos guardados. No vas a poder deshacer esta acción.",
  },
  "settings.delete_action": { en: "Delete account", es: "Eliminar cuenta" },
  "settings.deleting": { en: "Deleting…", es: "Eliminando…" },
  "settings.delete_success": { en: "Account deleted", es: "Cuenta eliminada" },
  "settings.delete_error": { en: "Could not delete account: {message}", es: "No se pudo eliminar la cuenta: {message}" },
  "settings.replay_error": { en: "Could not reset the tour. Please try again.", es: "No se pudo reiniciar el recorrido. Inténtalo de nuevo." },

  "support.title": { en: "Help & Support", es: "Ayuda y soporte" },
  "support.sub": { en: "We're here for you.", es: "Estamos aquí para ti." },
  "support.body_pre": { en: "For customer support, please email us at ", es: "Para soporte, escríbenos a " },
  "support.body_post": { en: ", and our team will get back to you within 24–48 hours. Thank you.", es: ", y nuestro equipo te responderá en 24–48 horas. Gracias." },

  "reminders.title": { en: "Reminders", es: "Recordatorios" },
  "reminders.intro": { en: "Soft nudges to move, hydrate, and breathe, only when it fits your day.", es: "Recordatorios suaves para moverte, hidratarte y respirar, solo cuando encajen en tu día." },
  "reminders.gentle": { en: "Gentle reminders", es: "Recordatorios amables" },
  "reminders.active_hours_status": { en: "Active during your hours", es: "Activos en tus horarios" },
  "reminders.paused_status": { en: "All reminders paused", es: "Todos los recordatorios en pausa" },
  "reminders.enable_browser": { en: "Enable browser notifications →", es: "Activar notificaciones del navegador →" },
  "reminders.enable_browser_sub": { en: "Otherwise reminders show as soft in-app toasts.", es: "Si no, los recordatorios aparecerán dentro de la app." },
  "reminders.active_hours": { en: "Active hours", es: "Horas activas" },
  "reminders.start": { en: "Start", es: "Inicio" },
  "reminders.end": { en: "End", es: "Fin" },
  "reminders.quiet_outside": { en: "Quiet outside {a} – {b}.", es: "Silencio fuera de {a} – {b}." },
  "reminders.frequency": { en: "Frequency", es: "Frecuencia" },
  "reminders.hourly": { en: "hourly", es: "cada hora" },
  "reminders.interval_label": { en: "interval", es: "intervalo" },
  "reminders.what_nudge": { en: "What to nudge", es: "Tipos de recordatorio" },
  "reminders.movement": { en: "Movement", es: "Movimiento" },
  "reminders.movement_desc": { en: "Stand, stretch, walk.", es: "Párate, estírate, camina." },
  "reminders.hydration": { en: "Hydration", es: "Hidratación" },
  "reminders.hydration_desc": { en: "Sip-by-sip check-ins.", es: "Pequeños sorbos, a tu ritmo." },
  "reminders.breathing": { en: "Breathing", es: "Respiración" },
  "reminders.breathing_desc": { en: "A few intentional breaths.", es: "Unas respiraciones tranquilas." },
  "reminders.quiet_times": { en: "Quiet times", es: "Momentos en silencio" },
  "reminders.quiet_weekends": { en: "Quiet on weekends", es: "Silencio los fines de semana" },
  "reminders.no_nudges_weekend": { en: "No nudges Sat & Sun.", es: "Sin recordatorios los sábados y domingos." },
  "reminders.footer": { en: "Supportive, never demanding.", es: "Te acompañamos, sin presionarte." },
  "reminders.notifs_on": { en: "Notifications on", es: "Notificaciones activadas" },
  "reminders.notifs_on_sub": { en: "We'll nudge you gently.", es: "Te avisaremos con suavidad." },

  "onb.step": { en: "Step {n} of 3", es: "Paso {n} de 3" },
  "onb.step1.title": { en: "What does your day look like?", es: "¿Cómo es tu día?" },
  "onb.step1.sub": { en: "Pick the lifestyle that fits best. You can change this anytime.", es: "Elige el estilo de vida que mejor te describa. Puedes cambiarlo cuando quieras." },
  "onb.step2.title": { en: "What feels most supportive?", es: "¿Qué te ayudaría más?" },
  "onb.step2.sub": { en: "Choose any goals that matter to you. Skip if you'd rather explore.", es: "Elige los objetivos que más te importen. Puedes saltarlo si prefieres explorar." },
  "onb.step3.title": { en: "When should we check in?", es: "¿Cuándo te recordamos?" },
  "onb.step3.sub": { en: "Gentle reminders, on your schedule.", es: "Recordatorios suaves, a tu ritmo." },
  "onb.start_rotation": { en: "We'll start your rotation with", es: "Empezaremos con" },
  "onb.tune_later": { en: "You can fine-tune this anytime from your profile.", es: "Puedes ajustarlo cuando quieras desde tu perfil." },
  "onb.reminder_window": { en: "Reminder window", es: "Horario de recordatorios" },
  "onb.how_often": { en: "How often?", es: "¿Con qué frecuencia?" },
  "onb.back": { en: "Back", es: "Atrás" },
  "onb.enter": { en: "Enter your space", es: "Entrar a tu espacio" },
  "onb.choose_lifestyle": { en: "Choose a lifestyle to continue.", es: "Selecciona un estilo de vida para continuar." },
  "onb.welcome": { en: "Welcome in. Your space is ready.", es: "¡Bienvenida/o! Tu espacio está listo." },
  "onb.window.morning": { en: "Morning", es: "Mañana" },
  "onb.window.workday": { en: "Workday", es: "Jornada laboral" },
  "onb.window.afternoon": { en: "Afternoon", es: "Tarde" },
  "onb.window.all_day": { en: "All day", es: "Todo el día" },
  "onb.interval.30": { en: "Every 30 min", es: "Cada 30 min" },
  "onb.interval.60": { en: "Every hour", es: "Cada hora" },
  "onb.interval.90": { en: "Every 90 min", es: "Cada 90 min" },
  "onb.interval.120": { en: "Every 2 hours", es: "Cada 2 horas" },
  "onb.reminder_note": {
    en: "The reminder cadence can be adjusted anytime in your Profile settings once you're in the app.",
    es: "Puedes ajustar la frecuencia de los recordatorios cuando quieras desde tu Perfil.",
  },

  "session.guided": { en: "Guided session", es: "Sesión guiada" },
  "session.left": { en: "{t} left", es: "Queda {t}" },
  "session.step_of": { en: "Step {i} of {n}", es: "Paso {i} de {n}" },
  "session.up_next": { en: "Up next", es: "A continuación" },
  "session.pause": { en: "Pause", es: "Pausar" },
  "session.resume": { en: "Resume", es: "Reanudar" },
  "session.next": { en: "Next", es: "Siguiente" },
  "session.complete": { en: "Session complete", es: "¡Terminaste la sesión!" },
  "session.movements_one": { en: "1 movement", es: "1 movimiento" },
  "session.movements_other": { en: "{n} movements", es: "{n} movimientos" },
  "session.min": { en: "{n} min", es: "{n} min" },

  "session.aria.end": { en: "End session", es: "Terminar sesión" },
  "session.aria.pause": { en: "Pause", es: "Pausar" },
  "session.aria.resume": { en: "Resume", es: "Reanudar" },
  "session.aria.mark_done": { en: "Mark movement done", es: "Marcar movimiento como hecho" },
  "session.aria.next": { en: "Next movement", es: "Siguiente movimiento" },
  "session.tap_done_first": { en: "Tap Done first", es: "Primero toca Hecho" },

  "mv.aria.undo": { en: "Undo completion", es: "Deshacer" },
  "mv.aria.mark_complete": { en: "Mark complete", es: "Marcar como hecho" },
  "mv.aria.tap_to_undo": { en: "Tap to undo", es: "Toca para deshacer" },
  "mv.aria.start_timer": { en: "Start timer", es: "Iniciar temporizador" },
  "mv.aria.pause_timer": { en: "Pause timer", es: "Pausar temporizador" },
  "mv.aria.resume_timer": { en: "Resume timer", es: "Reanudar temporizador" },
  "mv.aria.stop_timer": { en: "Stop and reset timer", es: "Detener y reiniciar" },
  "mv.aria.mark_done": { en: "Mark done", es: "Marcar como hecho" },

  "milestone.achieved": { en: "Achieved", es: "Logrado" },

  "reset.head_title": { en: "Reset password — Mindful Movement", es: "Restablecer contraseña — Mindful Movement" },
  "reset.head_desc": { en: "Set a new password for your Mindful Movement account.", es: "Crea una nueva contraseña para tu cuenta de Mindful Movement." },
  "reset.title": { en: "Set a new password", es: "Crea una nueva contraseña" },
  "reset.sub": { en: "Choose something you'll remember. Small steps, fresh start.", es: "Elige algo que recuerdes. Pequeños pasos, un nuevo comienzo." },
  "reset.verifying": { en: "Verifying your reset link…", es: "Estamos verificando tu enlace…" },
  "reset.invalid": { en: "This reset link is expired or invalid. Please request a new password reset link.", es: "Este enlace ya no es válido o expiró. Solicita uno nuevo para continuar." },
  "reset.back_signin": { en: "Back to sign in", es: "Volver a iniciar sesión" },
  "reset.label": { en: "New password", es: "Nueva contraseña" },
  "reset.updating": { en: "Updating…", es: "Guardando…" },
  "reset.submit": { en: "Update password", es: "Actualizar contraseña" },
  "reset.success": { en: "Password updated. Welcome back.", es: "Contraseña actualizada. ¡Bienvenida/o de vuelta!" },
  "session.back_home": { en: "Back home", es: "Volver al inicio" },
  "session.view_progress": { en: "View progress", es: "Ver progreso" },
  "session.preparing": { en: "Preparing your session…", es: "Preparando tu sesión, un momento…" },
  "session.finish_first": { en: "Finish the timer to continue", es: "Termina el tiempo para continuar" },

  "edit.title": { en: "Edit profile", es: "Editar perfil" },
  "edit.desc": { en: "Personalize Mindful Movement to fit your day.", es: "Personaliza Mindful Movement según tu día." },
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
  "error.title": { en: "This page didn't load", es: "Esta página no se pudo cargar" },
  "error.sub": { en: "Something went wrong on our end. You can try refreshing or head back home.", es: "Algo falló de nuestro lado. Intenta recargar o vuelve al inicio." },
  "error.try_again": { en: "Try again", es: "Intentar de nuevo" },

  "notif.movement.title": { en: "Mindful Movement", es: "Hora de moverte" },
  "notif.hydration.title": { en: "Hydration check", es: "Pausa de hidratación" },
  "notif.breath.title": { en: "Breath check", es: "Pausa para respirar" },
  "notif.action_start": { en: "Start", es: "Empezar" },
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

function hasStoredLang(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "es" || stored === "en";
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
      const localChoice = hasStoredLang() ? readInitialLang() : null;
      // If the user explicitly picked a language locally (e.g. on the
      // login screen) and it differs from the stored profile value, the
      // local choice wins and we sync it up to the profile. Otherwise
      // adopt the remote preference.
      if (localChoice && (remote === "es" || remote === "en") && remote !== localChoice) {
        void supabase.from("profiles").update({ language: localChoice }).eq("id", user.id);
        return;
      }
      if (!localChoice && (remote === "es" || remote === "en")) {
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
