'use client'

import { MONTH_NAMES } from '@/lib/holidays'

interface BudgetChartProps {
  monthlyGrossSalary: number
  vacationPay: number
  vacationPayMonth: number
  salaryDeductedInVacation: boolean
  vacationMonth: number
}

export function BudgetChart({
  monthlyGrossSalary,
  vacationPay,
  vacationPayMonth,
  salaryDeductedInVacation,
  vacationMonth,
}: BudgetChartProps) {
  // Calculate monthly income for each month
  const monthlyIncome = Array.from({ length: 12 }, (_, month) => {
    let income = monthlyGrossSalary
    let vacationPayAmount = 0

    // Add vacation pay in the specified month
    if (month === vacationPayMonth) {
      vacationPayAmount = vacationPay
    }

    // Deduct salary in vacation month if enabled
    if (salaryDeductedInVacation && month === vacationMonth) {
      income = 0
    }

    return {
      month,
      salary: income,
      vacationPay: vacationPayAmount,
      total: income + vacationPayAmount,
    }
  })

  const maxIncome = Math.max(...monthlyIncome.map((m) => m.total))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-stone-800">
        Månedlig inntektsoversikt
      </h3>

      {/* Chart */}
      <div className="mb-6 flex items-end gap-2">
        {monthlyIncome.map(({ month, salary, vacationPay: vp, total }) => {
          const height = maxIncome > 0 ? (total / maxIncome) * 100 : 0
          const salaryHeight =
            maxIncome > 0 ? (salary / maxIncome) * 100 : 0
          const vpHeight = maxIncome > 0 ? (vp / maxIncome) * 100 : 0

          return (
            <div key={month} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="relative w-full min-h-[4px] flex flex-col justify-end"
                style={{ height: `${Math.max(height, 4)}%`, minHeight: '100px' }}
              >
                {/* Vacation pay portion */}
                {vp > 0 && (
                  <div
                    className="w-full rounded-t bg-amber-400"
                    style={{
                      height: `${(vpHeight / height) * 100}%`,
                    }}
                  />
                )}
                {/* Salary portion */}
                <div
                  className={`w-full ${vp > 0 ? '' : 'rounded-t'} rounded-b ${
                    salary === 0
                      ? 'bg-rose-300'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    height: salary > 0 || vp === 0 ? `${(salaryHeight / (height || 1)) * 100}%` : '4px',
                    minHeight: salary === 0 && vp === 0 ? '4px' : undefined,
                  }}
                />
              </div>
              <span className="text-[10px] font-medium text-stone-500">
                {MONTH_NAMES[month].slice(0, 3)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-emerald-500" />
          <span className="text-stone-600">Lønn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-amber-400" />
          <span className="text-stone-600">Feriepenger</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-rose-300" />
          <span className="text-stone-600">Lønnstrekk</span>
        </div>
      </div>

      {/* Summary text */}
      <div className="space-y-2 rounded-lg bg-stone-50 p-4 text-sm">
        <p className="text-stone-700">
          <span className="font-medium text-amber-600">
            I {MONTH_NAMES[vacationPayMonth].toLowerCase()}
          </span>{' '}
          får du:{' '}
          <span className="font-semibold">
            {formatCurrency(monthlyGrossSalary)} kr
          </span>{' '}
          (lønn) +{' '}
          <span className="font-semibold text-amber-600">
            {formatCurrency(vacationPay)} kr
          </span>{' '}
          (feriepenger) ={' '}
          <span className="font-bold text-emerald-600">
            {formatCurrency(monthlyGrossSalary + vacationPay)} kr
          </span>
        </p>
        {salaryDeductedInVacation && (
          <p className="text-stone-700">
            <span className="font-medium text-rose-500">
              I {MONTH_NAMES[vacationMonth].toLowerCase()}
            </span>{' '}
            får du:{' '}
            <span className="font-semibold text-rose-500">0 kr</span> (lønnstrekk)
            — planlegg budsjettet!
          </p>
        )}
      </div>
    </div>
  )
}
