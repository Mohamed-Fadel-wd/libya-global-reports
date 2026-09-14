import type { DraftRecord, Source } from "../../src/lib/schemas.ts";
import type { HttpOptions } from "../http.ts";

export type AdapterContext = {
  source: Source;
  options: HttpOptions;
  rootDir: string;
  now: Date;
};

export type AdapterResult = {
  adapter: string;
  sourceId: string;
  drafts: DraftRecord[];
  skipped: string[];
  warnings: string[];
};

export type CollectorAdapter = {
  id: string;
  collect(context: AdapterContext): Promise<AdapterResult>;
};
