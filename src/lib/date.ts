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

/**
 * Parse a free-form plan time (e.g. "6:00 AM", "12:30 PM") into minutes since
 * midnight. Plan `scheduled_time` is unstructured text — it can also hold
 * things like "upon waking", which this returns null for rather than guessing.
 */
export function parseTimeOfDayToMinutes(time: string | null | undefined): number | null {
  if (!time) return null;
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/** Minutes since local midnight for the given moment. */
export function getMinutesSinceMidnight(date: Date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}
