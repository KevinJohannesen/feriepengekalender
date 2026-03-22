import Holidays from 'date-holidays'

export interface Holiday {
  date: Date
  name: string
}

export function getNorwegianHolidays(year: number): Holiday[] {
  const hd = new Holidays('NO')
  return hd
    .getHolidays(year)
    .filter((h) => h.type === 'public')
    .map((h) => ({
      date: new Date(h.date.split(' ')[0]),
      name: h.name,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

// Check if a date is a holiday
export function isHoliday(date: Date, holidays: Holiday[]): Holiday | null {
  return (
    holidays.find(
      (h) =>
        h.date.getDate() === date.getDate() &&
        h.date.getMonth() === date.getMonth() &&
        h.date.getFullYear() === date.getFullYear()
    ) || null
  )
}

// Check if a date is a weekend
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

// Check if a date is a weekday (not weekend)
export function isWeekday(date: Date): boolean {
  return !isWeekend(date)
}

// Get all dates in a month
export function getDatesInMonth(year: number, month: number): Date[] {
  const dates: Date[] = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d))
  }

  return dates
}

// Calculate working days in a month
export function getWorkingDaysInMonth(
  year: number,
  month: number,
  holidays: Holiday[]
): { workingDays: number; holidaysOnWeekdays: number } {
  const dates = getDatesInMonth(year, month)
  let workingDays = 0
  let holidaysOnWeekdays = 0

  for (const date of dates) {
    if (isWeekday(date)) {
      if (isHoliday(date, holidays)) {
        holidaysOnWeekdays++
      } else {
        workingDays++
      }
    }
  }

  return { workingDays, holidaysOnWeekdays }
}

// Calculate total working days in a year
export function getWorkingDaysInYear(
  year: number,
  holidays: Holiday[]
): { totalWorkingDays: number; totalHolidaysOnWeekdays: number } {
  let totalWorkingDays = 0
  let totalHolidaysOnWeekdays = 0

  for (let month = 0; month < 12; month++) {
    const { workingDays, holidaysOnWeekdays } = getWorkingDaysInMonth(
      year,
      month,
      holidays
    )
    totalWorkingDays += workingDays
    totalHolidaysOnWeekdays += holidaysOnWeekdays
  }

  return { totalWorkingDays, totalHolidaysOnWeekdays }
}

// Norwegian month names
export const MONTH_NAMES = [
  'Januar',
  'Februar',
  'Mars',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Desember',
]

// Norwegian day names (short)
export const DAY_NAMES_SHORT = ['Ma', 'Ti', 'On', 'To', 'Fr', 'Lø', 'Sø']
