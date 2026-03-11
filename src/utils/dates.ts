import { format, differenceInDays, addMonths, addWeeks, addYears, parseISO, isToday, isTomorrow } from 'date-fns';

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'MMM d, yyyy');
}

export function formatDateShort(dateString: string): string {
  return format(parseISO(dateString), 'MMM d');
}

export function getRelativeDueDate(dateString: string): string {
  const date = parseISO(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isToday(date)) return 'Due today';
  if (isTomorrow(date)) return 'Due tomorrow';

  const days = differenceInDays(date, today);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days <= 7) return `in ${days} days`;
  if (days <= 30) return `in ${Math.ceil(days / 7)} weeks`;
  return formatDateShort(dateString);
}

export function getDueDateColor(dateString: string): string {
  const date = parseISO(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = differenceInDays(date, today);
  if (days < 0) return '#FF6B6B';   // overdue - danger
  if (days <= 3) return '#FDCB6E';   // soon - warning
  return '#8E8E9A';                   // normal - muted
}

export function computeNextDueDate(frequency: 'weekly' | 'monthly' | 'yearly', dueDay: number): string {
  const today = new Date();
  let nextDate: Date;

  switch (frequency) {
    case 'weekly': {
      const currentDay = today.getDay();
      const daysUntil = (dueDay - currentDay + 7) % 7 || 7;
      nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysUntil);
      break;
    }
    case 'monthly': {
      nextDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
      if (nextDate <= today) {
        nextDate = addMonths(nextDate, 1);
      }
      break;
    }
    case 'yearly': {
      nextDate = new Date(today.getFullYear(), 0, dueDay);
      if (nextDate <= today) {
        nextDate = addYears(nextDate, 1);
      }
      break;
    }
  }

  return format(nextDate, 'yyyy-MM-dd');
}

export function getCurrentMonthYear(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function getMonthName(month: number): string {
  return format(new Date(2024, month - 1), 'MMMM');
}

export function getTodayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
