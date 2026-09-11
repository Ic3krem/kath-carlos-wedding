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
