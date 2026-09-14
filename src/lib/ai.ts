/**
 * Optional AI drafting interface. Disabled by default.
 * Never import this from client-side code. Never put API keys in the browser bundle.
 * Drafts produced here must stay unpublished until an editor reviews them.
 */

export type AiTask = "translate" | "summarize";

export type AiRequest = {
  task: AiTask;
  text: string;
  targetLocale?: string;
};

export type AiResult =
  | { ok: true; text: string; cached: boolean; note: string }
  | { ok: false; reason: string };

export type AiConfig = {
  enabled: boolean;
  apiKeyPresent: boolean;
  monthlyBudgetUsd: number;
  reserveUsd: number;
  maxRequestsPerDay: number;
};

const cache = new Map<string, string>();
let requestsToday = 0;
let requestsDay = "";

export function getAiConfig(): AiConfig {
  return {
    enabled: process.env.LGR_AI_ENABLED === "true",
    apiKeyPresent: Boolean(process.env.LGR_AI_API_KEY),
    monthlyBudgetUsd: Number(process.env.LGR_AI_MONTHLY_BUDGET_USD || 10),
    reserveUsd: Number(process.env.LGR_AI_RESERVE_USD || 5),
    maxRequestsPerDay: Number(process.env.LGR_AI_MAX_REQUESTS_PER_DAY || 20),
  };
}

function dayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export function spendingGuardAllows(config: AiConfig): { ok: true } | { ok: false; reason: string } {
  if (!config.enabled) return { ok: false, reason: "AI is disabled." };
  if (!config.apiKeyPresent) return { ok: false, reason: "No server-side API key is configured." };
  if (config.monthlyBudgetUsd > 10) {
    return { ok: false, reason: "Configured AI budget exceeds the $10 monthly allowance." };
  }
  const today = dayStamp();
  if (requestsDay !== today) {
    requestsDay = today;
    requestsToday = 0;
  }
  if (requestsToday >= config.maxRequestsPerDay) {
    return { ok: false, reason: "Daily AI request limit reached." };
  }
  return { ok: true };
}

export async function maybeDraftWithAi(request: AiRequest): Promise<AiResult> {
  const config = getAiConfig();
  const guard = spendingGuardAllows(config);
  if (!guard.ok) return { ok: false, reason: guard.reason };

  const cacheKey = `${request.task}:${request.targetLocale ?? ""}:${request.text}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return {
      ok: true,
      text: cached,
      cached: true,
      note: "Cached draft. This is unpublished until an editor reviews it. Budget figures are request-limit estimates, not provider-verified costs.",
    };
  }

  return {
    ok: false,
    reason:
      "No AI provider is wired in this MVP. Enablement flags, caching and request limits exist so a future server-side integration can be added without changing the public site.",
  };
}

export function resetAiCountersForTests(): void {
  cache.clear();
  requestsToday = 0;
  requestsDay = "";
}
