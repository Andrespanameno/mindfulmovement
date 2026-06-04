export type HydrationUnit = "oz" | "ml";

export const ML_PER_OZ = 29.5735;

export const ozToMl = (oz: number) => Math.round(oz * ML_PER_OZ);
// Keep full precision: rounding here causes mL → oz → mL display drift
// (e.g. 250 mL → 8 oz → 237 mL). Display formatters round at the edges.
export const mlToOz = (ml: number) => ml / ML_PER_OZ;

export const formatAmount = (oz: number, unit: HydrationUnit) =>
  unit === "ml" ? ozToMl(oz) : Math.round(oz);

export const QUICK_ADDS_ML = [250, 500, 750] as const;