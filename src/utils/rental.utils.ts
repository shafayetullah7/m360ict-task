export function calculateTotalAmount(dailyRate: number, days: number): number {
  return Math.round(dailyRate * days * 100) / 100;
}
