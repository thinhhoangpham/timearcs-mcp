export function patchMainJs(
  rawSource: string,
  { minYear, maxYear, NUM_BUCKETS }: { minYear: number; maxYear: number; NUM_BUCKETS: number }
): string {
  return rawSource
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
}
