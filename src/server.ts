#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

type InputNode = { id: string; label?: string; category?: string };
type InputLink = { source: string; target: string; timestamp: string; value?: number };

const __dirname = dirname(fileURLToPath(import.meta.url));
// dist/server.js is two levels below repo root; source tree lives at <root>/TimeArcs-master/Text
const SRC_ROOT = join(__dirname, "..", "TimeArcs-master", "Text");

async function readSrc(rel: string): Promise<string> {
  return readFile(join(SRC_ROOT, rel), "utf8");
}

const SOURCES = {
  fisheye: await readSrc("javascripts/fisheye.js"),
  util: await readSrc("myscripts/util.js"),
  slider: await readSrc("myscripts/sliderRelationship.js"),
  stream: await readSrc("myscripts/streamGraph.js"),
  stopList: await readSrc("myscripts/stopList.js"),
  mainRaw: await readSrc("myscripts/main.js"),
};

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
  };

  const html = buildHtml(args);
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

function buildHtml(args: {
  nodes: InputNode[];
  links: InputLink[];
  title?: string;
  numBuckets?: number;
  categorySlots?: Record<string, string>;
  categoryColors?: Record<string, string>;
  timeRange?: { min?: string; max?: string };
  linkThreshold?: number;
}): string {
  const title = args.title ?? "TimeArcs";

  // Map user categories to the 4 TSV column slots expected by main.js
  const SLOTS = ["person", "location", "organization", "miscellaneous"] as const;
  const VALID_SLOTS = new Set<string>(SLOTS);
  const categories = Array.from(new Set(args.nodes.map((n) => n.category ?? "default")));
  const catToSlot: Record<string, string> = {};
  if (args.categorySlots) {
    categories.forEach((c, i) => {
      const requested = args.categorySlots![c];
      catToSlot[c] = requested && VALID_SLOTS.has(requested) ? requested : "miscellaneous";
    });
  } else {
    categories.forEach((c, i) => {
      catToSlot[c] = SLOTS[Math.min(i, SLOTS.length - 1)];
    });
  }
  const nodeCatSlot: Record<string, string> = {};
  for (const n of args.nodes) {
    nodeCatSlot[n.id] = catToSlot[n.category ?? "default"];
  }

  // Resolve per-slot colors. Start from defaults, then apply per-user-category overrides.
  // If two user categories map to the same slot with different colors, last-writer-wins.
  const slotColors: Record<string, string> = {
    person: "#00aa00",
    location: "#cc0000",
    organization: "#0000cc",
    miscellaneous: "#aaaa00",
  };
  if (args.categoryColors) {
    for (const [cat, color] of Object.entries(args.categoryColors)) {
      const slot = catToSlot[cat];
      if (slot) slotColors[slot] = color;
    }
  }
  const slotColorsLiteral = JSON.stringify(slotColors);

  // Build legend entries in first-seen category order so the legend reflects actual user data.
  const categoryLegend = categories.map((cat) => ({
    label: cat,
    color: slotColors[catToSlot[cat]],
  }));
  const categoryLegendLiteral = JSON.stringify(categoryLegend).replace(/</g, "\\u003c");

  // Time range and bucketing. Use NUM_BUCKETS across the visible time range (main.js treats
  // these as "months"). Each link gets a precomputed _m (integer bucket index).
  const timestamps = args.links.map((l) => new Date(l.timestamp).getTime());
  const tminAuto = Math.min(...timestamps);
  const tmaxAuto = Math.max(...timestamps);
  const tmin = args.timeRange?.min ? new Date(args.timeRange.min).getTime() : tminAuto;
  const tmax = args.timeRange?.max ? new Date(args.timeRange.max).getTime() : tmaxAuto;
  const NUM_BUCKETS = args.numBuckets ?? 60;
  const bucketMs = Math.max(1, (tmax - tmin) / NUM_BUCKETS);
  function bucketOf(ts: number): number {
    return Math.max(0, Math.min(NUM_BUCKETS - 1, Math.floor((ts - tmin) / bucketMs)));
  }

  const minYear = new Date(tmin).getFullYear();
  const maxYear = new Date(tmax).getFullYear() + 1; // make sure filter passes

  // Build TSV-like rows: one row per user link. Each row contains source/target entity ids
  // placed in the right category column.
  const rows = args.links.map((l, i) => {
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

  // Patch main.js: pin minYear/maxYear, use precomputed bucket, strip jQuery/slider/lensing/
  // secondary-network so only the TimeArcs chart + color legend render.
  const mainPatched = SOURCES.mainRaw
    .replace(/var minYear\s*=\s*2006\s*;/, `var minYear = ${minYear};`)
    .replace(/var maxYear\s*=\s*2015\s*;/, `var maxYear = ${maxYear};`)
    .replace(
      /var m\s*=\s*12\*\(year-minYear\)\s*\+\s*d\.date\.getMonth\(\)\s*;/,
      `var m = (+d._m);`
    )
    .replace(/var numMonth\s*=\s*12\*\(maxYear-minYear\)\s*;/, `var numMonth = ${NUM_BUCKETS};`)
    .replace(
      /\$\(function \(\) \{\s*\$\("#search"\)\.autocomplete\(\{[\s\S]*?\}\);\s*\}\);/,
      "/* autocomplete stripped */"
    )
    .replace(
      /\$\('#btnUpload'\)\.click\(function\(\) \{[\s\S]*?\n\}\);/,
      "/* btnUpload stripped */"
    )
    // Detach the secondary force-directed network SVG.
    .replace(
      /var svg2 = d3\.select\("body"\)\.append\("svg"\)/,
      `var svg2 = d3.select(document.createElement("div")).append("svg")`
    )
    .replace(/setupSliderScale\(svg\);/, "/* slider disabled */")
    .replace(/drawTimeBox\(\);/, "/* lensing disabled */")
    .replace(/drawLensingButton\(\);/, "/* lensing disabled */")
    // Strip leftover debugger breakpoint.
    .replace(/^\s*debugger\s*;\s*$/m, "/* debugger removed */")
    // Color node labels by category using the legend's colors.
    .replace(
      /\.style\("fill", "#000000"\)\s*\.style\("text-anchor","end"\)/,
      `.style("fill", function(d){ return __slotColors[d.group] || "#000"; })
        .style("text-anchor","end")`
    );

  const dataLiteral = JSON.stringify(rows).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  body { margin: 0; font-family: Helvetica, sans-serif; }
  .node { stroke: #fff; stroke-width: 1px; stroke-opacity: 0.6; }
  .linkArc { fill: none; stroke: #000; }
  .layer { display: none; }
  .node text { font: 9px helvetica; }
  .axis { font: 10px sans-serif; user-select: none; }
  .axis .domain { fill: none; stroke: #000; stroke-opacity: .25; stroke-width: 5px; stroke-linecap: round; }
  .axis .halo { fill: none; stroke: #ddd; stroke-width: 3px; stroke-linecap: round; }
  #checkbox1, label[for=checkbox1], #search, #progBar, #progUpdate { display: none; }
</style>
</head>
<body>

<input type="checkbox" id="checkbox1">
<label for="checkbox1">Area graph only</label>
<input type="text" id="search">
<progress value="0" max="100" id="progBar"></progress>
<label id="progUpdate"></label>

<script>
  // Defaults main.js would have gotten from sliderRelationship.js — keep the variable,
  // drop the UI.
  var valueSlider = ${args.linkThreshold ?? 1};
  var valueMax = 10;
  function setupSliderScale(){ /* disabled */ }
  var __slotColors = ${slotColorsLiteral};
  var __categoryLegend = ${categoryLegendLiteral};
  window.INLINE_TSV_DATA = ${dataLiteral};
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.min.js"></script>
<script>
// Override d3.tsv so main.js gets inline data instead of fetching a file.
(function(){
  d3.tsv = function(path, callback) {
    setTimeout(function(){ callback(null, window.INLINE_TSV_DATA); }, 0);
    return this;
  };
})();
</script>
<script>
${SOURCES.util}
</script>
<script>
// Override drawColorLegend to render one row per actual user category instead of the
// four hardcoded Person/Location/Organization/Miscellaneous labels in util.js.
(function(){
  drawColorLegend = function() {
    svg.selectAll(".nodeLegend").remove();
    var xx = 6, rr = 6;
    __categoryLegend.forEach(function(entry, i) {
      var y = 20 + i * 14;
      svg.append("circle")
        .attr("class", "nodeLegend")
        .attr("cx", xx).attr("cy", y).attr("r", rr)
        .style("fill", entry.color);
      svg.append("text")
        .attr("class", "nodeLegend")
        .attr("x", xx + 10).attr("y", y + 1)
        .text(entry.label)
        .attr("dy", ".21em")
        .attr("font-family", "sans-serif").attr("font-size", "11px")
        .style("text-anchor", "left")
        .style("fill", entry.color);
    });
  };
})();
</script>
<script>
// Override drawTimeLegend/updateTimeLegend with a real date axis based on our bucket range.
(function(){
  var TMIN = ${tmin}, TMAX = ${tmax}, NBUCK = ${NUM_BUCKETS};
  function drawAxis() {
    svg.selectAll(".timeLegendLine,.timeLegendText").remove();
    var ticks = 6;
    for (var i = 0; i <= ticks; i++) {
      var t = TMIN + (TMAX - TMIN) * (i / ticks);
      var m = Math.min(NBUCK - 1, Math.floor((t - TMIN) / Math.max(1, (TMAX - TMIN) / NBUCK)));
      var xx = xStep + xScale(m);
      svg.append("line").attr("class","timeLegendLine")
        .style("stroke","#000").style("stroke-dasharray","1,2")
        .style("stroke-opacity", 0.4).style("stroke-width", 0.3)
        .attr("x1", xx).attr("x2", xx).attr("y1", 0).attr("y2", height);
      var d = new Date(t);
      var label = (d.getUTCFullYear()+"-"+String(d.getUTCMonth()+1).padStart(2,"0")+"-"+String(d.getUTCDate()).padStart(2,"0")+" "+String(d.getUTCHours()).padStart(2,"0")+":"+String(d.getUTCMinutes()).padStart(2,"0"));
      svg.append("text").attr("class","timeLegendText")
        .style("fill","#222").style("text-anchor","middle")
        .attr("x", xx).attr("y", height - 6)
        .attr("font-family","sans-serif").attr("font-size","10px")
        .text(label);
    }
  }
  drawTimeLegend = drawAxis;
  updateTimeLegend = drawAxis;
  updateTimeBox = function(){ /* lensing disabled */ };
})();
</script>
<script>
${SOURCES.stopList}
</script>
<script>
${mainPatched}
</script>

</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c] as string);
}

await server.connect(new StdioServerTransport());
