import { test } from "node:test";
import assert from "node:assert/strict";
import {
  toHijri,
  occasionsInYear,
  publicHolidaysInYear,
  nextOccasion,
  isPublicHoliday,
  allOccasions,
} from "../src/index.mjs";

test("toHijri converts a known date", () => {
  // 2 Dec 2026 — well inside Jumada Al Thani 1448 per Umm al-Qura
  const h = toHijri(new Date(Date.UTC(2026, 11, 2)));
  assert.equal(h.year, 1448);
  assert.ok(h.month >= 1 && h.month <= 12);
  assert.ok(h.monthName.ar.length > 0);
});

test("fixed-date holidays resolve", () => {
  const year = occasionsInYear(2026);
  const nationalDay = year.find((e) => e.id === "national-day");
  assert.equal(nationalDay.date.toISOString().slice(0, 10), "2026-12-02");
  assert.equal(nationalDay.durationDays, 2);
  assert.equal(nationalDay.endDate.toISOString().slice(0, 10), "2026-12-03");
});

test("hijri-rule holidays resolve and are flagged as estimates", () => {
  const holidays = publicHolidaysInYear(2026);
  const eidAlFitr = holidays.find((e) => e.id === "eid-al-fitr");
  assert.ok(eidAlFitr, "Eid Al Fitr should fall in 2026");
  assert.equal(eidAlFitr.estimate, true);
  assert.equal(eidAlFitr.date.getUTCMonth(), 2, "Eid Al Fitr 2026 expected in March");
});

test("nth-weekday rule: Safer Internet Day 2027 is Tue 9 Feb", () => {
  const day = occasionsInYear(2027).find((e) => e.id === "safer-internet-day");
  assert.equal(day.date.toISOString().slice(0, 10), "2027-02-09");
  assert.equal(day.date.getUTCDay(), 2);
});

test("results are sorted by date", () => {
  const year = occasionsInYear(2026);
  for (let i = 1; i < year.length; i++) {
    assert.ok(year[i].date >= year[i - 1].date);
  }
});

test("nextOccasion finds something and rolls into next year", () => {
  const next = nextOccasion(new Date(Date.UTC(2026, 11, 26)));
  assert.ok(next);
  assert.ok(next.date >= new Date(Date.UTC(2026, 11, 26)));
});

test("isPublicHoliday true on National Day, false on an ordinary day", () => {
  assert.equal(isPublicHoliday(new Date(Date.UTC(2026, 11, 2))), true);
  assert.equal(isPublicHoliday(new Date(Date.UTC(2026, 9, 20))), false);
});

test("every occasion has bilingual names", () => {
  for (const o of allOccasions()) {
    assert.ok(o.name.en.length > 0, `${o.id} missing English name`);
    assert.ok(o.name.ar.length > 0, `${o.id} missing Arabic name`);
  }
});
