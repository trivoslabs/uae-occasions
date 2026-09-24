/**
 * working-days — UAE government working-day utilities (days only).
 *
 * Models the two published government working-week profiles (federal,
 * Sharjah) and combines them with public-holiday spans from ./index.mjs.
 * Friday half-days, Ramadan reduced hours and private-sector arrangements
 * are out of scope.
 *
 * (c) Trivos Labs FZCO — Apache-2.0
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { publicHolidaysInYear } from "./index.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEEKS = JSON.parse(
  readFileSync(join(__dirname, "..", "data", "working-weeks.json"), "utf8")
);

const DAY_MS = 86400000;

function utc(y, m, d) {
  return new Date(Date.UTC(y, m - 1, d));
}

function getProfile(profile) {
  const p = WEEKS.profiles[profile];
  if (!p) throw new Error(`Unknown working-week profile: ${profile}`);
  return p;
}

/** Whether a date falls on a profile's weekend. */
export function isWeekend(date, { profile = "federal" } = {}) {
  const p = getProfile(profile);
  return p.weekendDays.includes(date.getUTCDay());
}

/** Find the holiday span (if any) covering a UTC calendar date, for a given year's holidays. */
function holidaySpanFor(date, holidaysByYear) {
  const holidays = holidaysByYear(date.getUTCFullYear());
  return holidays.find((e) => date >= e.date && date <= e.endDate) ?? null;
}

/** Whether a date is a working day: not a weekend and not inside a public-holiday span. */
export function isWorkingDay(date, { profile = "federal" } = {}) {
  getProfile(profile);
  if (isWeekend(date, { profile })) return false;
  const d = utc(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
  const cache = new Map();
  const holidaysByYear = (year) => {
    if (!cache.has(year)) cache.set(year, publicHolidaysInYear(year));
    return cache.get(year);
  };
  return holidaySpanFor(d, holidaysByYear) === null;
}

/** Advance one UTC calendar day at a time, tracking whether any skipped holiday span is an estimate. */
function walkForward(from, steps, profile) {
  getProfile(profile);
  const cache = new Map();
  const holidaysByYear = (year) => {
    if (!cache.has(year)) cache.set(year, publicHolidaysInYear(year));
    return cache.get(year);
  };

  let d = utc(from.getUTCFullYear(), from.getUTCMonth() + 1, from.getUTCDate());
  let estimate = false;
  let found = 0;

  while (found < steps) {
    d = new Date(d.getTime() + DAY_MS);
    if (isWeekend(d, { profile })) continue;
    const span = holidaySpanFor(d, holidaysByYear);
    if (span) {
      if (span.estimate) estimate = true;
      continue;
    }
    found++;
  }

  return { date: d, estimate };
}

/** The first working day strictly after `from`. */
export function nextWorkingDay(from = new Date(), { profile = "federal" } = {}) {
  return walkForward(from, 1, profile);
}

/** The date n working days after `from` (n must be a positive integer). */
export function addWorkingDays(from, n, { profile = "federal" } = {}) {
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error("addWorkingDays: n must be a positive integer");
  }
  return walkForward(from, n, profile);
}

/** The raw working-week profile definitions. */
export function workingWeekProfiles() {
  return WEEKS.profiles;
}
