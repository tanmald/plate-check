import { describe, expect, it } from "vitest";
import {
  addDaysIso,
  buildWeekColumns,
  daysBetweenIso,
  mondayOnOrBefore,
  nextDayIso,
} from "./challenge-dates";

describe("daysBetweenIso", () => {
  it("counts whole days forward", () => {
    expect(daysBetweenIso("2026-08-01", "2026-08-04")).toBe(3);
  });

  it("returns 0 for the same day", () => {
    expect(daysBetweenIso("2026-08-01", "2026-08-01")).toBe(0);
  });

  it("goes negative when the end precedes the start", () => {
    expect(daysBetweenIso("2026-08-04", "2026-08-01")).toBe(-3);
  });

  it("crosses month and year boundaries", () => {
    expect(daysBetweenIso("2026-01-31", "2026-02-01")).toBe(1);
    expect(daysBetweenIso("2026-12-31", "2027-01-01")).toBe(1);
  });

  it("accounts for leap days", () => {
    expect(daysBetweenIso("2028-02-28", "2028-03-01")).toBe(2);
    expect(daysBetweenIso("2026-02-28", "2026-03-01")).toBe(1);
  });

  // Europe/Lisbon springs forward on 2026-03-29 — a local-midnight
  // implementation would return 0 here from a 23-hour day.
  it("is unaffected by daylight-saving transitions", () => {
    expect(daysBetweenIso("2026-03-28", "2026-03-29")).toBe(1);
    expect(daysBetweenIso("2026-10-24", "2026-10-25")).toBe(1);
    expect(daysBetweenIso("2026-03-01", "2026-11-01")).toBe(245);
  });
});

describe("addDaysIso", () => {
  it("adds and subtracts days", () => {
    expect(addDaysIso("2026-08-01", 3)).toBe("2026-08-04");
    expect(addDaysIso("2026-08-04", -3)).toBe("2026-08-01");
    expect(addDaysIso("2026-08-01", 0)).toBe("2026-08-01");
  });

  it("rolls over month and year boundaries", () => {
    expect(addDaysIso("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDaysIso("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysIso("2027-01-01", -1)).toBe("2026-12-31");
  });

  it("spans a full 75-day challenge", () => {
    expect(addDaysIso("2026-08-02", 74)).toBe("2026-10-15");
  });

  it("round-trips with daysBetweenIso", () => {
    expect(daysBetweenIso("2026-08-02", addDaysIso("2026-08-02", 74))).toBe(74);
  });
});

describe("nextDayIso", () => {
  it("returns the start of the following day as a full timestamp", () => {
    expect(nextDayIso("2026-08-01")).toBe("2026-08-02T00:00:00.000Z");
  });

  it("rolls over a year boundary", () => {
    expect(nextDayIso("2026-12-31")).toBe("2027-01-01T00:00:00.000Z");
  });
});

describe("mondayOnOrBefore", () => {
  it("returns the same date when it is already a Monday", () => {
    // 2026-08-03 is a Monday.
    expect(mondayOnOrBefore("2026-08-03")).toBe("2026-08-03");
  });

  it("walks back to Monday from mid-week", () => {
    expect(mondayOnOrBefore("2026-08-05")).toBe("2026-08-03"); // Wednesday
    expect(mondayOnOrBefore("2026-08-08")).toBe("2026-08-03"); // Saturday
  });

  it("treats Sunday as the end of its week, not the start", () => {
    // 2026-08-09 is a Sunday — it belongs to the week beginning 08-03.
    expect(mondayOnOrBefore("2026-08-09")).toBe("2026-08-03");
  });

  it("crosses a month boundary", () => {
    // 2026-08-02 is a Sunday, so its week starts in July.
    expect(mondayOnOrBefore("2026-08-02")).toBe("2026-07-27");
  });
});

describe("buildWeekColumns", () => {
  it("returns seven rows per column", () => {
    const columns = buildWeekColumns("2026-08-03", "2026-10-16");
    expect(columns.every((column) => column.length === 7)).toBe(true);
  });

  it("front-pads with nulls so weekday rows stay aligned", () => {
    // 2026-08-05 is a Wednesday: Mon and Tue of that week are outside the range.
    const [firstColumn] = buildWeekColumns("2026-08-05", "2026-08-09");
    expect(firstColumn).toEqual([
      null,
      null,
      "2026-08-05",
      "2026-08-06",
      "2026-08-07",
      "2026-08-08",
      "2026-08-09",
    ]);
  });

  it("back-pads the final column with nulls", () => {
    // Ends Wednesday 2026-08-05, so Thu–Sun are padding.
    const columns = buildWeekColumns("2026-08-03", "2026-08-05");
    expect(columns).toHaveLength(1);
    expect(columns[0]).toEqual([
      "2026-08-03",
      "2026-08-04",
      "2026-08-05",
      null,
      null,
      null,
      null,
    ]);
  });

  it("covers every day in the range exactly once, in order", () => {
    const start = "2026-08-02";
    const end = addDaysIso(start, 74); // a full 75-day challenge
    const dates = buildWeekColumns(start, end).flat().filter((d): d is string => d !== null);

    expect(dates).toHaveLength(75);
    expect(dates[0]).toBe(start);
    expect(dates[74]).toBe(end);
    expect(new Set(dates).size).toBe(75);
    expect([...dates].sort()).toEqual(dates);
  });

  it("spans 12 columns for a 75-day challenge starting on a Sunday", () => {
    // 2026-08-02 is a Sunday, so week one contributes a single day.
    expect(buildWeekColumns("2026-08-02", addDaysIso("2026-08-02", 74))).toHaveLength(12);
  });

  it("handles a single-day range", () => {
    const columns = buildWeekColumns("2026-08-05", "2026-08-05");
    expect(columns).toHaveLength(1);
    expect(columns[0].filter(Boolean)).toEqual(["2026-08-05"]);
  });

  it("returns nothing when the end precedes the start", () => {
    expect(buildWeekColumns("2026-08-05", "2026-08-01")).toEqual([]);
  });
});
