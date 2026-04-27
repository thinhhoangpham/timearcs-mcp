#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { renderTimeArcsHtml } from "./core/render-html.js";
import { renderBootstrapHtml } from "./core/render-bootstrap.js";
import { SOURCES as nodeSources } from "./core/sources-node.js";
import type { InputNode, InputLink } from "./core/types.js";

// When this tag exists on GitHub, jsDelivr will serve the browser library.
// Run: git tag v0.1.0 && git push origin v0.1.0 before using the bootstrap mode.
const LIB_URL =
  "https://cdn.jsdelivr.net/gh/thinhhoangpham/timearcs-mcp@v0.1.0/dist/browser/timearcs.umd.js";

const server = new Server(
  { name: "my-chart-mcp", version: "0.1.0" },
  { capabilities: { tools: {}, resources: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "render_timearc_chart",
      description:
        "Render an interactive TimeArcs visualization (Bach et al.) of a time-stamped network " +
        "graph. Returns a self-contained HTML artifact that bundles the original TimeArcs D3 v3 " +
        "source code (force-directed layout + vertical ordering + drag + stream graphs + " +
        "relationship network). Use for any data expressible as (nodes, time-stamped links): " +
        "co-occurrence networks, attack reconstructions, communication graphs, session timelines. " +
        "Layout knobs (numBuckets, categorySlots, categoryColors, timeRange, linkThreshold) let " +
        "you control time resolution, category grouping, colors, visible window, and clutter.",
      inputSchema: {
        type: "object",
        properties: {
          nodes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                category: { type: "string" },
              },
              required: ["id"],
            },
          },
          links: {
            type: "array",
            items: {
              type: "object",
              properties: {
                source: { type: "string" },
                target: { type: "string" },
                timestamp: { type: "string", format: "date-time" },
                value: { type: "number" },
              },
              required: ["source", "target", "timestamp"],
            },
          },
          title: { type: "string" },
          numBuckets: {
            type: "integer",
            description:
              "Number of time buckets to divide the timeline into (default 60). More buckets " +
              "produce finer arc resolution but increase visual noise. Raise for long spans with " +
              "dense activity; lower for sparse or short-window data.",
          },
          categorySlots: {
            type: "object",
            additionalProperties: { type: "string", enum: ["person", "location", "organization", "miscellaneous"] },
            description:
              "Maps each user-defined category name to one of the four structural TimeArcs slots: " +
              "\"person\", \"location\", \"organization\", or \"miscellaneous\". Slots are visual " +
              "lanes, not semantic labels — choose based on how you want entities grouped on the " +
              "vertical axis, not their literal type. If omitted, categories are assigned to slots " +
              "in insertion order. If more than four distinct categories are present, extras fall " +
              "into \"miscellaneous\". Invalid slot values are silently coerced to \"miscellaneous\".",
          },
          categoryColors: {
            type: "object",
            additionalProperties: { type: "string" },
            description:
              "Maps user-defined category names to CSS color strings (e.g. \"#cc0000\" or " +
              "\"steelblue\") for node label text. Overrides the default slot colors " +
              "(person=green, location=red, organization=blue, miscellaneous=yellow). " +
              "Keyed by your category name, not the slot name. If two categories share a slot " +
              "and specify different colors, the last one processed wins.",
          },
          timeRange: {
            type: "object",
            properties: {
              min: { type: "string", format: "date-time", description: "Inclusive start of the visible time window (ISO-8601). Links before this are clamped to bucket 0, not dropped." },
              max: { type: "string", format: "date-time", description: "Inclusive end of the visible time window (ISO-8601). Links after this are clamped to the last bucket, not dropped." },
            },
            description:
              "Clamp the rendered timeline to a specific window. Useful when the dataset spans " +
              "a long period but the interesting activity is concentrated in a sub-range. Links " +
              "outside the window are bucketed at the boundary rather than removed.",
          },
          linkThreshold: {
            type: "integer",
            description:
              "Minimum number of co-occurrences for a node pair to render an arc (default 1). " +
              "Raise this to suppress low-frequency connections and reduce clutter in dense graphs.",
          },
          inline: {
            type: "boolean",
            description:
              "If true (default), returns a fully self-contained HTML with all upstream code inlined (~65KB). " +
              "Works in Claude Desktop artifacts. Set to false only when embedding in a webpage where loading " +
              "from cdn.jsdelivr.net is permitted, to get a small ~3KB bootstrap that fetches the TimeArcs " +
              "library from a public CDN.",
          },
        },
        required: ["nodes", "links"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (req.params.name !== "render_timearc_chart") throw new Error("Unknown tool");
  const args = req.params.arguments as {
    nodes: InputNode[];
    links: InputLink[];
    title?: string;
    numBuckets?: number;
    categorySlots?: Record<string, string>;
    categoryColors?: Record<string, string>;
    timeRange?: { min?: string; max?: string };
    linkThreshold?: number;
    inline?: boolean;
  };

  const html =
    args.inline === false
      ? renderBootstrapHtml(args, LIB_URL)
      : renderTimeArcsHtml(args, nodeSources);
  const catCount = new Set(args.nodes.map((n) => n.category ?? "default")).size;

  const layoutNotes: string[] = [];
  if (args.numBuckets != null) layoutNotes.push(`bucketed into ${args.numBuckets} intervals`);
  if (args.timeRange?.min || args.timeRange?.max) {
    layoutNotes.push(`time range clamped to ${args.timeRange.min ?? "auto"}..${args.timeRange.max ?? "auto"}`);
  }
  if (args.linkThreshold != null && args.linkThreshold !== 1) layoutNotes.push(`link threshold ${args.linkThreshold}`);
  const layoutSuffix = layoutNotes.length ? ` (${layoutNotes.join(", ")})` : "";

  return {
    content: [
      {
        type: "text",
        text: `Rendered TimeArcs: ${args.nodes.length} nodes, ${args.links.length} links, ${catCount} categories${layoutSuffix}. Respond by creating a single \`text/html\` artifact containing exactly the HTML below, unchanged. Do not summarize, truncate, or modify the HTML. After creating the artifact, you may add a short description.`,
      },
      {
        type: "text",
        text: html,
      },
    ],
  };
});

await server.connect(new StdioServerTransport());
