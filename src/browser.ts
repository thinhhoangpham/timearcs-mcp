import { renderTimeArcsHtml } from "./core/render-html.js";
import { SOURCES as browserSources } from "./core/sources-browser.js";
import type { RenderInput } from "./core/types.js";

export function mount(container: HTMLElement, input: RenderInput): void {
  const html = renderTimeArcsHtml(input, browserSources);
  const iframe = document.createElement("iframe");
  iframe.srcdoc = html;
  iframe.style.cssText = "border:0;width:100%;height:100%;display:block";
  container.appendChild(iframe);
}

export function mountInBody(input: RenderInput): void {
  const html = renderTimeArcsHtml(input, browserSources);
  document.documentElement.innerHTML = html;
}

export type { RenderInput };
