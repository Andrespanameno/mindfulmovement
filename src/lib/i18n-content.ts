import { useI18n, type Lang } from "@/lib/i18n";

/**
 * Spanish overrides for dynamic / content-driven labels that don't live in the
 * main i18n dictionary (lifestyles, movements, categories, milestones, etc).
 * English values come from the source modules. We only need Spanish here.
 */

export const LIFESTYLE_ES: Record<string, { label: string; description: string }> = {
  "office-desk": { label: "Trabajo en oficina", description: "Pensado para largas horas sentado frente a la pantalla." },
  "remote-desk": { label: "Home office", description: "Recordatorios suaves para tus días trabajando desde casa." },
  "stay-at-home-parent": { label: "Mamá o papá en casa", description: "Movimientos que se acomodan a la crianza y a la rutina del hogar." },
  "active-on-feet": { label: "Trabajo activo o de pie", description: "Movimientos para recuperarte y mantener la movilidad." },
  "hybrid": { label: "Esquema híbrido", description: "Se adapta a tus días en casa y en la oficina." },
  "student": { label: "Estudiante", description: "Pausas útiles entre clases y momentos de estudio." },
  "driver": { label: "Manejas a menudo", description: "Estiramientos y respiración para tus tiempos al volante." },
  "shift-worker": { label: "Trabajo por turnos", description: "Recordatorios flexibles que se acomodan a tus horarios cambiantes." },
  "healthcare": { label: "Personal de salud", description: "Pausas rápidas entre rondas y turnos largos." },
  "retail-hospitality": { label: "Comercio o atención al cliente", description: "Momentos de recuperación para jornadas largas atendiendo al público." },
  "fitness-beginner": { label: "Comenzando con el ejercicio", description: "Puntos de partida suaves para construir un hábito diario." },
  "retired-low-activity": { label: "Jubilado o de baja actividad", description: "Movimiento suave y respiración consciente para días tranquilos." },
  "general-busy": { label: "Día a día ocupado", description: "Pequeñas pausas para sobrellevar días largos." },
};

export const FITNESS_ES: Record<string, string> = {
  beginner: "principiante",
  casual: "casual",
  active: "activo",
  athletic: "atlético",
};

export const WORK_STYLE_ES: Record<string, string> = {
  desk: "escritorio",
  hybrid: "híbrido",
  active: "activo",
  "on-the-go": "en movimiento",
};

export const DIFFICULTY_ES: Record<string, string> = {
  Gentle: "Suave",
  Easy: "Fácil",
  Moderate: "Moderado",
};

export const CATEGORY_ES: Record<string, { label: string; short: string; description: string }> = {
  "desk-posture": { label: "Pausas de escritorio y postura", short: "Escritorio", description: "Pausas tranquilas para las largas horas frente a la pantalla." },
  "quick-walks": { label: "Caminatas rápidas y energía", short: "Caminatas", description: "Caminatas cortas para despertar cuerpo y mente." },
  "stretch-mobility": { label: "Estiramiento y movilidad", short: "Movilidad", description: "Flujos suaves de rango de movimiento para mantenerte ágil." },
  "low-energy": { label: "Recuperación con poca energía", short: "Recuperar", description: "Pausas suaves para los días cansados, sin presión." },
  "strength-snacks": { label: "Mini sesiones de fuerza", short: "Fuerza", description: "Series cortitas de fuerza que puedes hacer en cualquier lugar." },
  "parent-friendly": { label: "Movimiento en familia", short: "Familia", description: "Movimiento que se adapta a los más pequeños." },
  "breath-calm": { label: "Respiración y calma", short: "Respirar", description: "Respiración lenta para tranquilizar el sistema nervioso." },
  "hydration-wellness": { label: "Hidratación y bienestar", short: "Bienestar", description: "Pequeñas pausas de agua, luz y gratitud." },
};

export const LEVEL_TITLES_ES: string[] = [
  "Primer paso",
  "Movimiento suave",
  "Primeros pasos con calma",
  "Espíritu constante",
  "Buscador del bienestar",
  "Devoción diaria",
  "Constructor de calma",
  "Fuerza serena",
  "Guardián del flujo",
  "Luz interior",
];

export const XP_ENCOURAGEMENTS_ES: string[] = [
  "Cada movimiento suma.",
  "Las acciones pequeñas hacen grandes cambios.",
  "Vas tomando ritmo.",
  "Mejor constancia que intensidad.",
  "Progreso suave, cambio real.",
];

