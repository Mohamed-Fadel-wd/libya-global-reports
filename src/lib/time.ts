import { DISPLAY_TIMEZONE } from "./schemas";

const dateTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: DISPLAY_TIMEZONE,
  dateStyle: "medium",
  timeStyle: "short",
});

const dateOnly = new Intl.DateTimeFormat("en-GB", {
  timeZone: DISPLAY_TIMEZONE,
  dateStyle: "full",
});

export function parseTime(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(value: string | null | undefined): string {
  const date = parseTime(value);
  if (!date) return "Not reported";
  return `${dateTime.format(date)} ${DISPLAY_TIMEZONE}`;
}

export function formatDate(value: string | null | undefined): string {
  const date = parseTime(value);
  if (!date) return "Not reported";
  return dateOnly.format(date);
}

export function hoursBetween(a: string | null | undefined, b: string | null | undefined): number | null {
  const first = parseTime(a);
  const second = parseTime(b);
  if (!first || !second) return null;
  return Math.abs(first.getTime() - second.getTime()) / 36e5;
}

export function isStale(observedAt: string | null | undefined, now = new Date(), hours = 72): boolean {
  const date = parseTime(observedAt);
  if (!date) return true;
  return now.getTime() - date.getTime() > hours * 36e5;
}

export function maxTimestamp(values: Array<string | null | undefined>): string | null {
  const dates = values.map(parseTime).filter((value): value is Date => Boolean(value));
  if (!dates.length) return null;
  return new Date(Math.max(...dates.map((date) => date.getTime()))).toISOString();
}
