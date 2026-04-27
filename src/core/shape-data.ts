import type { InputNode, InputLink, RenderInput } from "./types.js";

const SLOTS = ["person", "location", "organization", "miscellaneous"] as const;
const VALID_SLOTS = new Set<string>(SLOTS);

export function resolveSlotMapping(
  nodes: InputNode[],
  categorySlots?: Record<string, string>
): { catToSlot: Record<string, string>; nodeCatSlot: Record<string, string> } {
  const categories = Array.from(new Set(nodes.map((n) => n.category ?? "default")));
  const catToSlot: Record<string, string> = {};

  if (categorySlots) {
    categories.forEach((c) => {
      const requested = categorySlots[c];
      catToSlot[c] = requested && VALID_SLOTS.has(requested) ? requested : "miscellaneous";
    });
  } else {
    categories.forEach((c, i) => {
      catToSlot[c] = SLOTS[Math.min(i, SLOTS.length - 1)];
    });
  }

  const nodeCatSlot: Record<string, string> = {};
  for (const n of nodes) {
    nodeCatSlot[n.id] = catToSlot[n.category ?? "default"];
  }

  return { catToSlot, nodeCatSlot };
}

export function resolveSlotColors(
  catToSlot: Record<string, string>,
  categoryColors?: Record<string, string>
): Record<string, string> {
  const slotColors: Record<string, string> = {
    person: "#00aa00",
    location: "#cc0000",
    organization: "#0000cc",
    miscellaneous: "#aaaa00",
  };
  if (categoryColors) {
    for (const [cat, color] of Object.entries(categoryColors)) {
      const slot = catToSlot[cat];
      if (slot) slotColors[slot] = color;
    }
  }
  return slotColors;
}

export function buildLegend(
  nodes: InputNode[],
  catToSlot: Record<string, string>,
  slotColors: Record<string, string>
): Array<{ label: string; color: string }> {
  const categories = Array.from(new Set(nodes.map((n) => n.category ?? "default")));
  return categories.map((cat) => ({
    label: cat,
    color: slotColors[catToSlot[cat]],
  }));
}

export type TimeBuckets = {
  tmin: number;
  tmax: number;
  NUM_BUCKETS: number;
  minYear: number;
  maxYear: number;
  bucketOf: (ts: number) => number;
};

export function buildTimeBuckets(
  links: InputLink[],
  numBuckets?: number,
  timeRange?: { min?: string; max?: string }
): TimeBuckets {
  const timestamps = links.map((l) => new Date(l.timestamp).getTime());
  const tminAuto = Math.min(...timestamps);
  const tmaxAuto = Math.max(...timestamps);
  const tmin = timeRange?.min ? new Date(timeRange.min).getTime() : tminAuto;
  const tmax = timeRange?.max ? new Date(timeRange.max).getTime() : tmaxAuto;
  const NUM_BUCKETS = numBuckets ?? 60;
  const bucketMs = Math.max(1, (tmax - tmin) / NUM_BUCKETS);

  function bucketOf(ts: number): number {
    return Math.max(0, Math.min(NUM_BUCKETS - 1, Math.floor((ts - tmin) / bucketMs)));
  }

  const minYear = new Date(tmin).getFullYear();
  const maxYear = new Date(tmax).getFullYear() + 1;

  return { tmin, tmax, NUM_BUCKETS, minYear, maxYear, bucketOf };
}

export function buildRows(
  links: InputLink[],
  nodeCatSlot: Record<string, string>,
  bucketOf: (ts: number) => number
): Array<Record<string, string | number>> {
  return links.map((l, i) => {
    const row: Record<string, string | number> = {
      source: `doc_${i}`,
      time: l.timestamp,
      person: "",
      location: "",
      organization: "",
      miscellaneous: "",
      _m: bucketOf(new Date(l.timestamp).getTime()),
    };
    for (const entityId of [l.source, l.target]) {
      const slot = nodeCatSlot[entityId];
      if (!slot) continue;
      row[slot] = row[slot] ? `${row[slot]}|${entityId}` : entityId;
    }
    return row;
  });
}
