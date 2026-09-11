export interface CountdownParts {
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  const originalDay = result.getUTCDate();

  // Move to day 1 first so setUTCMonth cannot roll over into a later month
  // when the target month is shorter than the current day-of-month.
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);

  const daysInTargetMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();

  result.setUTCDate(Math.min(originalDay, daysInTargetMonth));

  return result;
}

export function getCountdownParts(target: Date, now: Date = new Date()): CountdownParts {
  if (target.getTime() <= now.getTime()) {
    return { months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  // Always compute the candidate month boundary from the original `now`
  // (not from a previously-clamped cursor) so clamping a short month (e.g.
  // Jan 31 -> Feb 28) doesn't permanently lose the original day-of-month
  // and cause drift in subsequent months.
  let months = 0;
  while (addMonths(now, months + 1).getTime() <= target.getTime()) {
    months += 1;
  }
  const cursor = addMonths(now, months);

  let remainingSeconds = Math.floor((target.getTime() - cursor.getTime()) / 1000);

  const weeks = Math.floor(remainingSeconds / (7 * 86400));
  remainingSeconds -= weeks * 7 * 86400;

  const days = Math.floor(remainingSeconds / 86400);
  remainingSeconds -= days * 86400;

  const hours = Math.floor(remainingSeconds / 3600);
  remainingSeconds -= hours * 3600;

  const minutes = Math.floor(remainingSeconds / 60);
  remainingSeconds -= minutes * 60;

  const seconds = remainingSeconds;

  return { months, weeks, days, hours, minutes, seconds, isPast: false };
}
