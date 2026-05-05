/**
 * Shared formatting utilities for telemetry values
 */

export function formatValue(
  value: number | null | undefined,
  unit: string,
  decimals = 2,
): string {
  if (value === null || value === undefined) return "-";
  return `${value.toFixed(decimals)} ${unit}`.trim();
}
