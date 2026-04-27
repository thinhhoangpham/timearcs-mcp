export type InputNode = { id: string; label?: string; category?: string };
export type InputLink = { source: string; target: string; timestamp: string; value?: number };

export type RenderInput = {
  nodes: InputNode[];
  links: InputLink[];
  title?: string;
  numBuckets?: number;
  categorySlots?: Record<string, string>;
  categoryColors?: Record<string, string>;
  timeRange?: { min?: string; max?: string };
  linkThreshold?: number;
};
