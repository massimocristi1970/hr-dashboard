export function createLocalDate(year: number, monthIndex: number, day: number): Date {
  return new Date(year, monthIndex, day);
}

export function parseLocalDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return createLocalDate(year, month - 1, day);
}

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = parseLocalDateString(startDate);
  const end = parseLocalDateString(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(formatLocalDate(d));
  }

  return dates;
}

export function isWeekendDate(dateString: string): boolean {
  const date = parseLocalDateString(dateString);
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function calculateWorkingLeaveDays(
  startDate: string,
  endDate: string,
  startHalfDay: 'full' | 'am' | 'pm',
  endHalfDay: 'full' | 'am' | 'pm',
  bankHolidayDates: string[]
): number {
  if (!startDate || !endDate) return 0;

  const holidaySet = new Set(bankHolidayDates);
  const workingDates = getDatesInRange(startDate, endDate).filter(
    (date) => !isWeekendDate(date) && !holidaySet.has(date)
  );

  if (workingDates.length === 0) {
    return 0;
  }

  if (startDate === endDate) {
    return startHalfDay === 'full' ? 1 : 0.5;
  }

  let total = workingDates.length;

  if (workingDates.includes(startDate) && startHalfDay !== 'full') {
    total -= 0.5;
  }

  if (workingDates.includes(endDate) && endHalfDay !== 'full') {
    total -= 0.5;
  }

  return Math.max(0, total);
}

export function getCalendarDaysForMonth(currentDate: Date): (Date | null)[][] {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = createLocalDate(year, month, 1);
  const lastDay = createLocalDate(year, month + 1, 0);

  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  for (let i = 0; i < firstDay.getDay(); i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    currentWeek.push(createLocalDate(year, month, day));

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  while (currentWeek.length > 0 && currentWeek.length < 7) {
    currentWeek.push(null);
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}
