import {
  formatDate,
  formatDateShort,
  getRelativeDueDate,
  getDueDateColor,
  computeNextDueDate,
  getCurrentMonthYear,
  getMonthName,
  getTodayISO,
} from '../dates';

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-03-13T12:00:00Z'));
});

afterEach(() => {
  jest.useRealTimers();
});

describe('formatDate', () => {
  it('formats ISO date to readable', () => {
    expect(formatDate('2026-03-13')).toBe('Mar 13, 2026');
  });

  it('formats another date', () => {
    expect(formatDate('2025-12-25')).toBe('Dec 25, 2025');
  });
});

describe('formatDateShort', () => {
  it('formats without year', () => {
    expect(formatDateShort('2026-03-13')).toBe('Mar 13');
  });
});

describe('getRelativeDueDate', () => {
  it('returns Due today', () => {
    expect(getRelativeDueDate('2026-03-13')).toBe('Due today');
  });

  it('returns Due tomorrow', () => {
    expect(getRelativeDueDate('2026-03-14')).toBe('Due tomorrow');
  });

  it('returns overdue days', () => {
    expect(getRelativeDueDate('2026-03-10')).toBe('3d overdue');
  });

  it('returns in N days within a week', () => {
    expect(getRelativeDueDate('2026-03-16')).toBe('in 3 days');
  });

  it('returns in N weeks', () => {
    expect(getRelativeDueDate('2026-03-27')).toBe('in 2 weeks');
  });

  it('returns formatted date for far future', () => {
    expect(getRelativeDueDate('2026-05-15')).toBe('May 15');
  });
});

describe('getDueDateColor', () => {
  it('returns danger red when overdue', () => {
    expect(getDueDateColor('2026-03-10')).toBe('#FF6B6B');
  });

  it('returns warning yellow when within 3 days', () => {
    expect(getDueDateColor('2026-03-15')).toBe('#FDCB6E');
  });

  it('returns muted gray for far dates', () => {
    expect(getDueDateColor('2026-04-01')).toBe('#8E8E9A');
  });
});

describe('computeNextDueDate', () => {
  it('computes monthly — future day this month', () => {
    // Day 20, today is 13th → should be March 20
    expect(computeNextDueDate('monthly', 20)).toBe('2026-03-20');
  });

  it('computes monthly — past day rolls to next month', () => {
    // Day 5, today is 13th → should be April 5
    expect(computeNextDueDate('monthly', 5)).toBe('2026-04-05');
  });

  it('computes weekly', () => {
    // March 13 2026 is a Friday (day 5), dueDay=1 (Monday) → next Monday is March 16
    const result = computeNextDueDate('weekly', 1);
    expect(result).toBe('2026-03-16');
  });

  it('computes yearly — future day', () => {
    // Day 100 of year, today is day 72 → should be in 2026
    const result = computeNextDueDate('yearly', 100);
    expect(result).toMatch(/^2026-/);
  });

  it('computes yearly — past day rolls to next year', () => {
    // Day 1 already passed → 2027
    const result = computeNextDueDate('yearly', 1);
    expect(result).toMatch(/^2027-/);
  });
});

describe('getCurrentMonthYear', () => {
  it('returns current month and year', () => {
    expect(getCurrentMonthYear()).toEqual({ year: 2026, month: 3 });
  });
});

describe('getMonthName', () => {
  it('returns month name', () => {
    expect(getMonthName(1)).toBe('January');
    expect(getMonthName(12)).toBe('December');
  });
});

describe('getTodayISO', () => {
  it('returns ISO formatted today', () => {
    expect(getTodayISO()).toBe('2026-03-13');
  });
});
