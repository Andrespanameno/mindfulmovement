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
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [fitness, setFitness] = useState(profile.fitness_level ?? "");
  const [workStyle, setWorkStyle] = useState(profile.work_style ?? "");
  const [goals, setGoals] = useState<string[]>(profile.wellness_goals ?? []);
  const [water, setWater] = useState<number>(profile.daily_water_goal);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setFullName(profile.full_name ?? "");
      setFitness(profile.fitness_level ?? "");
      setWorkStyle(profile.work_style ?? "");
      setGoals(profile.wellness_goals ?? []);
      setWater(profile.daily_water_goal);
    }
  }, [open, profile]);

  const toggleGoal = (g: string) =>
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const handleSave = async () => {
    setBusy(true);
    const { error } = await onSave({
      full_name: fullName.trim() || null,
      fitness_level: fitness || null,
      work_style: workStyle || null,
      wellness_goals: goals,
      daily_water_goal: Math.max(16, Math.min(200, Number(water) || 64)),
      onboarding_completed: true,
    });
    setBusy(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Profile updated");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Personalize Mindful Movement to fit your day.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Rivera"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Fitness level</Label>
            <Select value={fitness} onValueChange={setFitness}>
              <SelectTrigger>
                <SelectValue placeholder="Select your level" />
              </SelectTrigger>
              <SelectContent>
                {FITNESS.map((f) => (
                  <SelectItem key={f} value={f} className="capitalize">
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Work style</Label>
            <Select value={workStyle} onValueChange={setWorkStyle}>
              <SelectTrigger>
                <SelectValue placeholder="How do you spend your day?" />
              </SelectTrigger>
              <SelectContent>
                {WORK_STYLES.map((w) => (
                  <SelectItem key={w} value={w} className="capitalize">
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Wellness goals</Label>
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
                  <span className="text-sm">{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="water">Daily water goal (oz)</Label>
            <Input
              id="water"
              type="number"
              min={16}
              max={200}
              value={water}
              onChange={(e) => setWater(Number(e.target.value))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}