export const MILESTONE_ES: Record<string, { label: string; description: string }> = {
  "first-move": { label: "Primer paso", description: "Tu camino ya comenzó." },
  "streak-3": { label: "Constancia de 3 días", description: "Tres días seguidos. ¡Vas muy bien!" },
  "streak-7": { label: "Una semana de constancia", description: "Una semana completa. ¡Sigue así!" },
  "streak-14": { label: "Dos semanas de constancia", description: "La constancia ya es parte de ti." },
  "hydrated": { label: "¡Día bien hidratado!", description: "Cumpliste tu meta de agua." },
  "xp-1000": { label: "1,000 XP", description: "Acciones pequeñas, gran logro." },
};

export const ENCOURAGEMENTS_ES: string[] = [
  "Movimiento completado.",
  "Las pequeñas acciones suman.",
  "El ritmo se construye con constancia.",
  "Tu cuerpo agradece cada pequeño esfuerzo que haces.",
  "Progreso suave, cambio real.",
  "Un momento a la vez, sin apuro.",
  "Fue un buen gesto contigo.",
  "Ritmo constante, calma constante.",
];

export const WELLNESS_GOALS_ES: Record<string, string> = {
  "Reduce stress": "Reducir el estrés",
  "Improve consistency": "Mejorar la constancia",
  "Improve mobility": "Mejorar la movilidad",
  "Increase daily movement": "Aumentar el movimiento diario",
  "Improve posture": "Mejorar la postura",
  "Increase hydration": "Aumentar la hidratación",
  "Improve energy": "Mejorar la energía",
  "Breath control & mindfulness": "Respiración y mindfulness",
  "Move more": "Moverse más",
  "Stay hydrated": "Mantenerse hidratado",
  "Better posture": "Mejor postura",
  "Sleep better": "Dormir mejor",
  "Build a habit": "Construir un hábito",
};

