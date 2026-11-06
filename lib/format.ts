/**
 * Format a USDC amount from integer units (6 decimals) to a human-readable
 * string such as "$1,250.00".  Values under $0.01 are shown as "<$0.01".
 */
export function usdc(units: bigint | number): string {
  const n = typeof units === "bigint" ? units : BigInt(units);
  const divisor = BigInt(1_000_000);
  const whole = n / divisor;
  const frac = n % divisor;
  const cents = Number(frac) / 1_000_000;

  const dollars = Number(whole) + cents;

  if (dollars === 0) return "$0";
  if (dollars < 0.01) return "<$0.01";

  return `$${dollars.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
