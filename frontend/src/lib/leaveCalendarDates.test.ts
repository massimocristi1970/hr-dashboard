import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateWorkingLeaveDays,
  createLocalDate,
  formatLocalDate,
  getCalendarDaysForMonth,
  getDatesInRange,
} from './leaveCalendarDates.ts';

test('February 2026 ends on the 28th and March 1 2026 is Sunday', () => {
  const lastDayOfFebruary = createLocalDate(2026, 2, 0);
  const firstDayOfMarch = createLocalDate(2026, 2, 1);

  assert.equal(formatLocalDate(lastDayOfFebruary), '2026-02-28');
  assert.equal(firstDayOfMarch.getDay(), 0);
});

test('March 2026 calendar starts on Sunday in the first column', () => {
  const weeks = getCalendarDaysForMonth(createLocalDate(2026, 2, 1));

  assert.equal(weeks[0][0] ? formatLocalDate(weeks[0][0]) : null, '2026-03-01');
  assert.equal(weeks[0][1] ? formatLocalDate(weeks[0][1]) : null, '2026-03-02');
});

test('date ranges do not invent February 29 in 2026', () => {
  assert.deepEqual(
    getDatesInRange('2026-02-27', '2026-03-02'),
    ['2026-02-27', '2026-02-28', '2026-03-01', '2026-03-02']
  );
});

test('working-day calculation skips weekends', () => {
  assert.equal(
    calculateWorkingLeaveDays('2026-03-26', '2026-03-31', 'full', 'full', []),
    4
  );
});

test('working-day calculation skips bank holidays', () => {
  assert.equal(
    calculateWorkingLeaveDays('2026-12-24', '2026-12-29', 'full', 'full', ['2026-12-25', '2026-12-28']),
    2
  );
});

test('half-day calculation only applies to counted working days', () => {
  assert.equal(
    calculateWorkingLeaveDays('2026-03-27', '2026-03-30', 'pm', 'pm', []),
    1
  );
});