export const MOVEMENT_ES: Record<string, { title: string; description: string; instruction?: string }> = {
  "shoulder-rolls": { title: "Círculos de hombros", description: "Rotaciones lentas para liberar tensión en la espalda alta.", instruction: "Rota los hombros lentamente para liberar tensión." },
  "chin-tucks": { title: "Retracciones de mentón", description: "Reinicia el cuello después de pasar tiempo frente a la pantalla." },
  "seated-spinal-twist": { title: "Torsión de columna sentado", description: "Una torsión suave para soltar la columna." },
  "wrist-stretches": { title: "Estiramiento de muñecas", description: "Estiramientos suaves para las muñecas tensas." },
  "chest-opener": { title: "Apertura de pecho", description: "Abre el pecho y contrarresta la encorvadura." },
  "ankle-circles": { title: "Círculos de tobillos", description: "Rota los tobillos sin levantarte del escritorio." },
  "neck-release": { title: "Liberación de cuello", description: "Liberación lenta de cuello de un lado a otro.", instruction: "Inclina suavemente la cabeza de un lado a otro y respira." },
  "seated-marches": { title: "Marcha sentada desde tu silla", description: "Marcha sentada desde tu silla." },
  "walk-3min": { title: "Caminata de 3 minutos", description: "Despégate de la pantalla y reinicia con una caminata corta." },
  "hallway-walk": { title: "Caminata por el pasillo", description: "Una vueltita corta para despejar la mente." },
  "march-in-place": { title: "Marcha en sitio", description: "Levanta las rodillas, mueve los brazos.", instruction: "Levanta las rodillas con suavidad y mantén un ritmo constante." },
  "side-steps": { title: "Pasos laterales", description: "Movimiento lateral suave para despertar las caderas." },
  "toe-taps": { title: "Toques con la punta del pie", description: "Toca cualquier superficie con la punta del pie." },
  "stair-walk": { title: "Subir escaleras", description: "Un tramo corto, lento y constante." },
  "arm-swings": { title: "Balanceo de brazos", description: "Suelta los hombros con balanceos amplios." },
  "standing-knee-lifts": { title: "Elevación de rodillas de pie", description: "Elevaciones lentas y controladas." },
  "mini-dance-break": { title: "Mini pausa de baile", description: "Una canción, los movimientos que quieras, disfrútalo." },
  "hip-circles": { title: "Círculos de cadera", description: "Círculos lentos para abrir las caderas." },
  "overhead-reach": { title: "Estirate hacia arriba", description: "Estiramientos altos para alargar la columna.", instruction: "Levanta los brazos hacia arriba y alarga el cuerpo." },
  "spinal-roll-downs": { title: "Descenso de columna", description: "Baja vértebra por vértebra." },
  "thoracic-rotations": { title: "Rotaciones torácicas", description: "Rotaciones de la espalda media para soltar la columna." },
  "hip-opener": { title: "Apertura de cadera", description: "Estiramiento tipo desplantes para las caderas tensas." },
  "shoulder-mobility": { title: "Movilidad de hombros", description: "Círculos lentos de hombros en todas direcciones." },
  "gentle-lunges": { title: "Desplantes suaves", description: "Algunos desplantes fáciles, de ambos lados." },
  "standing-mobility": { title: "Movilidad estando de pie", description: "Una secuencia de movimientos suaves de pies a cabeza." },
  "deep-breathing": { title: "Respiración profunda", description: "Respira despacio y vuelve a tu centro.", instruction: "Ponte de pie, inhala despacio y exhala con control." },
  "mindful-standing": { title: "Pausa consciente de pie", description: "Ponte de pie, relájate y respira.", instruction: "Ponte de pie, relaja los hombros y alinea la columna." },
  "one-min-stretch": { title: "Estiramiento corto", description: "Estira lo que tu cuerpo te pida, con calma." },
  "hydration-breath": { title: "Hidratación y respiración", description: "Toma agua y respira lentamente. Repite." },
  "seated-mobility": { title: "Movilidad sentado", description: "Pausa lo que estás haciendo y muévete despacio sin tener que levantarte." },
  "gentle-arm-raises": { title: "Elevaciones suaves de brazos", description: "Elevaciones lentas de brazos, respirando al mismo ritmo." },
  "recovery-walk": { title: "Caminata de recuperación", description: "Una caminata lenta y restauradora, sin apuro." },
  "slow-breathing-pause": { title: "Pausa de respiración lenta", description: "Pausa. Inhala. Exhala largo. Repite." },
  "squats": { title: "Sentadillas conscientes", description: "Haz sentadillas lentas y con intención." },
  "chair-squats": { title: "Sentadillas con silla", description: "Sentarse y pararse con control.", instruction: "Bájate hacia la silla y vuelve a pararte con control." },
  "wall-pushups": { title: "Lagartijas en pared", description: "Diez lagartijas lentas contra la pared.", instruction: "Mantén el cuerpo recto y baja hacia la pared manteniendo el control." },
  "countertop-pushups": { title: "Lagartijas en la barra", description: "Haz lagartijas apoyándote en una superficie." },
  "calf-raises": { title: "Elevaciones de talones", description: "Dos series lentas, respirando en cada una.", instruction: "Sube en puntas de pie, haz una pausa breve y baja despacio." },
  "wall-sit": { title: "Sentadilla contra la pared", description: "Baja, aguanta un poco, sube y repite." },
  "mini-lunges": { title: "Mini desplantes", description: "Desplantes cortos y equilibrados de cada lado." },
  "step-ups": { title: "Subir y bajar escalón", description: "Sube y baja en una superficie estable." },
  "standing-core": { title: "Activación del core de pie", description: "Activa y suelta el abdomen, lentamente." },
  "stroller-walk": { title: "Paseo con la carriola", description: "Camina unas cuadras con la carriola." },
  "toddler-carry-walk": { title: "Caminata cargando al peque", description: "Vueltas suaves caminando con tu peque en brazos." },
  "toy-pickup-squats": { title: "Sentadillas recogiendo juguetes", description: "Convierte la recogida en sentadillas conscientes." },
  "dance-with-child": { title: "Baila con tu peque", description: "Una canción, muchas sonrisas." },
  "playground-laps": { title: "Vueltas al parque", description: "Camina alrededor mientras los peques juegan." },
  "family-break": { title: "Pausa familiar", description: "Movimientos y estiramientos en familia." },
  "baby-bounce-calf": { title: "Elevaciones de talones con tu peque", description: "Calmas y fortaleces al mismo tiempo." },
  "box-breathing": { title: "Respiración cuadrada", description: "Inhala 4, mantén 4, exhala 4, mantén 4.", instruction: "Sigue el cuadrado: inhala, mantén, exhala, mantén." },
  "4-7-8-breathing": { title: "Respiración 4-7-8", description: "Inhala 4, mantén 7, exhala 8." },
  "shoulder-drop-breath": { title: "Respiración con hombros relajados", description: "Inhala, exhala y suelta los hombros." },
  "slow-nasal": { title: "Respiración nasal lenta", description: "Respiraciones largas y silenciosas por la nariz." },
  "tension-release-breath": { title: "Respiración para liberar tensión", description: "Respira, enfocándote en los puntos tensos, y luego suelta." },
  "mindful-breath-reset": { title: "Pausa consciente de respiración", description: "Respira con intención." },
  "hydration-reminder": { title: "Recordatorio de hidratación", description: "Toma agua, despacio y con calma." },
  "water-stretch-combo": { title: "Agua + estiramiento", description: "Toma agua, párate, estírate y repite." },
  "posture-hydration": { title: "Postura + hidratación", description: "Siéntate derecho, respira y toma agua." },
  "sunlight-break": { title: "Pausa de luz natural", description: "Sal un momento o asómate a una ventana." },
  "fresh-air-reset": { title: "Pausa de aire fresco", description: "Respira aire fresco al aire libre." },
  "gratitude-pause": { title: "Pausa de gratitud", description: "Haz una breve lista de algo por lo que agradezcas hoy." },
};

