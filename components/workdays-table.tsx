'use client'

import { ChevronDown } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Holiday,
  getWorkingDaysInMonth,
  MONTH_NAMES,
} from '@/lib/holidays'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface WorkdaysTableProps {
  year: number
  holidays: Holiday[]
  hoursPerDay: number
}

export function WorkdaysTable({
  year,
  holidays,
  hoursPerDay,
}: WorkdaysTableProps) {
  const [isOpen, setIsOpen] = useState(false)

  const monthlyData = Array.from({ length: 12 }, (_, month) => {
    const { workingDays, holidaysOnWeekdays } = getWorkingDaysInMonth(
      year,
      month,
      holidays
    )
    return {
      month,
      workingDays,
      holidaysOnWeekdays,
      hours: workingDays * hoursPerDay,
    }
  })

  const totals = monthlyData.reduce(
    (acc, m) => ({
      workingDays: acc.workingDays + m.workingDays,
      holidaysOnWeekdays: acc.holidaysOnWeekdays + m.holidaysOnWeekdays,
      hours: acc.hours + m.hours,
    }),
    { workingDays: 0, holidaysOnWeekdays: 0, hours: 0 }
  )

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('nb-NO', {
      maximumFractionDigits: 1,
    }).format(num)
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:bg-stone-50">
        <span className="text-lg font-semibold text-stone-800">
          Arbeidsdager per måned
        </span>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-stone-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-50">
                <TableHead className="font-semibold text-stone-700">
                  Måned
                </TableHead>
                <TableHead className="text-right font-semibold text-stone-700">
                  Arbeidsdager
                </TableHead>
                <TableHead className="text-right font-semibold text-stone-700">
                  Helligdager
                </TableHead>
                <TableHead className="text-right font-semibold text-stone-700">
                  Timer
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyData.map(
                ({ month, workingDays, holidaysOnWeekdays, hours }) => (
                  <TableRow key={month}>
                    <TableCell className="font-medium text-stone-700">
                      {MONTH_NAMES[month]} {year}
                    </TableCell>
                    <TableCell className="text-right text-stone-600">
                      {workingDays}
                    </TableCell>
                    <TableCell className="text-right text-stone-600">
                      {holidaysOnWeekdays > 0 ? holidaysOnWeekdays : '—'}
                    </TableCell>
                    <TableCell className="text-right text-stone-600">
                      {formatNumber(hours)}
                    </TableCell>
                  </TableRow>
                )
              )}
              <TableRow className="bg-stone-100 font-semibold">
                <TableCell className="text-stone-800">Sum</TableCell>
                <TableCell className="text-right text-stone-800">
                  {totals.workingDays}
                </TableCell>
                <TableCell className="text-right text-stone-800">
                  {totals.holidaysOnWeekdays}
                </TableCell>
                <TableCell className="text-right text-stone-800">
                  {formatNumber(totals.hours)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
