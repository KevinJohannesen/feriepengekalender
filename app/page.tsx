'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MonthCalendar } from '@/components/month-calendar'
import { BudgetChart } from '@/components/budget-chart'
import { WorkdaysTable } from '@/components/workdays-table'
import {
  getNorwegianHolidays,
  getWorkingDaysInYear,
  MONTH_NAMES,
} from '@/lib/holidays'
import { CalendarDays, Clock, Banknote } from 'lucide-react'

export default function FeriepengekalenderPage() {
  // Work settings
  const [year, setYear] = useState(2026)
  const [hoursPerWeek, setHoursPerWeek] = useState<number | 'custom'>(37.5)
  const [customHours, setCustomHours] = useState(37.5)
  const [positionPercent, setPositionPercent] = useState(100)
  const [vacationDays, setVacationDays] = useState(25)
  const [isOver60, setIsOver60] = useState(false)

  // Vacation pay settings
  const [annualSalary, setAnnualSalary] = useState(600000)
  const [vacationPayBase, setVacationPayBase] = useState<number | null>(null)
  const [vacationPayMonth, setVacationPayMonth] = useState(5) // June (0-indexed)
  const [salaryDeducted, setSalaryDeducted] = useState(true)

  // Vacation pay percent (user-overridable, synced with days & over-60)
  const [vacationPayPercent, setVacationPayPercent] = useState(12.0)

  const effectiveVacationDays = isOver60 ? 30 : vacationDays
  const effectiveHoursPerWeek =
    hoursPerWeek === 'custom' ? customHours : hoursPerWeek
  const hoursPerDay = (effectiveHoursPerWeek / 5) * (positionPercent / 100)

  const holidays = useMemo(() => getNorwegianHolidays(year), [year])
  const { totalWorkingDays, totalHolidaysOnWeekdays } = useMemo(
    () => getWorkingDaysInYear(year, holidays),
    [year, holidays]
  )

  // Calculate vacation pay
  const effectiveVacationPayBase = vacationPayBase ?? annualSalary
  const vacationPay = Math.round(
    effectiveVacationPayBase * (vacationPayPercent / 100)
  )
  const monthlyGrossSalary = Math.round(annualSalary / 12)

  const totalWeekdays = totalWorkingDays + totalHolidaysOnWeekdays
  const actualWorkingDays = totalWorkingDays - effectiveVacationDays
  const actualWorkingHours = actualWorkingDays * hoursPerDay

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format number with thousands separator
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('nb-NO', {
      maximumFractionDigits: 1,
    }).format(num)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl">
            Feriepengekalender
          </h1>
          <p className="mt-2 text-stone-500">
            Beregn arbeidsdager, timer og feriepenger for året
          </p>
        </header>

        {/* Input Sections */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Section 1: Work Settings */}
          <Card className="border-stone-200 bg-white shadow-sm">
            <CardContent className="space-y-5">
              <h2 className="text-lg font-semibold text-stone-800">
                Arbeidsinnstillinger
              </h2>

              {/* Year */}
              <div className="space-y-2">
                <Label htmlFor="year">År</Label>
                <Select
                  value={year.toString()}
                  onValueChange={(v) => setYear(parseInt(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Hours per week */}
              <div className="space-y-2">
                <Label htmlFor="hours">Timer per uke</Label>
                <Select
                  value={hoursPerWeek.toString()}
                  onValueChange={(v) =>
                    setHoursPerWeek(v === 'custom' ? 'custom' : parseFloat(v))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="37.5">37,5 (standard)</SelectItem>
                    <SelectItem value="40">40</SelectItem>
                    <SelectItem value="custom">Egendefinert</SelectItem>
                  </SelectContent>
                </Select>
                {hoursPerWeek === 'custom' && (
                  <Input
                    type="number"
                    value={customHours}
                    onChange={(e) => setCustomHours(parseFloat(e.target.value) || 0)}
                    min={1}
                    max={60}
                    step={0.5}
                    className="mt-2"
                  />
                )}
              </div>

              {/* Position percent */}
              <div className="space-y-2">
                <Label htmlFor="position">Stillingsprosent</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={positionPercent}
                    onChange={(e) =>
                      setPositionPercent(parseFloat(e.target.value) || 0)
                    }
                    min={1}
                    max={100}
                    className="w-24"
                  />
                  <span className="text-stone-500">%</span>
                </div>
              </div>

              {/* Vacation days */}
              <div className="space-y-2">
                <Label htmlFor="vacationDays">Antall feriedager</Label>
                <Input
                  type="number"
                  value={isOver60 ? 30 : vacationDays}
                  onChange={(e) => {
                    const days = parseInt(e.target.value) || 25
                    setVacationDays(days)
                    if (days <= 21) setVacationPayPercent(10.2)
                    else if (days >= 25) setVacationPayPercent(12.0)
                  }}
                  min={21}
                  max={30}
                  disabled={isOver60}
                />
                <p className="text-xs text-stone-400">
                  21 dager (4 uker + 1 dag) eller 25 dager (5 uker)
                </p>
              </div>

              {/* Over 60 toggle */}
              <div className="flex items-center justify-between rounded-lg bg-stone-50 p-3">
                <div>
                  <Label htmlFor="over60" className="cursor-pointer">
                    Over 60 år
                  </Label>
                  <p className="text-xs text-stone-400">6. ferieuke = 30 dager</p>
                </div>
                <Switch
                  id="over60"
                  checked={isOver60}
                  onCheckedChange={(checked) => {
                    setIsOver60(checked)
                    if (checked) {
                      setVacationPayPercent(12.5)
                    } else {
                      setVacationPayPercent(vacationDays <= 21 ? 10.2 : 12.0)
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Vacation Pay Settings */}
          <Card className="border-stone-200 bg-white shadow-sm">
            <CardContent className="space-y-5">
              <h2 className="text-lg font-semibold text-stone-800">
                Feriepenger
              </h2>

              {/* Annual salary */}
              <div className="space-y-2">
                <Label htmlFor="salary">Årslønn (brutto)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={formatCurrency(annualSalary)}
                    onChange={(e) => {
                      const num = parseInt(e.target.value.replace(/\s/g, '')) || 0
                      setAnnualSalary(num)
                    }}
                    className="flex-1"
                  />
                  <span className="text-stone-500">kr</span>
                </div>
              </div>

              {/* Vacation pay base */}
              <div className="space-y-2">
                <Label htmlFor="vacationPayBase">
                  Feriepengegrunnlag forrige år
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder={formatCurrency(annualSalary)}
                    value={
                      vacationPayBase !== null
                        ? formatCurrency(vacationPayBase)
                        : ''
                    }
                    onChange={(e) => {
                      const val = e.target.value.replace(/\s/g, '')
                      setVacationPayBase(val ? parseInt(val) || null : null)
                    }}
                    className="flex-1"
                  />
                  <span className="text-stone-500">kr</span>
                </div>
                <p className="text-xs text-stone-400">
                  Feriepenger beregnes av fjorårets inntekt
                </p>
              </div>

              {/* Vacation pay percent */}
              <div className="space-y-2">
                <Label htmlFor="vacationPayPercent">Feriepengeprosent</Label>
                <Select
                  value={vacationPayPercent.toString()}
                  onValueChange={(v) => setVacationPayPercent(parseFloat(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10.2">10,2% — 4 uker + 1 dag</SelectItem>
                    <SelectItem value="12">12,0% — 5 uker (avtalefestet)</SelectItem>
                    <SelectItem value="12.5">12,5% — over 60 år</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-stone-400">
                  {vacationPayPercent === 10.2
                    ? 'Gjelder kun ved 4 uker + 1 dag ferie'
                    : vacationPayPercent === 12.5
                      ? 'Gjelder arbeidstakere over 60 år med 5 ukers ferie'
                      : 'Gjelder ved avtale om 5 ukers ferie — de fleste norske arbeidsgivere'}
                </p>
              </div>

              {/* Payout month */}
              <div className="space-y-2">
                <Label htmlFor="payoutMonth">Utbetalingsmåned</Label>
                <Select
                  value={vacationPayMonth.toString()}
                  onValueChange={(v) => setVacationPayMonth(parseInt(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_NAMES.map((name, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {name}
                        {i === 5 && ' (vanlig)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Salary deducted toggle */}
              <div className="flex items-center justify-between rounded-lg bg-stone-50 p-3">
                <div>
                  <Label htmlFor="salaryDeducted" className="cursor-pointer">
                    Trekkes lønn i ferietiden?
                  </Label>
                  <p className="text-xs text-stone-400">
                    De fleste får ikke lønn i juli
                  </p>
                </div>
                <Switch
                  id="salaryDeducted"
                  checked={salaryDeducted}
                  onCheckedChange={setSalaryDeducted}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hero Output - Metric Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {/* Working Days Card */}
          <Card className="border-stone-200 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <CalendarDays className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-stone-500">
                Arbeidsdager {year}
              </p>
              <p className="mt-1 text-3xl font-bold text-stone-800">
                {actualWorkingDays} dager
              </p>
              <div className="mt-3 space-y-0.5 text-xs text-stone-400">
                <p>{totalWeekdays} hverdager i {year}</p>
                <p className="text-rose-500">
                  &minus; {totalHolidaysOnWeekdays} helligdag{totalHolidaysOnWeekdays !== 1 && 'er'} på hverdager
                </p>
                <p>&minus; {effectiveVacationDays} feriedager</p>
                <p className="font-semibold text-stone-600">
                  = {actualWorkingDays} dager du faktisk jobber
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Working Hours Card */}
          <Card className="border-stone-200 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-stone-500">
                Arbeidstimer {year}
              </p>
              <p className="mt-1 text-3xl font-bold text-stone-800">
                {formatNumber(actualWorkingHours)} timer
              </p>
              <p className="mt-3 text-xs text-stone-400">
                {actualWorkingDays} dager &times; {formatNumber(hoursPerDay)} t/dag
              </p>
            </CardContent>
          </Card>

          {/* Vacation Pay Card */}
          <Card className="border-stone-200 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Banknote className="h-6 w-6 text-amber-600" />
              </div>
              <p className="text-sm font-medium text-stone-500">
                Feriepenger utbetales
              </p>
              <p className="mt-1 text-3xl font-bold text-stone-800">
                {formatCurrency(vacationPay)} kr
              </p>
              <p className="mt-2 text-xs text-amber-600">
                {MONTH_NAMES[vacationPayMonth]} {year}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Year Calendar */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-stone-800">
            Årskalender {year}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }, (_, month) => (
              <MonthCalendar
                key={month}
                year={year}
                month={month}
                holidays={holidays}
                vacationPayMonth={vacationPayMonth}
              />
            ))}
          </div>
        </section>

        {/* Budget Chart */}
        <section className="mb-8">
          <BudgetChart
            monthlyGrossSalary={monthlyGrossSalary}
            vacationPay={vacationPay}
            vacationPayMonth={vacationPayMonth}
            salaryDeductedInVacation={salaryDeducted}
            vacationMonth={6} // July
          />
        </section>

        {/* Workdays Table */}
        <section className="mb-8">
          <WorkdaysTable
            year={year}
            holidays={holidays}
            hoursPerDay={hoursPerDay}
          />
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-stone-200 pt-6 text-center text-sm text-stone-400">
          <p>Norsk feriepengekalender — alle beregninger er veiledende</p>
        </footer>
      </div>
    </div>
  )
}
