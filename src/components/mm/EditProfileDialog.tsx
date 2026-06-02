import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { Profile, ProfileUpdate } from "@/lib/useProfile";
import { LIFESTYLES } from "@/lib/lifestyles";
import { useI18n } from "@/lib/i18n";
import { useContent } from "@/lib/i18n-content";
import { HydrationUnitToggle } from "@/components/mm/HydrationUnitToggle";
import { ozToMl, mlToOz, type HydrationUnit } from "@/lib/hydrationUnit";

const FITNESS = ["beginner", "casual", "active", "athletic"] as const;
const WORK_STYLES = ["desk", "hybrid", "active", "on-the-go"] as const;
const GOALS = [
  "Reduce stress",
  "Move more",
  "Stay hydrated",
  "Better posture",
  "Sleep better",
  "Build a habit",
] as const;

export function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profile: Profile;
  onSave: (patch: ProfileUpdate) => Promise<{ error: string | null }>;
}) {
  const { t } = useI18n();
  const c = useContent();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [fitness, setFitness] = useState(profile.fitness_level ?? "");
  const [workStyle, setWorkStyle] = useState(profile.work_style ?? "");
  const [lifestyle, setLifestyle] = useState(profile.lifestyle ?? "");
  const [goals, setGoals] = useState<string[]>(profile.wellness_goals ?? []);
  const [water, setWater] = useState<number>(profile.daily_water_goal);
  const [unit, setUnit] = useState<HydrationUnit>(profile.hydration_unit ?? "oz");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setFullName(profile.full_name ?? "");
      setFitness(profile.fitness_level ?? "");
      setWorkStyle(profile.work_style ?? "");
      setLifestyle(profile.lifestyle ?? "");
      setGoals(profile.wellness_goals ?? []);
      setWater(profile.daily_water_goal);
      setUnit(profile.hydration_unit ?? "oz");
    }
  }, [open, profile]);

  const toggleGoal = (g: string) =>
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const handleSave = async () => {
    setBusy(true);
    // `water` is stored in the currently-selected unit while editing.
    // Convert back to oz for storage.
    const waterOz = unit === "ml" ? mlToOz(Number(water) || 0) : Math.round(Number(water) || 0);
    const { error } = await onSave({
      full_name: fullName.trim() || null,
      fitness_level: fitness || null,
      work_style: workStyle || null,
      lifestyle: lifestyle || null,
      wellness_goals: goals,
      daily_water_goal: Math.max(16, Math.min(400, waterOz || 64)),
      hydration_unit: unit,
      onboarding_completed: true,
    });
    setBusy(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success(t("edit.updated"));
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("edit.title")}</DialogTitle>
          <DialogDescription>{t("edit.desc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">{t("edit.name")}</Label>
            <Input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Rivera"
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("edit.fitness")}</Label>
            <Select value={fitness} onValueChange={setFitness}>
              <SelectTrigger>
                <SelectValue placeholder={t("edit.fitness.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {FITNESS.map((f) => (
                  <SelectItem key={f} value={f} className="capitalize">
                    {c.fitness(f)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>{t("edit.lifestyle")}</Label>
            <Select value={lifestyle} onValueChange={setLifestyle}>
              <SelectTrigger>
                <SelectValue placeholder={t("edit.lifestyle.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {LIFESTYLES.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {c.lifestyleLabel(l.id, l.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>{t("edit.work_style")}</Label>
            <Select value={workStyle} onValueChange={setWorkStyle}>
              <SelectTrigger>
                <SelectValue placeholder={t("edit.work_style.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {WORK_STYLES.map((w) => (
                  <SelectItem key={w} value={w} className="capitalize">
                    {c.workStyle(w)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("edit.goals")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map((g) => (
                <label
                  key={g}
                  className="flex items-center gap-2 p-2 rounded-lg ring-1 ring-border cursor-pointer"
                >
                  <Checkbox
                    checked={goals.includes(g)}
                    onCheckedChange={() => toggleGoal(g)}
                  />
                  <span className="text-sm">{c.wellnessGoal(g)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="water">{unit === "ml" ? t("edit.water_ml") : t("edit.water_oz")}</Label>
              <HydrationUnitToggle
                value={unit}
                onChange={(next) => {
                  if (next === unit) return;
                  // convert current input between units so the user sees the equivalent value
                  const current = Number(water) || 0;
                  if (next === "ml" && unit === "oz") setWater(ozToMl(current));
                  else if (next === "oz" && unit === "ml") setWater(mlToOz(current));
                  setUnit(next);
                }}
              />
            </div>
            <Input
              id="water"
              type="number"
              min={unit === "ml" ? 500 : 16}
              max={unit === "ml" ? 6000 : 200}
              value={water}
              onChange={(e) => setWater(Number(e.target.value))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={busy}>
            {busy ? t("common.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}