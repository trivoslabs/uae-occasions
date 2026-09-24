/**
 * uae-occasions — UAE public holidays, national observances and
 * international days, with Hijri support via the built-in
 * Intl Umm al-Qura calendar. Zero dependencies.
 *
 * Hijri-rule dates are estimates. The UAE Cabinet announcement is
 * always authoritative; entries carry `subjectToAnnouncement: true`.
 *
 * (c) Trivos Labs FZCO — Apache-2.0
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = JSON.parse(
  readFileSync(join(__dirname, "..", "data", "occasions.json"), "utf8")
);

const HIJRI_FMT = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  timeZone: "Asia/Dubai",
});

const HIJRI_MONTHS_AR = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
  "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة",
];

const HIJRI_MONTHS_EN = [
  "Muharram", "Safar", "Rabi Al Awwal", "Rabi Al Thani", "Jumada Al Awwal",
  "Jumada Al Thani", "Rajab", "Shaban", "Ramadan", "Shawwal",
  "Dhu Al Qadah", "Dhu Al Hijjah",
];

/** Convert a Gregorian Date to its Umm al-Qura Hijri date. */
export function toHijri(date) {
  const parts = Object.fromEntries(
    HIJRI_FMT.formatToParts(date).map((p) => [p.type, p.value])
  );
  const month = Number(parts.month);
  return {
    year: Number(parts.year),
    month,
    day: Number(parts.day),
    monthName: { en: HIJRI_MONTHS_EN[month - 1], ar: HIJRI_MONTHS_AR[month - 1] },
  };
}

/** UTC date helper (all resolved dates are calendar dates at UTC midnight). */
function utc(y, m, d) {
  return new Date(Date.UTC(y, m - 1, d));
}

/** Find the Gregorian date(s) in a Gregorian year matching a Hijri month/day. */
function resolveHijriRule(rule, gregorianYear) {
  const matches = [];
  const start = utc(gregorianYear, 1, 1);
  for (let i = 0; i < 366; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    if (d.getUTCFullYear() !== gregorianYear) break;
    const h = toHijri(d);
    if (h.month === rule.month && h.day === rule.day) matches.push(d);
  }
  return matches; // a Hijri date can occur twice in one Gregorian year
}

function resolveNthWeekdayRule(rule, year) {
  const first = utc(year, rule.month, 1);
  const offset = (rule.weekday - first.getUTCDay() + 7) % 7;
  return [utc(year, rule.month, 1 + offset + (rule.nth - 1) * 7)];
}

function resolveRule(rule, year) {
  switch (rule.kind) {
    case "gregorian":
      return [utc(year, rule.month, rule.day)];
    case "hijri":
      return resolveHijriRule(rule, year);
    case "nth-weekday":
      return resolveNthWeekdayRule(rule, year);
    default:
      throw new Error(`Unknown rule kind: ${rule.kind}`);
  }
}

function toEntry(occasion, startDate) {
  const durationDays = occasion.rule.durationDays ?? 1;
  const endDate = new Date(startDate.getTime() + (durationDays - 1) * 86400000);
  return {
    id: occasion.id,
    name: occasion.name,
    type: occasion.type,
    authority: occasion.authority,
    official: occasion.official,
    date: startDate,
    endDate,
    durationDays,
    estimate: occasion.rule.subjectToAnnouncement === true,
    notes: occasion.notes,
  };
}

/**
 * All occasions in a Gregorian year, resolved to dates, sorted.
 * options.types — array to filter, e.g. ["public-holiday"].
 */
export function occasionsInYear(year, options = {}) {
  const entries = [];
  for (const occasion of DATA.occasions) {
    if (options.types && !options.types.includes(occasion.type)) continue;
    for (const startDate of resolveRule(occasion.rule, year)) {
      entries.push(toEntry(occasion, startDate));
    }
  }
  return entries.sort((a, b) => a.date - b.date);
}

/** UAE public holidays only, for a Gregorian year. */
export function publicHolidaysInYear(year) {
  return occasionsInYear(year, { types: ["public-holiday"] });
}

/** The next occasion on or after a date (defaults to today, Dubai time). */
export function nextOccasion(from = new Date(), options = {}) {
  const f = utc(from.getUTCFullYear(), from.getUTCMonth() + 1, from.getUTCDate());
  const thisYear = occasionsInYear(f.getUTCFullYear(), options);
  const nextYear = occasionsInYear(f.getUTCFullYear() + 1, options);
  return [...thisYear, ...nextYear].find((e) => e.endDate >= f) ?? null;
}

/** Whether a date falls inside any UAE public holiday (estimate for Hijri-rule holidays). */
export function isPublicHoliday(date) {
  const d = utc(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
  return publicHolidaysInYear(d.getUTCFullYear()).some(
    (e) => d >= e.date && d <= e.endDate
  );
}

/** The raw occasion definitions (rules, not resolved dates). */
export function allOccasions() {
  return DATA.occasions;
}

export * from "./working-days.mjs";
