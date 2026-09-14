import type { CollectorAdapter } from "./types.ts";

/**
 * ReliefWeb API v2 adapter — disabled until a pre-approved appname is issued.
 * As of November 2025 ReliefWeb requires a registered appname; unregistered
 * requests return HTTP 403. Request an appname from ReliefWeb before enabling.
 */
export const reliefwebApiAdapter: CollectorAdapter = {
  id: "reliefweb-api",
  async collect(context) {
    const appname = process.env.LGR_RELIEFWEB_APPNAME;
    if (!appname) {
      return {
        adapter: this.id,
        sourceId: context.source.id,
        drafts: [],
        skipped: ["ReliefWeb API adapter is disabled until LGR_RELIEFWEB_APPNAME is a pre-approved appname."],
        warnings: [],
      };
    }
    return {
      adapter: this.id,
      sourceId: context.source.id,
      drafts: [],
      skipped: ["Adapter skeleton only. Do not enable until the appname is approved and a Libya filter is verified."],
      warnings: [],
    };
  },
};
