import path from "node:path";
import { fileURLToPath } from "node:url";
import { runCollection } from "./run.ts";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const adapterFlag = args.find((arg) => arg.startsWith("--adapter="))?.slice("--adapter=".length);
const adapterList = adapterFlag
  ? adapterFlag.split(",")
  : args.includes("--fixture")
    ? ["fixture-reliefweb"]
    : undefined;

runCollection(rootDir, adapterList).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