export function useContent() {
  const { lang, t } = useI18n();
  const es = lang === "es";

  return {
    lang,
    t,
    lifestyleLabel: (id: string, fallback: string) =>
      (es && LIFESTYLE_ES[id]?.label) || fallback,
    lifestyleDesc: (id: string, fallback: string) =>
      (es && LIFESTYLE_ES[id]?.description) || fallback,
    fitness: (v: string) => (es ? FITNESS_ES[v] ?? v : v),
    workStyle: (v: string) => (es ? WORK_STYLE_ES[v] ?? v : v),
    difficulty: (v: string) => (es ? DIFFICULTY_ES[v] ?? v : v),
    categoryShort: (id: string, fallback: string) =>
      (es && CATEGORY_ES[id]?.short) || fallback,
    categoryLabel: (id: string, fallback: string) =>
      (es && CATEGORY_ES[id]?.label) || fallback,
    categoryDesc: (id: string, fallback: string) =>
      (es && CATEGORY_ES[id]?.description) || fallback,
    levelTitle: (idx: number, fallback: string) =>
      (es && LEVEL_TITLES_ES[idx]) || fallback,
    xpEncouragement: (idx: number, fallback: string) =>
      (es && XP_ENCOURAGEMENTS_ES[idx]) || fallback,
    milestoneLabel: (id: string, fallback: string) =>
      (es && MILESTONE_ES[id]?.label) || fallback,
    milestoneDesc: (id: string, fallback: string) =>
      (es && MILESTONE_ES[id]?.description) || fallback,
    encouragement: (text: string) => {
      if (!es) return text;
      const i = ENCOURAGEMENTS_EN_INDEX[text];
      return i !== undefined ? ENCOURAGEMENTS_ES[i] : text;
    },
    wellnessGoal: (v: string) => (es ? WELLNESS_GOALS_ES[v] ?? v : v),
    movementTitle: (id: string, fallback: string) =>
      (es && MOVEMENT_ES[id]?.title) || fallback,
    movementDesc: (id: string, fallback: string) =>
      (es && MOVEMENT_ES[id]?.description) || fallback,
    movementInstr: (id: string, fallback?: string) =>
      (es && MOVEMENT_ES[id]?.instruction) || fallback,
  };
}

const ENCOURAGEMENTS_EN_INDEX: Record<string, number> = {
  "Movement completed.": 0,
  "Small actions add up.": 1,
  "Momentum builds through consistency.": 2,
  "Your body appreciates every small effort.": 3,
  "Gentle progress, real change.": 4,
  "One mindful moment at a time.": 5,
  "That was a kind thing to do for yourself.": 6,
  "Steady rhythm, steady self.": 7,
};

