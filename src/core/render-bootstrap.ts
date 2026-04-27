import type { RenderInput } from "./types.js";
import { escapeHtml } from "./escape.js";

export function renderBootstrapHtml(input: RenderInput, libUrl: string): string {
  const title = input.title ?? "TimeArcs";
  // Escape </script> sequences in JSON to prevent XSS via early script-tag closure.
  const inputJson = JSON.stringify(input).replace(/<\//g, "<\\/");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body>
<script>window.__TIMEARCS_INPUT__ = ${inputJson};</script>
<script src="${libUrl}"></script>
<script>TimeArcs.mountInBody(window.__TIMEARCS_INPUT__);</script>
</body></html>`;
}
