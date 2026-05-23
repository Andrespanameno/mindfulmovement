import {
  Monitor,
  Home,
  Baby,
  Briefcase,
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
}

export const LIFESTYLES: LifestyleOption[] = [
  { id: "office-desk", label: "Office Desk Work", description: "Designed for long periods of sitting and screen time.", icon: Monitor },
  { id: "remote-desk", label: "Remote Desk Work", description: "Gentle movement reminders for home-based workdays.", icon: Home },
  { id: "stay-at-home-parent", label: "Stay-at-Home Parent", description: "Movement that fits around parenting and home routines.", icon: Baby },
  { id: "busy-parent-fulltime", label: "Busy Parent + Full-Time Work", description: "Quick resets that work between meetings and family.", icon: Briefcase },
  { id: "active-on-feet", label: "Active / On-Your-Feet Job", description: "Recovery-focused movement and mobility support.", icon: Footprints },
  { id: "hybrid", label: "Hybrid Work Schedule", description: "Adapts to changing days at home and in the office.", icon: Shuffle },
  { id: "student", label: "Student", description: "Helpful breaks between study sessions and classes.", icon: GraduationCap },
  { id: "driver", label: "Frequent Driver / Commute", description: "Stretches and breath work for time on the road.", icon: Car },
  { id: "shift-worker", label: "Shift Worker", description: "Flexible reminders that follow your shifting hours.", icon: Moon },
  { id: "healthcare", label: "Healthcare Worker", description: "Quick resets between rounds and long shifts.", icon: Stethoscope },
  { id: "retail-hospitality", label: "Retail / Hospitality", description: "Recovery moments for busy customer-facing days.", icon: ShoppingBag },
  { id: "fitness-beginner", label: "Fitness Beginner", description: "Gentle starting points to build a daily habit.", icon: Sparkles },
  { id: "retired-low-activity", label: "Retired / Low Activity", description: "Soft movement and mindful breath for steady days.", icon: Sofa },
  { id: "general-busy", label: "General Busy Lifestyle", description: "Small, supportive resets for full days.", icon: Calendar },
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