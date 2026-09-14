import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadBoardFromFs } from "../src/lib/load-fs.ts";
import { evaluateDemoGate } from "../src/lib/demo-gate.ts";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const board = await loadBoardFromFs(rootDir);
const gate = evaluateDemoGate(board.allArticles);
console.log(`Validated ${board.allArticles.length} article files.`);
console.log(`Published on site: ${board.articles.length} (demo included: ${board.demoActive}).`);
console.log(`RSS-eligible (approved, non-demo): ${board.rssItems.length}.`);
console.log(`Sources: ${board.sources.length}; observations: ${board.observations.length}.`);
console.log(`Demo-off gate: ${gate.reason}`);
if (!board.settings.showDemoContent && !gate.demoOffReady) {
  throw new Error(`Refusing a non-demo build: ${gate.reason}`);
}
