import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
// dist/core/sources-node.js lives at dist/core/; repo root is two levels up
const SRC_ROOT = join(__dirname, "..", "..", "TimeArcs-master", "Text");

async function readSrc(rel: string): Promise<string> {
  return readFile(join(SRC_ROOT, rel), "utf8");
}

export type Sources = {
  fisheye: string;
  util: string;
  slider: string;
  stream: string;
  stopList: string;
  mainRaw: string;
};

export const SOURCES: Sources = {
  fisheye: await readSrc("javascripts/fisheye.js"),
  util: await readSrc("myscripts/util.js"),
  slider: await readSrc("myscripts/sliderRelationship.js"),
  stream: await readSrc("myscripts/streamGraph.js"),
  stopList: await readSrc("myscripts/stopList.js"),
  mainRaw: await readSrc("myscripts/main.js"),
};
