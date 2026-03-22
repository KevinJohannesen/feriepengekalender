'use client'

import {
  Holiday,
  isHoliday,
  isWeekend,
  getDatesInMonth,
  getWorkingDaysInMonth,
  MONTH_NAMES,
  DAY_NAMES_SHORT,
} from '@/lib/holidays'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface MonthCalendarProps {
  year: number
  month: number
  holidays: Holiday[]
  vacationPayMonth: number
}

export function MonthCalendar({
  year,
  month,
  holidays,
  vacationPayMonth,
}: MonthCalendarProps) {
  const dates = getDatesInMonth(year, month)
  const { workingDays, holidaysOnWeekdays } = getWorkingDaysInMonth(
    year,
    month,
    holidays
  )

  // Get the day of week for the first day (0 = Sunday, adjust for Monday start)
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  // Create calendar grid with empty cells for offset
  const calendarCells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...dates,
  ]

  const isVacationPayMonth = month === vacationPayMonth

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-800">
          {MONTH_NAMES[month]}
        </h3>
        {isVacationPayMonth && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            Feriepenger
          </span>
        )}
      </div>

      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {DAY_NAMES_SHORT.map((day, i) => (
          <div
            key={day}
            className={cn(
              'text-center text-[10px] font-medium',
              i >= 5 ? 'text-rose-400' : 'text-stone-400'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {calendarCells.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="aspect-square" />
          }

          const holiday = isHoliday(date, holidays)
          const weekend = isWeekend(date)

          const cellContent = (
            <div
              className={cn(
                'flex aspect-square items-center justify-center rounded text-xs transition-colors',
                holiday
                  ? 'bg-rose-500 font-bold text-white'
                  : weekend
                    ? 'bg-rose-50 text-rose-400'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
              )}
            >
              {date.getDate()}
            </div>
          )

          if (holiday) {
            return (
              <Tooltip key={date.toISOString()}>
                <TooltipTrigger asChild>{cellContent}</TooltipTrigger>
                <TooltipContent side="top" className="bg-rose-600 text-white">
                  {holiday.name}
                </TooltipContent>
              </Tooltip>
            )
          }

          return <div key={date.toISOString()}>{cellContent}</div>
        })}
      </div>

      {/* Stats */}
      <div className="mt-2 flex items-center justify-between border-t border-stone-100 pt-2 text-[10px] text-stone-500">
        <span>{workingDays} arbeidsdager</span>
        {holidaysOnWeekdays > 0 && (
          <span className="text-rose-500">
            {holidaysOnWeekdays} helligdag{holidaysOnWeekdays > 1 ? 'er' : ''}
          </span>
        )}
      </div>
    </div>
  )
}
