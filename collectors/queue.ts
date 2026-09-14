import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DraftRecordSchema, type DraftRecord } from "../src/lib/schemas.ts";

export async function readQueue(queueDir: string): Promise<DraftRecord[]> {
  try {
    const names = (await readdir(queueDir)).filter((name) => name.endsWith(".json"));
    const records: DraftRecord[] = [];
    for (const name of names) {
      const raw = JSON.parse(await readFile(path.join(queueDir, name), "utf8"));
      records.push(DraftRecordSchema.parse(raw));
    }
    return records;
  } catch {
    return [];
  }
}

export async function writeDrafts(queueDir: string, records: DraftRecord[]): Promise<void> {
  await mkdir(queueDir, { recursive: true });
  for (const record of records) {
    const file = path.join(queueDir, `${safeFileName(record.id)}.json`);
    await writeFile(file, `${JSON.stringify(record, null, 2)}\n`, "utf8");
  }
}

function safeFileName(id: string): string {
  return id.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 120);
}
