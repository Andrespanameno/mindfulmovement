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
  m("walk-3min", "3-Minute Walk", "Step away from the screen and reset.", "quick-walks", { duration: 3, xp: 30, difficulty: "Easy" }),
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
  m("one-min-stretch", "1-Minute Stretch", "Whatever your body asks for, gently.", "low-energy", { duration: 1, xp: 10 }),
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

/**
 * Build a 5–6 minute guided session of 3–5 short movements based on the
 * user's preferred categories. Always includes one breath/calm step when
 * possible. Per-step durations are clamped to 60–120s and the total is
 * capped at 360s (6 min).
 */
export function buildGuidedSession(
  preferredCategories: string[] | null | undefined,
  opts?: { allowBreath?: boolean; includeBreath?: boolean },
): SessionStep[] {
  const allowBreath = opts?.allowBreath !== false;
  const includeBreath = opts?.includeBreath !== false;
  const hasPrefs = !!(preferredCategories && preferredCategories.length > 0);
  // When the user has no explicit preferences, fall back to every category
  // EXCEPT parent-friendly — those movements only make sense for users whose
  // lifestyle includes parenting (their lifestyle preset will include it).
  const prefs = hasPrefs
    ? preferredCategories!
    : ALL_CATEGORY_IDS.filter((c) => c !== "parent-friendly");

  const pool = movements.filter((mv) => prefs.includes(mv.category));
  const safe = pool.length > 0 ? pool : movements;

  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Try to include one breath step, even if not in prefs — keeps sessions calm.
  const breath = allowBreath
    ? movements.filter((mv) => mv.category === "breath-calm")
    : [];
  const nonBreath = safe.filter((mv) => mv.category !== "breath-calm");

  const picked: Movement[] = [];
  const seen = new Set<string>();

  // Aim for variety across categories.
  const usedCats = new Set<string>();
  for (const mv of shuffle(nonBreath)) {
    if (seen.has(mv.id)) continue;
    if (usedCats.has(mv.category) && picked.length >= 2) continue;
    picked.push(mv);
    seen.add(mv.id);
    usedCats.add(mv.category);
    if (picked.length >= 3) break;
  }

  // Insert a breath step in the middle for a built-in reset.
  if (includeBreath && breath.length > 0) {
    const b = shuffle(breath)[0];
    if (!seen.has(b.id)) {
      picked.splice(Math.min(2, picked.length), 0, b);
      seen.add(b.id);
    }
  }

  // Optionally add one more for a 5-movement session.
  for (const mv of shuffle(nonBreath)) {
    if (picked.length >= 5) break;
    if (seen.has(mv.id)) continue;
    picked.push(mv);
    seen.add(mv.id);
  }

  // Convert to timed steps, clamp to 60–120s, cap total to 360s.
  const steps: SessionStep[] = [];
  let total = 0;
  const cap = 360;
  for (const mv of picked) {
    const raw = Math.round((mv.duration || 1) * 60);
    let secs = Math.max(60, Math.min(120, raw));
    if (total + secs > cap) secs = Math.max(45, cap - total);
    if (secs < 30) break;
    steps.push({ movement: mv, seconds: secs });
    total += secs;
    if (total >= cap) break;
  }

  // Guarantee at least 3 steps.
  if (steps.length < 3) {
    const fallbackPool = allowBreath ? safe : safe.filter((mv) => mv.category !== "breath-calm");
    for (const mv of shuffle(fallbackPool)) {
      if (steps.length >= 3) break;
      if (steps.find((s) => s.movement.id === mv.id)) continue;
      steps.push({ movement: mv, seconds: 60 });
    }
  }

  return steps;
}

// Backwards-compatible alias used by a few legacy filters/icons.
export { Repeat as RotateIcon };