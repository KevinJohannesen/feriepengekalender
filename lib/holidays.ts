// Norwegian holidays calculation

export interface Holiday {
  date: Date
  name: string
}

// Calculate Easter Sunday using Gauss algorithm
function getEasterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1

  return new Date(year, month - 1, day)
}

// Add days to a date
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Get all Norwegian holidays for a given year
export function getNorwegianHolidays(year: number): Holiday[] {
  const easter = getEasterSunday(year)

  const holidays: Holiday[] = [
    // Fixed holidays
    { date: new Date(year, 0, 1), name: 'Nyttårsdag' },
    { date: new Date(year, 4, 1), name: 'Arbeidernes dag' },
    { date: new Date(year, 4, 17), name: 'Grunnlovsdag' },
    { date: new Date(year, 11, 25), name: '1. juledag' },
    { date: new Date(year, 11, 26), name: '2. juledag' },

    // Movable holidays based on Easter
    { date: addDays(easter, -3), name: 'Skjærtorsdag' },
    { date: addDays(easter, -2), name: 'Langfredag' },
    { date: easter, name: '1. påskedag' },
    { date: addDays(easter, 1), name: '2. påskedag' },
    { date: addDays(easter, 39), name: 'Kristi himmelfartsdag' },
    { date: addDays(easter, 49), name: '1. pinsedag' },
    { date: addDays(easter, 50), name: '2. pinsedag' },
  ]

  return holidays.sort((a, b) => a.date.getTime() - b.date.getTime())
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
