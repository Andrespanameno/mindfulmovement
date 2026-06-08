import type { LucideIcon } from "lucide-react";
import {
  Footprints,
  Armchair,
  Hand,
  Wind,
  HeartHandshake,
  StretchHorizontal,
  Dumbbell,
  Droplet,
  Sun,
  Sparkles as SparklesIcon,
  Activity,
  Baby,
  Repeat,
  Heart,
} from "lucide-react";

export type MovementCategory =
  | "desk-posture"
  | "quick-walks"
  | "stretch-mobility"
  | "low-energy"
  | "strength-snacks"
  | "parent-friendly"
  | "breath-calm"
  | "hydration-wellness";

export type MovementDifficulty = "Gentle" | "Easy" | "Moderate";

export interface CategoryMeta {
  id: MovementCategory;
  label: string;
  short: string;
  description: string;
  icon: LucideIcon;
  tint: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "desk-posture",
    label: "Desk & Posture Resets",
    short: "Desk",
    description: "Quiet resets for long screen sessions.",
    icon: Armchair,
    tint: "bg-primary/25",
  },
  {
    id: "quick-walks",
    label: "Quick Walks & Energy",
    short: "Walks",
    description: "Short bursts to wake the body and clear the head.",
    icon: Footprints,
    tint: "bg-warm/40",
  },
  {
    id: "stretch-mobility",
    label: "Stretch & Mobility",
    short: "Mobility",
    description: "Gentle range-of-motion flows to keep you moving easily.",
    icon: StretchHorizontal,
    tint: "bg-accent/20",
  },
  {
    id: "low-energy",
    label: "Low-Energy Recovery",
    short: "Recover",
    description: "Soft resets for tired days, no pressure.",
    icon: Heart,
    tint: "bg-warm/40",
  },
  {
    id: "strength-snacks",
    label: "Strength Snacks",
    short: "Strength",
    description: "Small strength sets you can do anywhere.",
    icon: Dumbbell,
    tint: "bg-primary/25",
  },
  {
    id: "parent-friendly",
    label: "Parent-Friendly Movement",
    short: "Parent",
    description: "Movement that fits around little ones.",
    icon: Baby,
    tint: "bg-accent/20",
  },
  {
    id: "breath-calm",
    label: "Breath & Calm",
    short: "Breath",
    description: "Slow breath work to settle the nervous system.",
    icon: Wind,
    tint: "bg-warm/40",
  },
  {
    id: "hydration-wellness",
    label: "Hydration & Wellness",
    short: "Wellness",
    description: "Tiny check-ins for water, light, and gratitude.",
    icon: Droplet,
    tint: "bg-primary/25",
  },
];

