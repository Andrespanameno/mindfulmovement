import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useContent } from "@/lib/i18n-content";
import { Check } from "lucide-react";
import bambooAsset from "@/assets/profile-pictures/Bamboo.png.asset.json";
import pebblesAsset from "@/assets/profile-pictures/Pebbles.png.asset.json";
import waterDropAsset from "@/assets/profile-pictures/Water-Drop.png.asset.json";

export const AVATAR_PRESETS: Record<string, string> = {
  bamboo: bambooAsset.url,
  pebbles: pebblesAsset.url,
  "water-drop": waterDropAsset.url,
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: string | null;
  initial: string;
  onSelect: (preset: string | null) => void | Promise<void>;
};

export function AvatarPickerDialog({ open, onOpenChange, current, initial, onSelect }: Props) {
  const c = useContent();
  const options: { id: string | null; labelKey: string; url?: string }[] = [
    { id: null, labelKey: "profile.avatar.initials" },
    { id: "bamboo", labelKey: "profile.avatar.bamboo", url: AVATAR_PRESETS.bamboo },
    { id: "pebbles", labelKey: "profile.avatar.pebbles", url: AVATAR_PRESETS.pebbles },
    { id: "water-drop", labelKey: "profile.avatar.water_drop", url: AVATAR_PRESETS["water-drop"] },
  ];

  const handlePick = async (id: string | null) => {
    await onSelect(id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{c.t("profile.avatar.title")}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 pt-2">
          {options.map((opt) => {
            const selected = (current ?? null) === opt.id;
            return (
              <button
                key={opt.id ?? "initials"}
                type="button"
                onClick={() => handlePick(opt.id)}
                className="flex flex-col items-center gap-2"
              >
                <span
                  className={`relative size-24 rounded-full overflow-hidden ring-2 transition ${
                    selected ? "ring-primary" : "ring-black/5"
                  } bg-secondary grid place-items-center`}
                >
                  {opt.url ? (
                    <img src={opt.url} alt="" className="absolute inset-0 w-full h-full object-cover block rounded-full max-w-none max-h-none p-0 m-0" loading="lazy" />
                  ) : (
                    <span className="text-2xl font-semibold text-muted-foreground">{initial}</span>
                  )}
                  {selected && (
                    <span className="absolute bottom-1 right-1 size-6 rounded-full bg-primary grid place-items-center">
                      <Check className="size-3.5 text-primary-foreground" />
                    </span>
                  )}
                </span>
                <span className="text-xs font-medium">{c.t(opt.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}