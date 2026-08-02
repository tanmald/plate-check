/**
 * Calendar-date arithmetic for challenges, on plain `YYYY-MM-DD` strings.
 *
 * Everything here anchors to UTC midnight deliberately. A challenge day is a
 * *local calendar day* in the enrollment's timezone (resolved once, by
 * `localDateString`), and from that point on it's just a date label — doing
 * further arithmetic through local `Date` methods is what makes helpers like
 * `getWeekStartDate` drift by a day for users behind UTC.
 */

const MS_PER_DAY = 86_400_000;

function toUtcDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

function toIso(date: Date): string {
  return date.toISOString().split("T")[0];
}

/** Whole days from `startDate` to `endDate` (negative if end precedes start). */
export function daysBetweenIso(startDate: string, endDate: string): number {
  return Math.round((toUtcDate(endDate).getTime() - toUtcDate(startDate).getTime()) / MS_PER_DAY);
}

export function addDaysIso(iso: string, days: number): string {
  const d = toUtcDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toIso(d);
}

/** Start of the next day, as a full ISO timestamp — an exclusive upper bound for same-day queries. */
export function nextDayIso(iso: string): string {
  const d = toUtcDate(iso);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}

/** The Monday on or before `iso`. Weeks start Monday, matching `getWeekStartDate`. */
export function mondayOnOrBefore(iso: string): string {
  const d = toUtcDate(iso);
  const weekday = d.getUTCDay(); // 0 = Sunday
  const shift = weekday === 0 ? -6 : 1 - weekday;
  return addDaysIso(iso, shift);
}

/**
 * Lays `startIso..endIso` out as GitHub-contributions-style columns: one
 * column per week, seven rows per column (Monday first). Days outside the
 * range are `null` so callers can render them as blank spacers rather than
 * shifting the weekday rows out of alignment.
 */
export function buildWeekColumns(startIso: string, endIso: string): (string | null)[][] {
  if (daysBetweenIso(startIso, endIso) < 0) return [];

  const gridStart = mondayOnOrBefore(startIso);
  const totalCells = Math.ceil((daysBetweenIso(gridStart, endIso) + 1) / 7) * 7;

  const columns: (string | null)[][] = [];
  for (let cell = 0; cell < totalCells; cell++) {
    const iso = addDaysIso(gridStart, cell);
    const inRange = daysBetweenIso(startIso, iso) >= 0 && daysBetweenIso(iso, endIso) >= 0;

    if (cell % 7 === 0) columns.push([]);
    columns[columns.length - 1].push(inRange ? iso : null);
  }

  return columns;
}
