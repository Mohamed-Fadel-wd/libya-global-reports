export function displayValue(value: string | number | null | undefined, fallback = "Not reported"): string {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

export function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}
