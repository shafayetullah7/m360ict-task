function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function daysBetweenInclusive(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1;
}

export function countRentalDays(startDate: string, endDate: string): number {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  return daysBetweenInclusive(start, end);
}

export function datesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart <= bEnd && aEnd >= bStart;
}

export function daysInMonth(
  startDate: string,
  endDate: string,
  year: number,
  month: number,
): number {
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const clipStart = startDate > monthStart ? startDate : monthStart;
  const clipEnd = endDate < monthEnd ? endDate : monthEnd;

  if (clipStart > clipEnd) {
    return 0;
  }

  return countRentalDays(clipStart, clipEnd);
}
