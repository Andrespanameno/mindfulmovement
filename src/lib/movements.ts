import type { LucideIcon } from "lucide-react";
import {
  Footprints,
  Armchair,
  Hand,
  TrendingUp,
  Wind,
  Smile,
  HeartHandshake,
  Sunrise,
  StretchHorizontal,
  Leaf,
} from "lucide-react";

export type MovementCategory = "Walk" | "Stretch" | "Strength" | "Breathing" | "Mobility";
export type MovementDifficulty = "Gentle" | "Easy" | "Moderate";

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
}

export const movements: Movement[] = [
  {
    id: "walk-reset",
    title: "3-Minute Walk Reset",
    description: "Step away from your screen and take a gentle walk to refresh your mind.",
    duration: 3,
    xp: 30,
    difficulty: "Gentle",
    category: "Walk",
    icon: Footprints,
    tint: "bg-primary/25",
  },
  {
    id: "desk-stretch",
    title: "Desk Stretch Flow",
    description: "Loosen tight shoulders and wrists without leaving your chair.",
    duration: 4,
    xp: 40,
    difficulty: "Gentle",
    category: "Stretch",
    icon: Armchair,
    tint: "bg-warm/40",
  },
  {
    id: "wall-pushup",
    title: "Wall Push-Up Session",
    description: "Wake up your arms and chest with a few mindful wall push-ups.",
    duration: 4,
    xp: 45,
    difficulty: "Easy",
    category: "Strength",
    icon: Hand,
    tint: "bg-accent/20",
  },
  {
    id: "calf-raise",
    title: "Calf Raise Burner",
    description: "A short standing set to get your circulation moving.",
    duration: 3,
    xp: 35,
    difficulty: "Easy",
    category: "Strength",
    icon: TrendingUp,
    tint: "bg-primary/25",
  },
  {
    id: "deep-breathing",
    title: "Deep Breathing Reset",
    description: "Slow your breath, calm your nervous system, return to center.",
    duration: 3,
    xp: 30,
    difficulty: "Gentle",
    category: "Breathing",
    icon: Wind,
    tint: "bg-warm/40",
  },
  {
    id: "neck-shoulder",
    title: "Neck & Shoulder Relief",
    description: "Release tension from long hours of sitting and scrolling.",
    duration: 4,
    xp: 40,
    difficulty: "Gentle",
    category: "Stretch",
    icon: StretchHorizontal,
    tint: "bg-primary/25",
  },
  {
    id: "parent-energy",
    title: "Parent Energy Reset",
    description: "A quick recharge for the in-between moments of a busy day.",
    duration: 5,
    xp: 50,
    difficulty: "Easy",
    category: "Mobility",
    icon: HeartHandshake,
    tint: "bg-accent/20",
  },
  {
    id: "morning-mobility",
    title: "Morning Mobility Flow",
    description: "Gently wake your body with smooth, flowing movement.",
    duration: 5,
    xp: 50,
    difficulty: "Easy",
    category: "Mobility",
    icon: Sunrise,
    tint: "bg-warm/40",
  },
  {
    id: "posture-reset",
    title: "Posture Reset",
    description: "Stand tall and realign with mindful posture cues.",
    duration: 2,
    xp: 25,
    difficulty: "Gentle",
    category: "Mobility",
    icon: Leaf,
    tint: "bg-primary/25",
  },
  {
    id: "stress-breathing",
    title: "Stress Relief Breathing",
    description: "Box breathing to soften stress and steady your focus.",
    duration: 4,
    xp: 40,
    difficulty: "Gentle",
    category: "Breathing",
    icon: Smile,
    tint: "bg-accent/20",
  },
];

export const encouragements = [
  "Beautifully done. Your body thanks you.",
  "Small moves, big impact. Keep going.",
  "That was a gift to yourself.",
  "One mindful moment at a time.",
  "You showed up — that's what matters.",
  "Gentle progress, real change.",
];