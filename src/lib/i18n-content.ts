import { useI18n, type Lang } from "@/lib/i18n";

/**
 * Spanish overrides for dynamic / content-driven labels that don't live in the
 * main i18n dictionary (lifestyles, movements, categories, milestones, etc).
 * English values come from the source modules. We only need Spanish here.
 */

export const LIFESTYLE_ES: Record<string, { label: string; description: string }> = {
  "office-desk": { label: "Trabajo de oficina", description: "Pensado para largos periodos sentado y frente a pantallas." },
  "remote-desk": { label: "Trabajo remoto de escritorio", description: "Recordatorios suaves para tus días de trabajo en casa." },
  "stay-at-home-parent": { label: "Padre/madre en casa", description: "Movimiento que encaja con la crianza y las rutinas del hogar." },
  "busy-parent-fulltime": { label: "Padre/madre y trabajo a tiempo completo", description: "Reinicios rápidos entre reuniones y familia." },
  "active-on-feet": { label: "Trabajo activo / de pie", description: "Movimiento de recuperación y movilidad de apoyo." },
  "hybrid": { label: "Horario híbrido", description: "Se adapta a tus días en casa y en la oficina." },
  "student": { label: "Estudiante", description: "Pausas útiles entre clases y sesiones de estudio." },
  "driver": { label: "Conductor frecuente", description: "Estiramientos y respiración para tiempo en la carretera." },
  "shift-worker": { label: "Trabajo por turnos", description: "Recordatorios flexibles que siguen tus horarios cambiantes." },
  "healthcare": { label: "Personal de salud", description: "Reinicios rápidos entre rondas y turnos largos." },
  "retail-hospitality": { label: "Retail / hostelería", description: "Momentos de recuperación para días de cara al público." },
  "fitness-beginner": { label: "Principiante en fitness", description: "Puntos de partida suaves para crear un hábito diario." },
  "retired-low-activity": { label: "Jubilado / actividad baja", description: "Movimiento suave y respiración consciente para días tranquilos." },
  "general-busy": { label: "Estilo de vida ocupado", description: "Pequeños reinicios para días completos." },
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
  "desk-posture": { label: "Reinicios de escritorio y postura", short: "Escritorio", description: "Reinicios tranquilos para largas sesiones frente a la pantalla." },
  "quick-walks": { label: "Caminatas rápidas y energía", short: "Caminatas", description: "Pequeños impulsos para despertar el cuerpo y la mente." },
  "stretch-mobility": { label: "Estiramiento y movilidad", short: "Movilidad", description: "Flujos suaves de rango de movimiento para mantenerte ágil." },
  "low-energy": { label: "Recuperación de baja energía", short: "Recuperar", description: "Reinicios suaves para días cansados — sin presión." },
  "strength-snacks": { label: "Mini sesiones de fuerza", short: "Fuerza", description: "Pequeñas series de fuerza que puedes hacer en cualquier lugar." },
  "parent-friendly": { label: "Movimiento para familias", short: "Familia", description: "Movimiento que se adapta a los pequeños." },
  "breath-calm": { label: "Respiración y calma", short: "Respirar", description: "Respiración lenta para calmar el sistema nervioso." },
  "hydration-wellness": { label: "Hidratación y bienestar", short: "Bienestar", description: "Pequeños chequeos de agua, luz y gratitud." },
};

export const LEVEL_TITLES_ES: string[] = [
  "Primer paso",
  "Movimiento suave",
  "Principiante consciente",
  "Alma constante",
  "Buscador consciente",
  "Devoto diario",
  "Constructor de calma",
  "Fuerza tranquila",
  "Guardián del flujo",
  "Luz interior",
];

export const XP_ENCOURAGEMENTS_ES: string[] = [
  "Cada movimiento cuenta.",
  "Las acciones pequeñas crean grandes cambios.",
  "Estás creando impulso.",
  "Constancia sobre intensidad.",
  "Progreso suave, cambio real.",
];

export const MILESTONE_ES: Record<string, { label: string; description: string }> = {
  "first-move": { label: "Primer paso", description: "Tu camino ha comenzado." },
  "streak-3": { label: "Chispa de 3 días", description: "Tres días suaves seguidos." },
  "streak-7": { label: "Brillo de 7 días", description: "Una semana completa de presencia." },
  "streak-14": { label: "Flujo de dos semanas", description: "La constancia se está convirtiendo en ti." },
  "hydrated": { label: "Día hidratado", description: "Alcanzaste tu meta de agua." },
  "xp-1000": { label: "1.000 XP", description: "Acciones pequeñas, gran cambio." },
};

