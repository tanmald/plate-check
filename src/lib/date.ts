/**
 * Local-calendar-day helpers.
 *
 * `Date#toISOString()` always renders UTC, so `.split("T")[0]` silently
 * shifts to the wrong day for any user not on UTC. These helpers work in
 * the browser's local timezone instead, matching how users think about
 * "today".
 */

/** YYYY-MM-DD for the given date, in the local timezone. */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string into a local midnight Date.
 * Unlike `new Date(dateStr)`, this never goes through UTC parsing, so it
 * can't shift the date by a day depending on the local offset.
 */
export function parseLocalDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}
