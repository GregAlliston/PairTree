import { describe, expect, it } from "vitest";
import {
  bucketFor,
  daysUntil,
  formatDate,
  nextOccurrence,
  parseDate,
} from "./recurrence";

const utc = (y: number, m: number, d: number) =>
  new Date(Date.UTC(y, m - 1, d));

describe("nextOccurrence", () => {
  it("returns start date for one-offs in the future", () => {
    const from = utc(2026, 4, 1);
    const next = nextOccurrence("2026-05-10", "none", from);
    expect(next && formatDate(next)).toBe("2026-05-10");
  });

  it("returns null for one-offs in the past", () => {
    const from = utc(2026, 4, 1);
    expect(nextOccurrence("2026-03-10", "none", from)).toBeNull();
  });

  it("yearly Feb 29 clamps to Feb 28 in non-leap years", () => {
    const from = utc(2026, 1, 1);
    const next = nextOccurrence("2024-02-29", "yearly", from);
    expect(next && formatDate(next)).toBe("2026-02-28");
  });

  it("yearly Feb 29 uses Feb 29 in the next leap year if from is just past", () => {
    const from = utc(2028, 3, 1);
    const next = nextOccurrence("2024-02-29", "yearly", from);
    expect(next && formatDate(next)).toBe("2029-02-28");
  });

  it("yearly occurrence lands on current year when still upcoming", () => {
    const from = utc(2026, 4, 19);
    const next = nextOccurrence("2020-09-01", "yearly", from);
    expect(next && formatDate(next)).toBe("2026-09-01");
  });

  it("yearly occurrence rolls to next year when already passed", () => {
    const from = utc(2026, 10, 1);
    const next = nextOccurrence("2020-09-01", "yearly", from);
    expect(next && formatDate(next)).toBe("2027-09-01");
  });

  it("monthly Jan 31 clamps to Feb 28 (or 29) then returns Mar 31", () => {
    const feb = nextOccurrence("2026-01-31", "monthly", utc(2026, 2, 1));
    expect(feb && formatDate(feb)).toBe("2026-02-28");
    const mar = nextOccurrence("2026-01-31", "monthly", utc(2026, 3, 1));
    expect(mar && formatDate(mar)).toBe("2026-03-31");
  });

  it("monthly returns today if today matches", () => {
    const today = utc(2026, 4, 19);
    const next = nextOccurrence("2026-04-19", "monthly", today);
    expect(next && formatDate(next)).toBe("2026-04-19");
  });
});

describe("daysUntil", () => {
  it("counts inclusive day diffs", () => {
    expect(daysUntil(utc(2026, 4, 20), utc(2026, 4, 19))).toBe(1);
    expect(daysUntil(utc(2026, 4, 19), utc(2026, 4, 19))).toBe(0);
    expect(daysUntil(utc(2026, 4, 18), utc(2026, 4, 19))).toBe(-1);
  });
});

describe("bucketFor", () => {
  it("classifies into overdue/thisWeek/thisMonth/later", () => {
    expect(bucketFor(-1)).toBe("overdue");
    expect(bucketFor(0)).toBe("thisWeek");
    expect(bucketFor(7)).toBe("thisWeek");
    expect(bucketFor(8)).toBe("thisMonth");
    expect(bucketFor(31)).toBe("thisMonth");
    expect(bucketFor(32)).toBe("later");
  });
});

describe("parseDate", () => {
  it("parses ISO date into UTC midnight", () => {
    const d = parseDate("2026-04-19");
    expect(d.getUTCFullYear()).toBe(2026);
    expect(d.getUTCMonth()).toBe(3);
    expect(d.getUTCDate()).toBe(19);
  });
});
