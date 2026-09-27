/**
 * Convert a UTC ISO date string into the value expected by an
 * `<input type="datetime-local">` element, expressed in the browser's
 * local timezone.
 *
 * A naive `isoString.slice(0, 16)` treats the UTC wall-clock time as if it
 * were already local time, silently shifting the displayed (and, on save,
 * stored) date by the viewer's UTC offset. This helper instead shifts the
 * Date by its own timezone offset before formatting, so the local
 * components (year/month/day/hour/minute) are produced correctly.
 */
export function toLocalDatetimeInputValue(isoString: string): string {
  const date = new Date(isoString);
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localTime.toISOString().slice(0, 16);
}

/** The wedding happens in the Philippines, so every public date reads in Manila time. */
const TZ = 'Asia/Manila';

/** e.g. "November 28, 2026" */
export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'long', day: 'numeric', year: 'numeric' }).format(
    new Date(iso),
  );
}

/** e.g. "Saturday" */
export function formatWeekday(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'long' }).format(new Date(iso));
}

/** e.g. "3:00 PM" */
export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
}

/** e.g. "2026" */
export function formatYear(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric' }).format(new Date(iso));
}
