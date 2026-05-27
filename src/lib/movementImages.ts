// Auto-map movement images by filename → movement id.
// Drop a PNG/JPG/WEBP into src/assets/movements/ named like the movement id
// (e.g. "wall-pushups.png" or "Wall Pushups.png") and it will appear on the
// matching MovementCard automatically — no manual wiring needed.

const modules = import.meta.glob(
  "@/assets/movements/*.{png,jpg,jpeg,webp,avif}",
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

const byId: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const file = path.split("/").pop() ?? "";
  byId[normalize(file)] = url;
}

export function getMovementImage(movementId: string): string | undefined {
  return byId[normalize(movementId)];
}