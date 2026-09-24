import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isWeekend,
  isWorkingDay,
  nextWorkingDay,
  addWorkingDays,
  workingWeekProfiles,
  publicHolidaysInYear,
} from "../src/index.mjs";

test("Saturday 3 Oct 2026 is a weekend/non-working day (federal)", () => {
  const d = new Date(Date.UTC(2026, 9, 3));
  assert.equal(isWeekend(d), true);
  assert.equal(isWorkingDay(d), false);
});

test("Friday 2 Oct 2026 is a working day under federal but not under sharjah", () => {
  const d = new Date(Date.UTC(2026, 9, 2));
  assert.equal(isWorkingDay(d, { profile: "federal" }), true);
  assert.equal(isWorkingDay(d, { profile: "sharjah" }), false);
});

test("Wed 2 Dec 2026 (National Day) is not a working day on either profile", () => {
  const d = new Date(Date.UTC(2026, 11, 2));
  assert.equal(isWorkingDay(d, { profile: "federal" }), false);
  assert.equal(isWorkingDay(d, { profile: "sharjah" }), false);
});

test("nextWorkingDay from Tue 1 Dec 2026 (federal) rolls to Fri 4 Dec 2026, not an estimate", () => {
  const from = new Date(Date.UTC(2026, 11, 1));
  const next = nextWorkingDay(from, { profile: "federal" });
  assert.equal(next.date.toISOString().slice(0, 10), "2026-12-04");
  assert.equal(next.estimate, false);
});

test("addWorkingDays across the 2027 Eid Al Fitr span is flagged as an estimate", () => {
  const eid = publicHolidaysInYear(2027).find((e) => e.id === "eid-al-fitr");
  assert.ok(eid, "Eid Al Fitr should resolve in 2027");
  const from = new Date(eid.date.getTime() - 3 * 86400000);
  const result = addWorkingDays(from, 5, { profile: "federal" });
  assert.equal(result.estimate, true);
});

test("addWorkingDays rejects zero, negative and non-integer n", () => {
  const from = new Date(Date.UTC(2026, 9, 1));
  assert.throws(() => addWorkingDays(from, 0));
  assert.throws(() => addWorkingDays(from, -1));
  assert.throws(() => addWorkingDays(from, 1.5));
});

test("unknown profile throws", () => {
  const d = new Date(Date.UTC(2026, 9, 1));
  assert.throws(() => isWorkingDay(d, { profile: "dubai-private" }));
  assert.throws(() => nextWorkingDay(d, { profile: "dubai-private" }));
});

test("workingWeekProfiles exposes federal and sharjah with weekendDays", () => {
  const profiles = workingWeekProfiles();
  assert.deepEqual(profiles.federal.weekendDays, [6, 0]);
  assert.deepEqual(profiles.sharjah.weekendDays, [5, 6, 0]);
});
