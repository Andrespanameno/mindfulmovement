import { Award, Flame, Droplet, Sparkles, Wind, Sunrise } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const LEVEL_STEP = 500;

export const LEVEL_TITLES = [
  "First Step",
  "Gentle Mover",
  "Mindful Beginner",
  "Steady Soul",
  "Mindful Seeker",
  "Daily Devotee",
  "Calm Builder",
  "Quiet Strength",
  "Flow Keeper",
  "Inner Light",
];

export function getLevelInfo(totalXp: number) {
  const level = Math.floor(totalXp / LEVEL_STEP) + 1;
  const xpIntoLevel = totalXp % LEVEL_STEP;
  const pct = Math.round((xpIntoLevel / LEVEL_STEP) * 100);
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
  return {
    level,
    title,
    xpIntoLevel,
    xpForNext: LEVEL_STEP,
    pct,
    nextLevelTotal: level * LEVEL_STEP,
  };
}

export interface Milestone {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  achieved: (s: { streak: number; bestStreak: number; totalXp: number; glasses: number }) => boolean;
}

export const milestones: Milestone[] = [
  {
    id: "first-move",
    label: "First Step",
    description: "Your journey has begun.",
    icon: Sparkles,
    achieved: (s) => s.totalXp > 0,
  },
  {
    id: "streak-3",
    label: "3-Day Spark",
    description: "Three gentle days in a row.",
    icon: Flame,
    achieved: (s) => s.bestStreak >= 3,
  },
  {
    id: "streak-7",
    label: "7-Day Glow",
    description: "A full week of showing up.",
    icon: Sunrise,
    achieved: (s) => s.bestStreak >= 7,
  },
  {
    id: "streak-14",
    label: "Two-Week Flow",
    description: "Consistency is becoming you.",
    icon: Wind,
    achieved: (s) => s.bestStreak >= 14,
  },
  {
    id: "hydrated",
    label: "Hydrated Day",
    description: "Hit your water goal.",
    icon: Droplet,
    achieved: (s) => s.glasses >= 8,
  },
  {
    id: "xp-1000",
    label: "1,000 XP",
    description: "Small actions, big change.",
    icon: Award,
    achieved: (s) => s.totalXp >= 1000,
  },
];

export const xpEncouragements = [
  "Every movement counts.",
  "Small actions create big change.",
  "You're building momentum.",
  "Consistency over intensity.",
  "Gentle progress, real change.",
];