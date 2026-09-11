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
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

export function getCountdownParts(target: Date, now: Date = new Date()): CountdownParts {
  if (target.getTime() <= now.getTime()) {
    return { months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  let months = 0;
  let cursor = new Date(now.getTime());
  while (addMonths(cursor, 1).getTime() <= target.getTime()) {
    cursor = addMonths(cursor, 1);
    months += 1;
  }

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
