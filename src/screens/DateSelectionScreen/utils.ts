import type { CalendarCell } from './types';

export const MONTHS_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const WEEKDAYS_SHORT_ES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

export const WEEKDAYS_LONG_ES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function isAfterToday(d: Date, today: Date): boolean {
  const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const td = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return dt.getTime() > td.getTime();
}

export function buildCalendarGrid(year: number, month: number): CalendarCell[] {
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: CalendarCell[] = [];
  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    cells.push({ day, currentMonth: false, date: new Date(year, month - 1, day) });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, currentMonth: true, date: new Date(year, month, day) });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay, currentMonth: false, date: new Date(year, month + 1, nextDay) });
    nextDay++;
  }
  return cells;
}

/**
 * Chunks the flat cell list into explicit weeks of 7. Rendering used to rely
 * on flexWrap to break every 7th cell, but that only wraps correctly when
 * the container happens to be exactly 7 cells wide — on a wider phone an
 * 8th cell fit per row, so every row after the first was shifted by one
 * column and taps landed on the wrong date.
 */
export function chunkIntoWeeks(cells: CalendarCell[]): CalendarCell[][] {
  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function isCurrentMonthOrFuture(year: number, month: number, today: Date): boolean {
  return (
    year > today.getFullYear() ||
    (year === today.getFullYear() && month >= today.getMonth())
  );
}

export function navigateMonth(year: number, month: number, delta: number): { year: number; month: number } {
  let m = month + delta;
  let y = year;
  if (m < 0) {
    m = 11;
    y -= 1;
  } else if (m > 11) {
    m = 0;
    y += 1;
  }
  return { year: y, month: m };
}