export const ENCOURAGEMENTS_ES: string[] = [
  "Movimiento completado.",
  "Las acciones pequeñas suman.",
  "El impulso se construye con constancia.",
  "Tu cuerpo agradece cada pequeño esfuerzo.",
  "Progreso suave, cambio real.",
  "Un momento consciente a la vez.",
  "Eso fue un acto amable contigo mismo.",
  "Ritmo constante, ser constante.",
];

export const WELLNESS_GOALS_ES: Record<string, string> = {
  "Reduce stress": "Reducir el estrés",
  "Improve consistency": "Mejorar la constancia",
  "Improve mobility": "Mejorar la movilidad",
  "Increase daily movement": "Aumentar el movimiento diario",
  "Improve posture": "Mejorar la postura",
  "Increase hydration": "Aumentar la hidratación",
  "Improve energy": "Mejorar la energía",
  "Breath control & mindfulness": "Respiración y atención plena",
  "Move more": "Moverse más",
  "Stay hydrated": "Mantenerse hidratado",
  "Better posture": "Mejor postura",
  "Sleep better": "Dormir mejor",
  "Build a habit": "Crear un hábito",
};

export const MOVEMENT_ES: Record<string, { title: string; description: string; instruction?: string }> = {
  "shoulder-rolls": { title: "Círculos de hombros", description: "Rotaciones lentas para liberar tensión en la espalda alta.", instruction: "Rota los hombros lentamente para liberar tensión." },
  "chin-tucks": { title: "Retracciones de barbilla", description: "Reinicia tu cuello tras tiempo de pantalla." },
  "seated-spinal-twist": { title: "Torsión espinal sentada", description: "Una torsión suave para soltar la columna." },
  "wrist-stretches": { title: "Estiramiento de muñecas", description: "Estiramientos suaves para muñecas tensas." },
  "chest-opener": { title: "Apertura de pecho", description: "Abre el pecho y contrarresta la encorvadura." },
  "ankle-circles": { title: "Círculos de tobillos", description: "Despierta los tobillos bajo el escritorio." },
  "neck-release": { title: "Liberación de cuello", description: "Liberación lenta de cuello de un lado a otro.", instruction: "Inclina suavemente la cabeza a un lado y respira." },
  "seated-marches": { title: "Marchas sentadas", description: "Marcha en el lugar desde tu silla." },
  "walk-3min": { title: "Caminata de 3 minutos", description: "Aléjate de la pantalla y reinicia." },
  "hallway-walk": { title: "Caminata por el pasillo", description: "Una vuelta corta para despejar la mente." },
  "march-in-place": { title: "Marcha en el sitio", description: "Levanta las rodillas, mueve los brazos.", instruction: "Levanta las rodillas con suavidad y mantén un ritmo constante." },
  "side-steps": { title: "Pasos laterales", description: "Movimiento lateral suave para despertar la cadera." },
  "toe-taps": { title: "Toques con la punta del pie", description: "Toques rápidos para subir tu energía." },
  "stair-walk": { title: "Caminata por escaleras", description: "Un tramo corto, lento y constante." },
  "arm-swings": { title: "Balanceo de brazos", description: "Suelta los hombros con balanceos completos." },
  "standing-knee-lifts": { title: "Elevación de rodillas de pie", description: "Elevaciones lentas y controladas." },
  "mini-dance-break": { title: "Mini pausa de baile", description: "Una canción, los movimientos que quieras — disfrútalo." },
  "hip-circles": { title: "Círculos de cadera", description: "Círculos lentos para abrir las caderas." },
  "overhead-reach": { title: "Flujo de alcance arriba", description: "Estiramientos altos para alargar la columna.", instruction: "Levanta los brazos arriba y alarga el cuerpo." },
  "spinal-roll-downs": { title: "Descenso de columna", description: "Baja una vértebra a la vez." },
  "thoracic-rotations": { title: "Rotaciones torácicas", description: "Rotaciones de la espalda media para soltar la columna." },
  "hip-opener": { title: "Apertura de cadera", description: "Estiramiento suave para caderas tensas." },
  "shoulder-mobility": { title: "Movilidad de hombros", description: "Círculos lentos de hombros en todas direcciones." },
  "gentle-lunges": { title: "Zancadas suaves", description: "Algunas zancadas fáciles, ambos lados." },
  "standing-mobility": { title: "Flujo de movilidad de pie", description: "Un flujo suave de pies a cabeza." },
  "deep-breathing": { title: "Respiración profunda", description: "Respira lento, vuelve al centro.", instruction: "Inhala despacio y exhala con control." },
  "mindful-standing": { title: "Reinicio de pie consciente", description: "Ponte de pie, relájate, respira.", instruction: "Siéntate o ponte de pie, relaja los hombros y alinea la columna." },
  "one-min-stretch": { title: "Estiramiento de 1 minuto", description: "Lo que tu cuerpo te pida, con suavidad." },
  "hydration-breath": { title: "Hidratación y respiración", description: "Un sorbo de agua y tres respiraciones lentas." },
  "seated-mobility": { title: "Movilidad sentado", description: "Movimiento suave sin ponerte de pie." },
  "gentle-arm-raises": { title: "Elevaciones suaves de brazos", description: "Elevaciones lentas, respirando al ritmo." },
  "recovery-walk": { title: "Caminata de recuperación", description: "Una caminata lenta y restauradora — sin prisa." },
  "slow-breathing-pause": { title: "Pausa de respiración lenta", description: "Pausa. Inhala. Exhala largo. Repite." },
  "squats": { title: "Sentadillas conscientes", description: "Doce sentadillas lentas e intencionales." },
  "chair-squats": { title: "Sentadillas en silla", description: "Sentarse y levantarse con control.", instruction: "Inclínate hacia la silla y luego ponte de pie con control." },
  "wall-pushups": { title: "Flexiones en pared", description: "Diez flexiones lentas contra la pared.", instruction: "Mantén el cuerpo recto y bájate hacia la pared con control." },
  "countertop-pushups": { title: "Flexiones en encimera", description: "Diez flexiones contra la encimera." },
  "calf-raises": { title: "Elevaciones de talón", description: "Dos series lentas, respirando en cada una.", instruction: "Sube sobre las puntas, pausa breve y baja despacio." },
  "wall-sit": { title: "Sentadilla en pared", description: "Un mantenimiento corto — cuenta respiraciones constantes." },
  "mini-lunges": { title: "Mini zancadas", description: "Zancadas cortas y equilibradas en cada lado." },
  "step-ups": { title: "Subidas a escalón", description: "Sube y baja sobre una superficie estable." },
  "standing-core": { title: "Activación de core de pie", description: "Activa y suelta tu core, lentamente." },
  "stroller-walk": { title: "Paseo con el carrito", description: "Camina unas cuadras con el carrito." },
  "toddler-carry-walk": { title: "Caminata cargando al peque", description: "Vueltas suaves caminando con el pequeño." },
  "toy-pickup-squats": { title: "Sentadillas recogiendo juguetes", description: "Convierte la limpieza en sentadillas conscientes." },
  "dance-with-child": { title: "Baila con tu hijo/a", description: "Una canción, muchas sonrisas." },
  "playground-laps": { title: "Vueltas al parque", description: "Camina el perímetro mientras juegan." },
  "family-break": { title: "Pausa familiar", description: "Un estiramiento de dos minutos con todos." },
  "baby-bounce-calf": { title: "Elevaciones de talón con bebé", description: "Calma y fortalece al mismo tiempo." },
  "box-breathing": { title: "Respiración cuadrada", description: "Inhala 4, sostén 4, exhala 4, sostén 4.", instruction: "Sigue el cuadrado: inhala, sostén, exhala, sostén." },
  "4-7-8-breathing": { title: "Respiración 4-7-8", description: "Inhala 4, sostén 7, exhala 8." },
  "shoulder-drop-breath": { title: "Respiración con bajada de hombros", description: "Inhala, exhala, suelta los hombros." },
  "slow-nasal": { title: "Respiración nasal lenta", description: "Respiraciones largas y silenciosas por la nariz." },
  "tension-release-breath": { title: "Respiración liberando tensión", description: "Respira en los puntos tensos y luego suelta." },
  "mindful-breath-reset": { title: "Reinicio de respiración consciente", description: "Tres respiraciones intencionales, ahora mismo." },
  "hydration-reminder": { title: "Chequeo de hidratación", description: "Un vaso de agua — lento y constante." },
  "water-stretch-combo": { title: "Agua + estiramiento", description: "Sorbo, ponte de pie, estira — repite." },
  "posture-hydration": { title: "Postura + hidratación", description: "Siéntate erguido, respira y bebe." },
  "sunlight-break": { title: "Pausa de luz solar", description: "Sal o asómate a una ventana un momento." },
  "fresh-air-reset": { title: "Reinicio de aire fresco", description: "Unas respiraciones de aire fresco afuera." },
  "gratitude-pause": { title: "Pausa de gratitud", description: "Nombra una cosa por la que estás agradecido." },
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

export type ContentHelpers = ReturnType<typeof useContent>;
export type { Lang };