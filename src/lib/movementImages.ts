// Auto-map movement images by filename → movement id.
// Drop a PNG/JPG/WEBP into src/assets/movements/ named like the movement id
// (e.g. "wall-pushups.png" or "Wall Pushups.png") and it will appear on the
// matching MovementCard automatically — no manual wiring needed.

import { movements } from "@/lib/movements";

const modules = import.meta.glob(
  "../assets/movements/*.{png,jpg,jpeg,webp,avif}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "") // strip extension
    .replace(/[\s_]+/g, "-") // spaces/underscores → hyphen
    .replace(/[^a-z0-9-]/g, "") // drop other chars
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Build a lookup keyed by the normalized filename.
const byKey: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const file = path.split("/").pop() ?? "";
  byKey[normalize(file)] = url;
}

// Map each movement id → image url, matching by id OR by title so filenames
// like "1 Minute Stretch.png" (title) bind even when the id differs
// ("one-min-stretch"). Last match wins; id takes precedence.
const byMovementId: Record<string, string> = {};
for (const mv of movements) {
  const titleKey = normalize(mv.title);
  const idKey = normalize(mv.id);
  const hit = byKey[idKey] ?? byKey[titleKey];
  if (hit) byMovementId[mv.id] = hit;
}

export function getMovementImage(movementId: string): string | undefined {
  return byMovementId[movementId] ?? byKey[normalize(movementId)];
}