/** Overlay translations for DB-driven motivational messages */
export const MESSAGE_ES: Record<string, string> = {
  "Small actions build lasting progress.": "Las acciones pequeñas construyen progreso duradero.",
  "A few intentional minutes can shift your whole day.": "Unos minutos para ti pueden cambiar tu día.",
  "Your body appreciates every mindful movement.": "Tu cuerpo agradece cada movimiento, por más pequeño que sea.",
  "Progress does not have to be intense to be meaningful.": "El progreso no tiene que ser intenso para ser significativo.",
  "Today is a gentle invitation to begin again.": "Hoy es un buen momento para empezar de nuevo.",
  "Consistency is kinder than intensity.": "La constancia es más amable que la intensidad.",
  "Movement is a quiet form of self-care.": "El movimiento es una forma callada de cuidarte.",
  "A calm breath is always within reach.": "Una respiración tranquila siempre está al alcance.",
  "Tiny resets create steady momentum.": "Las pausas pequeñas te dan ritmo constante.",
  "Stillness counts. Motion counts. Both matter.": "La quietud cuenta. El movimiento cuenta. Ambos importan.",
  "Hydration is a small act of devotion to yourself.": "La hidratación es un pequeño acto de devoción hacia ti.",
  "You do not need a perfect day to make a meaningful one.": "No necesitas un día perfecto para que sea significativo.",
  "Show up softly. That is enough.": "Date el espacio, con calma. Con eso basta.",
  "You showed up for yourself today.": "Hoy estuviste presente para ti.",
  "That small pause mattered.": "Esa pequeña pausa importó.",
  "Momentum grows one reset at a time.": "El ritmo crece una pausa a la vez.",
  "Your body says thank you.": "Tu cuerpo te lo agradece.",
  "Beautifully done. Carry this calm with you.": "Muy bien hecho. Llévate esta calma.",
  "A few minutes well spent.": "Unos minutos bien invertidos.",
  "Gentle effort is real effort.": "El esfuerzo suave es esfuerzo de verdad.",
  "You just made the day a little kinder.": "Acabas de hacer el día un poco más amable.",
  "That is how lasting change is built.": "Así es como se construye el cambio duradero.",
  "Every reset is a quiet victory.": "Cada reinicio es una victoria silenciosa.",
  "Your breath, your body, your moment.": "Tu aliento, tu cuerpo, tu momento.",
  "You returned to yourself. That is everything.": "Volviste a conectar contigo. Eso lo es todo.",
  "Small movement, big care.": "Movimiento pequeño, gran cuidado.",
  "A sip is a small promise kept.": "Cada sorbo es una promesa que te cumples.",
  "Your body is grateful for that glass.": "Tu cuerpo está agradecido por ese vaso.",
  "Hydration done gently is hydration done well.": "La hidratación hecha con suavidad es hidratación bien hecha.",
  "Steady sips, steady self.": "Sorbos constantes, serenidad constante.",
  "Tiny refills add up to a brighter day.": "Los pequeños rellenos suman un día más brillante.",
  "You just gave your body what it asked for.": "Acabas de darle a tu cuerpo lo que pedía.",
  "Hydration is a quiet act of kindness to yourself.": "La hidratación es un acto silencioso de amabilidad hacia ti.",
  "One glass closer to a softer afternoon.": "Un vaso más cerca de una tarde más suave.",
  "Gentle hydration, gentle energy.": "Hidratación suave, energía suave.",
  "Small sips, real care.": "Sorbos pequeños, cuidado real.",
  "Look how far small steps have carried you.": "Mira qué lejos te han llevado los pasos pequeños.",
  "Consistency, not intensity, built this.": "La constancia, no la intensidad, construyó esto.",
  "Every entry here is a moment you chose yourself.": "Cada entrada aquí es un momento que elegiste tú.",
  "Progress is the gentle sum of showing up.": "El progreso es la suma suave de presentarse.",
  "You are building something quiet and real.": "Estás construyendo algo en silencio y es real.",
  "Your journey does not need to be loud to be meaningful.": "Tu camino no necesita ser ruidoso para ser significativo.",
  "Small actions, steady proof.": "Acciones pequeñas, prueba constante.",
  "A rhythm is forming, one mindful day at a time.": "Se está formando un ritmo, un día consciente a la vez.",
  "This is what kind progress looks like.": "Así se ve el progreso amable.",
  "Each session here is a small thank-you to your future self.": "Cada sesión aquí es un pequeño gracias a tu yo futuro.",
  "Movement, breath, hydration, all woven into your week.": "Movimiento, respiración, hidratación, todo tejido en tu semana.",
  "Streaks are built breath by breath.": "La constancia se construye respiración a respiración.",
};

export function translateMessage(msg: string): string {
  return MESSAGE_ES[msg] ?? msg;
}

export type ContentHelpers = ReturnType<typeof useContent>;
export type { Lang };