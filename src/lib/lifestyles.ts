import {
  Monitor,
  Home,
  Baby,
  Footprints,
  Shuffle,
  GraduationCap,
  Car,
  Moon,
  Stethoscope,
  ShoppingBag,
  Sparkles,
  Sofa,
  Calendar,
  type LucideIcon,
} from "lucide-react";

export interface LifestyleOption {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  defaultCategories: string[];
}

export const LIFESTYLES: LifestyleOption[] = [
  { id: "office-desk", label: "Office Desk Work", description: "Designed for long periods of sitting and screen time.", icon: Monitor,
    defaultCategories: ["desk-posture", "stretch-mobility", "quick-walks", "breath-calm", "hydration-wellness"] },
  { id: "remote-desk", label: "Remote Desk Work", description: "Gentle movement reminders for home-based workdays.", icon: Home,
    defaultCategories: ["desk-posture", "stretch-mobility", "quick-walks", "hydration-wellness", "breath-calm"] },
  { id: "stay-at-home-parent", label: "Stay-at-Home Parent", description: "Movement that fits around parenting and home routines.", icon: Baby,
    defaultCategories: ["parent-friendly", "stretch-mobility", "low-energy", "breath-calm"] },
  { id: "active-on-feet", label: "Active / On-Your-Feet Job", description: "Recovery-focused movement and mobility support.", icon: Footprints,
    defaultCategories: ["stretch-mobility", "low-energy", "breath-calm", "hydration-wellness"] },
  { id: "hybrid", label: "Hybrid Work Schedule", description: "Adapts to changing days at home and in the office.", icon: Shuffle,
    defaultCategories: ["desk-posture", "quick-walks", "stretch-mobility", "strength-snacks", "breath-calm"] },
  { id: "student", label: "Student", description: "Helpful breaks between study sessions and classes.", icon: GraduationCap,
    defaultCategories: ["desk-posture", "quick-walks", "stretch-mobility", "breath-calm"] },
  { id: "driver", label: "Frequent Driver / Commute", description: "Stretches and breath work for time on the road.", icon: Car,
    defaultCategories: ["stretch-mobility", "breath-calm", "hydration-wellness", "low-energy"] },
  { id: "shift-worker", label: "Shift Worker", description: "Flexible reminders that follow your shifting hours.", icon: Moon,
    defaultCategories: ["low-energy", "stretch-mobility", "breath-calm", "hydration-wellness"] },
  { id: "healthcare", label: "Healthcare Worker", description: "Quick resets between rounds and long shifts.", icon: Stethoscope,
    defaultCategories: ["stretch-mobility", "low-energy", "breath-calm", "hydration-wellness"] },
  { id: "retail-hospitality", label: "Retail / Hospitality", description: "Recovery moments for busy customer-facing days.", icon: ShoppingBag,
    defaultCategories: ["low-energy", "stretch-mobility", "breath-calm", "hydration-wellness"] },
  { id: "fitness-beginner", label: "Fitness Beginner", description: "Gentle starting points to build a daily habit.", icon: Sparkles,
    defaultCategories: ["quick-walks", "stretch-mobility", "strength-snacks", "breath-calm"] },
  { id: "retired-low-activity", label: "Retired / Low Activity", description: "Soft movement and mindful breath for steady days.", icon: Sofa,
    defaultCategories: ["low-energy", "stretch-mobility", "breath-calm", "hydration-wellness"] },
  { id: "general-busy", label: "General Busy Lifestyle", description: "Small, supportive resets for full days.", icon: Calendar,
    defaultCategories: ["desk-posture", "quick-walks", "stretch-mobility", "breath-calm", "hydration-wellness"] },
];

export const WELLNESS_GOALS = [
  "Reduce stress",
  "Improve consistency",
  "Improve mobility",
  "Increase daily movement",
  "Improve posture",
  "Increase hydration",
  "Improve energy",
  "Breath control & mindfulness",
] as const;

export function getLifestyle(id: string | null | undefined): LifestyleOption | undefined {
  if (!id) return undefined;
  return LIFESTYLES.find((l) => l.id === id);
}