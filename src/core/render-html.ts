import type { RenderInput } from "./types.js";
import type { Sources } from "./sources-node.js";
import {
  resolveSlotMapping,
  resolveSlotColors,
  buildLegend,
  buildTimeBuckets,
  buildRows,
} from "./shape-data.js";
import { patchMainJs } from "./patch-main.js";
import { escapeHtml } from "./escape.js";

export function renderTimeArcsHtml(args: RenderInput, sources: Sources): string {
  const title = args.title ?? "TimeArcs";

  const { catToSlot, nodeCatSlot } = resolveSlotMapping(args.nodes, args.categorySlots);
  const slotColors = resolveSlotColors(catToSlot, args.categoryColors);
  const slotColorsLiteral = JSON.stringify(slotColors);

  const categoryLegend = buildLegend(args.nodes, catToSlot, slotColors);
  const categoryLegendLiteral = JSON.stringify(categoryLegend).replace(/</g, "\\u003c");

  const { tmin, tmax, NUM_BUCKETS, minYear, maxYear, bucketOf } = buildTimeBuckets(
    args.links,
    args.numBuckets,
    args.timeRange
  );

  const rows = buildRows(args.links, nodeCatSlot, bucketOf);
  const dataLiteral = JSON.stringify(rows).replace(/</g, "\\u003c");

  const mainPatched = patchMainJs(sources.mainRaw, { minYear, maxYear, NUM_BUCKETS });

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
${sources.util}
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
${sources.stopList}
</script>
<script>
${mainPatched}
</script>

</body>
</html>`;
}
