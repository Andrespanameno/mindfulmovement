import {
  Award,
  Flame,
  Droplet,
  Sparkles,
  Wind,
  Sunrise,
  Trophy,
  Star,
  Zap,
  Target,
  Crown,
  Medal,
  Clock,
  Activity,
  Heart,
  Gem,
  Mountain,
  Footprints,
} from "lucide-react";
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

export interface MilestoneState {
  streak: number;
  bestStreak: number;
  totalXp: number;
  ouncesToday: number;
  totalSessions: number;
  totalMinutes: number;
  totalBreathing: number;
  hydrationGoalReachedDates: string[];
}

export interface Milestone {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  achieved: (s: MilestoneState) => boolean;
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
    achieved: (s) => s.ouncesToday >= 64,
  },
  {
    id: "xp-1000",
    label: "1,000 XP",
    description: "Small actions, big change.",
    icon: Award,
    achieved: (s) => s.totalXp >= 1000,
  },
  // Streak consistency
  {
    id: "streak-30",
    label: "30-Day Consistency",
    description: "A full month of showing up.",
    icon: Flame,
    achieved: (s) => s.bestStreak >= 30,
  },
  {
    id: "streak-60",
    label: "60-Day Rhythm",
    description: "Two months of steady rhythm.",
    icon: Mountain,
    achieved: (s) => s.bestStreak >= 60,
  },
  {
    id: "streak-100",
    label: "100-Day Lifestyle",
    description: "It's not a streak, it's a lifestyle.",
    icon: Crown,
    achieved: (s) => s.bestStreak >= 100,
  },
  // XP
  {
    id: "xp-2500",
    label: "2,500 XP",
    description: "Momentum is building.",
    icon: Star,
    achieved: (s) => s.totalXp >= 2500,
  },
  {
    id: "xp-5000",
    label: "5,000 XP",
    description: "Halfway to a major milestone.",
    icon: Trophy,
    achieved: (s) => s.totalXp >= 5000,
  },
  {
    id: "xp-10000",
    label: "10,000 XP",
    description: "An incredible body of work.",
    icon: Gem,
    achieved: (s) => s.totalXp >= 10000,
  },
  {
    id: "xp-25000",
    label: "25,000 XP",
    description: "A lifestyle of mindful movement.",
    icon: Crown,
    achieved: (s) => s.totalXp >= 25000,
  },
  // Guided sessions completed
  {
    id: "sessions-10",
    label: "10 Guided Sessions",
    description: "Ten gentle sessions completed.",
    icon: Target,
    achieved: (s) => s.totalSessions >= 10,
  },
  {
    id: "sessions-25",
    label: "25 Guided Sessions",
    description: "A solid practice forming.",
    icon: Target,
    achieved: (s) => s.totalSessions >= 25,
  },
  {
    id: "sessions-50",
    label: "50 Guided Sessions",
    description: "Fifty mindful sessions.",
    icon: Medal,
    achieved: (s) => s.totalSessions >= 50,
  },
  {
    id: "sessions-100",
    label: "100 Guided Sessions",
    description: "A century of sessions.",
    icon: Trophy,
    achieved: (s) => s.totalSessions >= 100,
  },
  // Movement minutes
  {
    id: "minutes-60",
    label: "60 Movement Minutes",
    description: "An hour of mindful movement.",
    icon: Clock,
    achieved: (s) => s.totalMinutes >= 60,
  },
  {
    id: "minutes-300",
    label: "300 Movement Minutes",
    description: "Five hours of movement.",
    icon: Activity,
    achieved: (s) => s.totalMinutes >= 300,
  },
  {
    id: "minutes-600",
    label: "600 Movement Minutes",
    description: "Ten hours of mindful movement.",
    icon: Footprints,
    achieved: (s) => s.totalMinutes >= 600,
  },
  {
    id: "minutes-1000",
    label: "1,000 Movement Minutes",
    description: "A thousand minutes in motion.",
    icon: Zap,
    achieved: (s) => s.totalMinutes >= 1000,
  },
  // Hydration goals
  {
    id: "hydration-5",
    label: "5 Hydration Days",
    description: "Five days fully hydrated.",
    icon: Droplet,
    achieved: (s) => s.hydrationGoalReachedDates.length >= 5,
  },
  {
    id: "hydration-25",
    label: "25 Hydration Days",
    description: "A steady hydration habit.",
    icon: Droplet,
    achieved: (s) => s.hydrationGoalReachedDates.length >= 25,
  },
  {
    id: "hydration-50",
    label: "50 Hydration Days",
    description: "Fifty days of full hydration.",
    icon: Gem,
    achieved: (s) => s.hydrationGoalReachedDates.length >= 50,
  },
  // Breathing sessions
  {
    id: "breathing-10",
    label: "10 Breathing Sessions",
    description: "Ten mindful breath sessions.",
    icon: Wind,
    achieved: (s) => s.totalBreathing >= 10,
  },
  {
    id: "breathing-25",
    label: "25 Breathing Sessions",
    description: "A calming breathwork habit.",
    icon: Heart,
    achieved: (s) => s.totalBreathing >= 25,
  },
];

export const xpEncouragements = [
  "Every movement counts.",
  "Small actions create big change.",
  "You're building momentum.",
  "Consistency over intensity.",
  "Gentle progress, real change.",
];