export const ALL_CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export function getCategoryMeta(id: MovementCategory | string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export interface Movement {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  xp: number;
  difficulty: MovementDifficulty;
  category: MovementCategory;
  icon: LucideIcon;
  tint: string;
  repsType?: "pushups" | "squats";
  reps?: number;
  instruction?: string;
}

function tintFor(cat: MovementCategory): string {
  return getCategoryMeta(cat)?.tint ?? "bg-secondary";
}

function m(
  id: string,
  title: string,
  description: string,
  category: MovementCategory,
  opts: {
    duration?: number;
    xp?: number;
    difficulty?: MovementDifficulty;
    icon?: LucideIcon;
    repsType?: "pushups" | "squats";
    reps?: number;
    instruction?: string;
  } = {},
): Movement {
  return {
    id,
    title,
    description,
    category,
    duration: opts.duration ?? 2,
    xp: opts.xp ?? 20,
    difficulty: opts.difficulty ?? "Gentle",
    icon: opts.icon ?? getCategoryMeta(category)?.icon ?? Activity,
    tint: tintFor(category),
    repsType: opts.repsType,
    reps: opts.reps,
    instruction: opts.instruction,
  };
}

export const movements: Movement[] = [
  // DESK & POSTURE RESETS
  m("shoulder-rolls", "Shoulder Rolls", "Slow rolls to release upper-back tension.", "desk-posture", { duration: 1, xp: 15, instruction: "Roll your shoulders slowly to release tension." }),
  m("chin-tucks", "Chin Tucks", "Reset your neck after long screen time.", "desk-posture", { duration: 1, xp: 15 }),
  m("seated-spinal-twist", "Seated Spinal Twist", "A gentle twist to unwind the spine.", "desk-posture", { duration: 1, xp: 20 }),
  m("wrist-stretches", "Wrist Stretches", "Soft stretches for typing-tight wrists.", "desk-posture", { duration: 1, xp: 15 }),
  m("chest-opener", "Chest Opener Stretch", "Open the chest and counter the slouch.", "desk-posture", { duration: 1, xp: 20 }),
  m("ankle-circles", "Ankle Circles", "Wake up the ankles under your desk.", "desk-posture", { duration: 1, xp: 10 }),
  m("neck-release", "Neck Release Flow", "Slow side-to-side neck release.", "desk-posture", { duration: 1, xp: 20, icon: StretchHorizontal, instruction: "Gently tilt your head to one side and breathe." }),
  m("seated-marches", "Seated Marches", "March in place from your chair.", "desk-posture", { duration: 2, xp: 20 }),

  // QUICK WALKS & ENERGY BOOSTS
  m("walk-3min", "Short Walk", "Step away from the screen and reset.", "quick-walks", { duration: 3, xp: 30, difficulty: "Easy" }),
  m("hallway-walk", "Hallway Walk", "A short loop to clear the head.", "quick-walks", { duration: 2, xp: 20, difficulty: "Easy" }),
  m("march-in-place", "March in Place", "Lift the knees, swing the arms.", "quick-walks", { duration: 2, xp: 20, difficulty: "Easy", instruction: "Lift your knees gently and keep a steady rhythm." }),
  m("side-steps", "Side Steps", "Light lateral movement to wake the hips.", "quick-walks", { duration: 2, xp: 20, difficulty: "Easy" }),
  m("toe-taps", "Toe Taps", "Quick toe taps to lift your energy.", "quick-walks", { duration: 1, xp: 15 }),
  m("stair-walk", "Stair Walk", "One short flight, slow and steady.", "quick-walks", { duration: 3, xp: 30, difficulty: "Easy" }),
  m("arm-swings", "Arm Swings", "Loosen the shoulders with full arm swings.", "quick-walks", { duration: 1, xp: 15 }),
  m("standing-knee-lifts", "Standing Knee Lifts", "Slow, controlled knee lifts.", "quick-walks", { duration: 2, xp: 20, difficulty: "Easy" }),
  m("mini-dance-break", "Mini Dance Break", "One song, any moves, just enjoy it.", "quick-walks", { duration: 3, xp: 30, difficulty: "Easy", icon: SparklesIcon }),

  // STRETCH & MOBILITY
  m("hip-circles", "Hip Circles", "Slow circles to open the hips.", "stretch-mobility", { duration: 2, xp: 20 }),
  m("overhead-reach", "Overhead Reach Flow", "Tall reaches to lengthen the spine.", "stretch-mobility", { duration: 2, xp: 20, instruction: "Reach both arms overhead and lengthen your body." }),
  m("spinal-roll-downs", "Spinal Roll-Downs", "Roll down one vertebra at a time.", "stretch-mobility", { duration: 1, xp: 25 }),
  m("thoracic-rotations", "Thoracic Rotations", "Mid-back rotations to free the spine.", "stretch-mobility", { duration: 1, xp: 20 }),
  m("hip-opener", "Hip Opener Stretch", "A gentle stretch for tight hips.", "stretch-mobility", { duration: 2, xp: 25 }),
  m("shoulder-mobility", "Shoulder Mobility Circles", "Slow shoulder circles in every direction.", "stretch-mobility", { duration: 2, xp: 20 }),
  m("gentle-lunges", "Gentle Lunges", "A few easy lunges, both sides.", "stretch-mobility", { duration: 2, xp: 30, difficulty: "Easy" }),
  m("standing-mobility", "Standing Mobility Flow", "A smooth flow from head to toe.", "stretch-mobility", { duration: 2, xp: 40, difficulty: "Easy" }),

  // LOW-ENERGY & RECOVERY RESETS
  m("deep-breathing", "Deep Breathing", "Slow your breath, return to center.", "low-energy", { duration: 2, xp: 20, instruction: "Stand up, breathe in slowly, then exhale with control." }),
  m("mindful-standing", "Mindful Standing Reset", "Stand tall, soften, breathe.", "low-energy", { duration: 1, xp: 15, instruction: "Sit or stand tall, relax your shoulders, and align your spine." }),
  m("one-min-stretch", "Stretch", "Whatever your body asks for, gently.", "low-energy", { duration: 1, xp: 10 }),
  m("hydration-breath", "Hydration + Breath Reset", "A sip of water and three slow breaths.", "low-energy", { duration: 1, xp: 20, icon: Droplet }),
  m("seated-mobility", "Seated Mobility Flow", "Soft movement without standing up.", "low-energy", { duration: 1, xp: 25 }),
  m("gentle-arm-raises", "Gentle Arm Raises", "Slow arm raises, breathing in time.", "low-energy", { duration: 2, xp: 20 }),
  m("recovery-walk", "Recovery Walk", "A slow, restorative walk, no pace required.", "low-energy", { duration: 4, xp: 30, difficulty: "Easy" }),
  m("slow-breathing-pause", "Slow Breathing Pause", "Pause. Inhale. Long exhale. Repeat.", "low-energy", { duration: 2, xp: 20 }),

  // STRENGTH SNACKS
  m("squats", "Mindful Squats", "Slow, intentional squats.", "strength-snacks", { duration: 2, xp: 35, difficulty: "Easy", icon: Dumbbell, repsType: "squats", reps: 12 }),
  m("chair-squats", "Chair Squats", "Sit-stand reps with control.", "strength-snacks", { duration: 2, xp: 30, difficulty: "Easy", repsType: "squats", reps: 10, instruction: "Sit back toward the chair, then stand tall with control." }),
  m("wall-pushups", "Wall Push-Ups", "Ten slow wall push-ups.", "strength-snacks", { duration: 2, xp: 30, difficulty: "Easy", icon: Hand, repsType: "pushups", reps: 10, instruction: "Keep your body straight and lower toward the wall with control." }),
  m("countertop-pushups", "Countertop Push-Ups", "Push-ups against the counter, at your own pace.", "strength-snacks", { duration: 2, xp: 35, difficulty: "Easy", icon: Hand, repsType: "pushups", reps: 10 }),
  m("calf-raises", "Calf Raises", "Two slow sets, breathing through each.", "strength-snacks", { duration: 2, xp: 25, difficulty: "Easy", instruction: "Rise onto your toes, pause briefly, then lower slowly." }),
  m("wall-sit", "Wall Sit", "A short hold, count steady breaths, rest as needed.", "strength-snacks", { duration: 2, xp: 25, difficulty: "Easy" }),
  m("mini-lunges", "Mini Lunges", "Short, balanced lunges on each side.", "strength-snacks", { duration: 2, xp: 30, difficulty: "Easy" }),
  m("step-ups", "Step-Ups", "Step up and down on a stable surface.", "strength-snacks", { duration: 3, xp: 30, difficulty: "Easy" }),
  m("standing-core", "Standing Core Bracing", "Engage and release your core, slowly.", "strength-snacks", { duration: 2, xp: 25, difficulty: "Easy" }),

  // PARENT-FRIENDLY MOVEMENT
  m("stroller-walk", "Stroller Walk", "Walk a few blocks with the stroller.", "parent-friendly", { duration: 5, xp: 45, difficulty: "Easy" }),
  m("toddler-carry-walk", "Toddler Carry Walk", "Gentle walking laps with a little one.", "parent-friendly", { duration: 4, xp: 40, difficulty: "Easy" }),
  m("toy-pickup-squats", "Toy Pickup Squats", "Turn tidy-up time into mindful squats.", "parent-friendly", { duration: 3, xp: 30, difficulty: "Easy" }),
  m("dance-with-child", "Dance With Your Child", "One song, lots of smiles.", "parent-friendly", { duration: 3, xp: 35, difficulty: "Easy", icon: SparklesIcon }),
  m("playground-laps", "Playground Laps", "Walk the perimeter while they play.", "parent-friendly", { duration: 5, xp: 45, difficulty: "Easy" }),
  m("family-break", "Family Movement Break", "A two-minute stretch with everyone.", "parent-friendly", { duration: 2, xp: 25, icon: HeartHandshake }),
  m("baby-bounce-calf", "Baby-Bounce Calf Raises", "Soothe and strengthen at the same time.", "parent-friendly", { duration: 2, xp: 25, difficulty: "Easy" }),

  // BREATH & CALM
  m("box-breathing", "Box Breathing", "Inhale 4, hold 4, exhale 4, hold 4.", "breath-calm", { duration: 3, xp: 30, instruction: "Follow the square: inhale, hold, exhale, hold." }),
  m("4-7-8-breathing", "4-7-8 Breathing", "Inhale 4, hold 7, exhale 8.", "breath-calm", { duration: 3, xp: 30 }),
  m("shoulder-drop-breath", "Shoulder Drop Breathing", "Inhale, exhale, soften the shoulders.", "breath-calm", { duration: 2, xp: 20 }),
  m("slow-nasal", "Slow Nasal Breathing", "Long, quiet breaths through the nose.", "breath-calm", { duration: 3, xp: 25 }),
  m("tension-release-breath", "Tension Release Breathing", "Breathe into the tight spots, then release.", "breath-calm", { duration: 3, xp: 25 }),
  m("mindful-breath-reset", "Mindful Breathing Reset", "Continuous intentional breaths, right now.", "breath-calm", { duration: 1, xp: 15 }),

  // HYDRATION & WELLNESS CHECK-INS
  m("hydration-reminder", "Hydration Check", "A glass of water, slow and steady.", "hydration-wellness", { duration: 1, xp: 10, icon: Droplet }),
  m("water-stretch-combo", "Water + Stretch Combo", "Sip, stand, stretch, repeat.", "hydration-wellness", { duration: 1, xp: 20 }),
  m("posture-hydration", "Posture + Hydration Reset", "Sit tall, breathe, and drink.", "hydration-wellness", { duration: 1, xp: 20 }),
  m("sunlight-break", "Sunlight Break", "Step outside or to a window for a moment.", "hydration-wellness", { duration: 2, xp: 25, difficulty: "Easy", icon: Sun }),
  m("fresh-air-reset", "Fresh Air Reset", "A few breaths of fresh air outside.", "hydration-wellness", { duration: 3, xp: 25, difficulty: "Easy" }),
  m("gratitude-pause", "Gratitude Pause", "Name one thing you're thankful for.", "hydration-wellness", { duration: 1, xp: 15, icon: Heart }),
];

export function getMovement(id: string): Movement | undefined {
  return movements.find((mv) => mv.id === id);
}

/**
 * Pick the next movement to suggest based on the user's preferred categories
 * and a recent-history list (ids shown in the last few cycles). Returns a
 * fresh pick when possible, or a category match outside the recents, or any
 * preferred-category item as a fallback.
 */
export function pickNextMovement(
  preferredCategories: string[] | null | undefined,
  recentIds: string[] = [],
): Movement {
  const prefs =
    preferredCategories && preferredCategories.length > 0
      ? preferredCategories
      : ALL_CATEGORY_IDS;
  const pool = movements.filter((mv) => prefs.includes(mv.category));
  const safe = pool.length > 0 ? pool : movements;
  const fresh = safe.filter((mv) => !recentIds.includes(mv.id));
  const finalPool = fresh.length > 0 ? fresh : safe;
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

/**
 * Map encouragement copy for after a movement completes. Keep the language
 * supportive, never demanding.
 */
export const encouragements = [
  "Movement completed.",
  "Small actions add up.",
  "Momentum builds through consistency.",
  "Your body appreciates every small effort.",
  "Gentle progress, real change.",
  "One mindful moment at a time.",
  "That was a kind thing to do for yourself.",
  "Steady rhythm, steady self.",
];

export interface SessionStep {
  movement: Movement;
  seconds: number; // per-step duration in seconds (60–120)
}

// ---------------------------------------------------------------------------
// Personalized guided-session generator
// ---------------------------------------------------------------------------

export interface BuildGuidedSessionOptions {
  preferredCategories?: string[] | null;
  fitnessLevel?: string | null;   // "beginner" | "casual" | "active" | "athletic"
  workStyle?: string | null;      // "desk" | "hybrid" | "active" | "on-the-go"
  wellnessGoals?: string[] | null;
  recentIds?: string[] | null;    // ids picked in recent sessions (avoid repeats)
  allowBreath?: boolean;
  includeBreath?: boolean;
  /**
   * "What to Nudge" toggles. Each enabled toggle guarantees at least one
   * activity of that type in the session. When all three are false we treat
   * it as all-on (defensive: never produce an empty session). Toggles act as
   * "must include" requirements — not as strict-only filters.
   */
  nudges?: {
    movement?: boolean;
    hydration?: boolean;
    breath?: boolean;
  } | null;
}

type DifficultyWeights = Record<MovementDifficulty, number>;

function difficultyWeightsFor(level: string | null | undefined): DifficultyWeights {
  switch ((level || "").toLowerCase()) {
    case "beginner":
      return { Gentle: 1.6, Easy: 0.7, Moderate: 0.15 };
    case "active":
      return { Gentle: 0.7, Easy: 1.1, Moderate: 1.3 };
    case "athletic":
    case "advanced":
      return { Gentle: 0.5, Easy: 1.0, Moderate: 1.6 };
    case "intermediate":
    case "casual":
    default:
      return { Gentle: 1.0, Easy: 1.0, Moderate: 0.6 };
  }
}

function durationEnvelopeFor(level: string | null | undefined): {
  minSec: number; maxSec: number; totalCap: number;
} {
  switch ((level || "").toLowerCase()) {
    case "beginner":
      return { minSec: 60, maxSec: 90, totalCap: 300 };
    case "active":
      return { minSec: 60, maxSec: 120, totalCap: 360 };
    case "athletic":
    case "advanced":
      return { minSec: 75, maxSec: 150, totalCap: 420 };
    case "intermediate":
    case "casual":
    default:
      return { minSec: 60, maxSec: 120, totalCap: 360 };
  }
}

function workStyleCategoryBias(workStyle: string | null | undefined): Partial<Record<MovementCategory, number>> {
  switch ((workStyle || "").toLowerCase()) {
    case "desk":
    case "remote":
    case "remote-desk":
      return {
        "desk-posture": 1.9,
        "stretch-mobility": 1.5,
        "breath-calm": 1.3,
        "quick-walks": 1.4,
        "hydration-wellness": 1.2,
      };
    case "hybrid":
      return {
        "desk-posture": 1.5,
        "stretch-mobility": 1.3,
        "quick-walks": 1.3,
        "breath-calm": 1.2,
        "strength-snacks": 1.1,
        "hydration-wellness": 1.1,
      };
    case "active":
      return {
        "low-energy": 1.7,
        "stretch-mobility": 1.6,
        "hydration-wellness": 1.4,
        "breath-calm": 1.2,
      };
    case "on-the-go":
    case "parent":
      return {
        "parent-friendly": 1.9,
        "quick-walks": 1.3,
        "breath-calm": 1.2,
        "stretch-mobility": 1.1,
      };
    default:
      return {};
  }
}

/**
 * Returns additive category boosts and a flag telling the builder whether to
 * guarantee a hydration step.
 */
function goalCategoryBias(goals: string[] | null | undefined): {
  boosts: Partial<Record<MovementCategory, number>>;
  requireHydration: boolean;
} {
  const boosts: Partial<Record<MovementCategory, number>> = {};
  let requireHydration = false;
  if (!goals || goals.length === 0) {
    return { boosts, requireHydration };
  }
  const add = (cat: MovementCategory, n: number) => {
    boosts[cat] = (boosts[cat] ?? 0) + n;
  };
  for (const raw of goals) {
    const g = raw.toLowerCase();
    if (g.includes("stress")) {
      add("breath-calm", 0.9);
      add("low-energy", 0.5);
      add("stretch-mobility", 0.3);
    }
    if (g.includes("energy") || g.includes("move more") || g.includes("daily movement")) {
      add("quick-walks", 0.8);
      add("strength-snacks", 0.6);
    }
    if (g.includes("posture")) {
      add("desk-posture", 0.9);
      add("stretch-mobility", 0.6);
    }
    if (g.includes("mobility")) {
      add("stretch-mobility", 0.9);
      add("low-energy", 0.3);
    }
    if (g.includes("hydrat")) {
      add("hydration-wellness", 1.0);
      requireHydration = true;
    }
    if (g.includes("breath") || g.includes("mindful")) {
      add("breath-calm", 0.7);
    }
    if (g.includes("sleep")) {
      add("breath-calm", 0.5);
      add("low-energy", 0.5);
    }
    if (g.includes("habit") || g.includes("consistency")) {
      // tiny generic nudge toward easy wins
      add("breath-calm", 0.2);
      add("desk-posture", 0.2);
    }
  }
  return { boosts, requireHydration };
}

/**
 * Weighted random draw (without replacement) from a list of movements with
 * associated weights. Returns null when no positive-weight item remains.
 */
function weightedDraw(
  pool: Movement[],
  weights: Map<string, number>,
): Movement | null {
  const total = pool.reduce((a, mv) => a + Math.max(0, weights.get(mv.id) ?? 0), 0);
  if (total <= 0) return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
  let r = Math.random() * total;
  for (const mv of pool) {
    const w = Math.max(0, weights.get(mv.id) ?? 0);
    if (r < w) return mv;
    r -= w;
  }
  return pool[pool.length - 1] ?? null;
}

/**
 * Build a personalized 5–6 minute guided session.
 *
 * Selection logic:
 *   1. Build per-movement weights from:
 *        base 1.0
 *        × difficulty multiplier (from fitness level)
 *        × preferred-category multiplier (1.5 if in prefs, 0.4 otherwise)
 *        × work-style category bias (×1.1–×1.9 on relevant categories)
 *        + goal-based additive category boost (e.g. stress → +breath/low-energy)
 *        × recency penalty (×0.2 if id is in recentIds)
 *   2. Always reserve one breath/calm step (drawn from breath pool) unless
 *      breath is disabled.
 *   3. If a hydration goal is present, reserve one hydration-wellness step.
 *   4. Fill remaining slots with weighted draws, preferring category variety.
 *   5. Convert to timed steps using a fitness-based per-step clamp and total
 *      duration cap (beginner 5 min, casual/active 6 min, athletic 7 min).
 */
export function buildGuidedSession(
  optsOrCategories?: BuildGuidedSessionOptions | string[] | null,
  legacyOpts?: { allowBreath?: boolean; includeBreath?: boolean },
): SessionStep[] {
  // Back-compat: allow buildGuidedSession(preferredCategories, { ... }).
  const opts: BuildGuidedSessionOptions = Array.isArray(optsOrCategories) || optsOrCategories == null
    ? { preferredCategories: (optsOrCategories as string[] | null | undefined) ?? null, ...(legacyOpts ?? {}) }
    : optsOrCategories;

  const allowBreath = opts.allowBreath !== false;
  const includeBreath = opts.includeBreath !== false;
  const recentIds = opts.recentIds ?? [];
  const fitness = opts.fitnessLevel ?? null;
  const workStyle = opts.workStyle ?? null;
  const goals = opts.wellnessGoals ?? [];

  // Normalize the "What to Nudge" toggles. If the caller didn't provide
  // them, fall back to the legacy allow/includeBreath flags plus everything
  // else on. If all three toggles are explicitly off, default back to all-on
  // so the session is never empty.
  const rawNudges = opts.nudges ?? null;
  let nudgeMovement = rawNudges ? rawNudges.movement !== false : true;
  let nudgeHydration = rawNudges ? rawNudges.hydration !== false : true;
  let nudgeBreath = rawNudges
    ? rawNudges.breath !== false
    : allowBreath && includeBreath;
  if (!nudgeMovement && !nudgeHydration && !nudgeBreath) {
    nudgeMovement = nudgeHydration = nudgeBreath = true;
  }
  // allowBreath kept as a hard kill-switch (legacy callers).
  if (!allowBreath) nudgeBreath = false;
  const onlyMovement = nudgeMovement && !nudgeHydration && !nudgeBreath;

  const hasPrefs = !!(opts.preferredCategories && opts.preferredCategories.length > 0);
  const prefs = hasPrefs
    ? opts.preferredCategories!
    : ALL_CATEGORY_IDS.filter((c) => c !== "parent-friendly");

  const diffW = difficultyWeightsFor(fitness);
  const workBias = workStyleCategoryBias(workStyle);
  const { boosts: goalBoosts, requireHydration } = goalCategoryBias(goals);
  // Stress / breathing goals allow a second breath step in the fill pass.
  const stressOrBreathGoal = (goals ?? []).some((g) => {
    const s = (g || "").toLowerCase();
    return s.includes("stress") || s.includes("breath");
  });

  const weightOf = (mv: Movement): number => {
    const inPrefs = prefs.includes(mv.category);
    const prefMult = hasPrefs ? (inPrefs ? 1.5 : 0.4) : 1.0;
    const workMult = workBias[mv.category] ?? 1.0;
    const goalAdd = goalBoosts[mv.category] ?? 0;
    const diffMult = diffW[mv.difficulty] ?? 1.0;
    const recencyMult = recentIds.includes(mv.id) ? 0.2 : 1.0;
    // Combine: category strength, then movement-level modifiers.
    const categoryWeight = prefMult * workMult + goalAdd;
    return Math.max(0.01, categoryWeight * diffMult * recencyMult);
  };

  const weights = new Map<string, number>();
  for (const mv of movements) weights.set(mv.id, weightOf(mv));

  const picked: Movement[] = [];
  const seen = new Set<string>();
  const usedCats = new Map<MovementCategory, number>();

  const drawFrom = (pool: Movement[]): Movement | null => {
    const available = pool.filter((mv) => !seen.has(mv.id));
    if (available.length === 0) return null;
    return weightedDraw(available, weights);
  };

  // 1. Reserve a breath step (always, when allowed). We slot it later.
  let breathPick: Movement | null = null;
  if (nudgeBreath) {
    const breathPool = movements.filter((mv) => mv.category === "breath-calm");
    breathPick = drawFrom(breathPool);
    if (breathPick) seen.add(breathPick.id);
  }

  // 2. Reserve a hydration step when the hydration toggle is on OR when a
  //    hydration wellness goal is set.
  let hydrationPick: Movement | null = null;
  if (nudgeHydration || requireHydration) {
    const hydroPool = movements.filter((mv) => mv.category === "hydration-wellness");
    hydrationPick = drawFrom(hydroPool);
    if (hydrationPick) seen.add(hydrationPick.id);
  }

  // 3. Fill the remaining slots from the non-breath pool with category variety.
  const targetCount = 4 + (Math.random() < 0.5 ? 0 : 1); // 4 or 5 total steps
  // Build the fill pool. Breath stays out by default (single-reserved step,
  // unless stress/breath goal allows an extra). Hydration is also kept out
  // of the fill pool because we cap at one hydration unless the profile
  // explicitly justifies more. Movement-only mode strips both non-movement
  // categories entirely so the session feels movement-focused.
  const fillPool = movements.filter((mv) => {
    if (mv.category === "breath-calm") {
      return nudgeBreath && stressOrBreathGoal;
    }
    if (mv.category === "hydration-wellness") {
      return false;
    }
    if (onlyMovement) {
      return true;
    }
    return true;
  });

  const reservedCount = (breathPick ? 1 : 0) + (hydrationPick ? 1 : 0);
  const slotsToFill = Math.max(2, targetCount - reservedCount);

  for (let i = 0; i < slotsToFill; i++) {
    // Soften weight further for categories already used at least once, to
    // encourage variety. Don't hard-exclude — pool may be small.
    const localWeights = new Map(weights);
    for (const mv of fillPool) {
      const usedTimes = usedCats.get(mv.category) ?? 0;
      if (usedTimes > 0) {
        localWeights.set(mv.id, (localWeights.get(mv.id) ?? 0) * (usedTimes === 1 ? 0.35 : 0.1));
      }
    }
    const available = fillPool.filter((mv) => !seen.has(mv.id));
    if (available.length === 0) break;
    const next = weightedDraw(available, localWeights);
    if (!next) break;
    picked.push(next);
    seen.add(next.id);
    usedCats.set(next.category, (usedCats.get(next.category) ?? 0) + 1);
  }

  // 4. Assemble final order: hydration near the start (after first movement),
  //    breath roughly in the middle.
  let ordered: Movement[] = [...picked];
  if (hydrationPick) {
    const insertAt = Math.min(1, ordered.length);
    ordered.splice(insertAt, 0, hydrationPick);
  }
  if (breathPick) {
    const mid = Math.min(Math.floor(ordered.length / 2) + 1, ordered.length);
    ordered.splice(mid, 0, breathPick);
  }

  // 5. Convert to timed steps using fitness envelope.
  const { minSec, maxSec, totalCap } = durationEnvelopeFor(fitness);
  const steps: SessionStep[] = [];
  let total = 0;
  for (const mv of ordered) {
    const raw = Math.round((mv.duration || 1) * 60);
    let secs = Math.max(minSec, Math.min(maxSec, raw));
    if (total + secs > totalCap) secs = Math.max(45, totalCap - total);
    if (secs < 30) break;
    steps.push({ movement: mv, seconds: secs });
    total += secs;
    if (total >= totalCap) break;
  }

  // Guarantee at least 3 steps (defensive: data is large enough that this rarely triggers).
  if (steps.length < 3) {
    const fallback = movements.filter(
      (mv) => !steps.find((s) => s.movement.id === mv.id) && (allowBreath || mv.category !== "breath-calm"),
    );
    for (let i = steps.length; i < 3 && fallback.length > 0; i++) {
      const mv = weightedDraw(fallback, weights) ?? fallback[0];
      if (!mv) break;
      steps.push({ movement: mv, seconds: minSec });
      const idx = fallback.indexOf(mv);
      if (idx >= 0) fallback.splice(idx, 1);
    }
  }

  return steps;
}

// Backwards-compatible alias used by a few legacy filters/icons.
export { Repeat as RotateIcon };