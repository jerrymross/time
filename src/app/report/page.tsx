'use client'

import { useState, useMemo } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { WeeklyBarChart } from '@/components/report/WeeklyBarChart'
import { CategoryPieChart } from '@/components/report/CategoryPieChart'
import { CommonTasks } from '@/components/report/CommonTasks'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useMonthEntries } from '@/hooks/useTimeEntries'
import { useUserSettings } from '@/hooks/useUserSettings'
import { useCategories } from '@/hooks/useCategories'
import { TimeEntry, WeeklyData, CategoryData } from '@/types'
import { formatDuration, formatMonthYear, getWeeksInMonth, toLocalDateString, exportToCSV } from '@/lib/utils'
import { parseISO, isWithinInterval, subMonths } from 'date-fns'
import { sv } from 'date-fns/locale'
import { format } from 'date-fns'

export default function ReportPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const { entries, loading } = useMonthEntries(year, month)
  const { settings } = useUserSettings()
  const { categories } = useCategories()

  // Föregående månads data
  const prevDate = subMonths(new Date(year, month - 1), 1)
  const { entries: prevEntries } = useMonthEntries(prevDate.getFullYear(), prevDate.getMonth() + 1)

  const totalMinutes = useMemo(() => entries.reduce((s, e) => s + e.duration_minutes, 0), [entries])
  const prevTotalMinutes = useMemo(() => prevEntries.reduce((s, e) => s + e.duration_minutes, 0), [prevEntries])
  const diff = totalMinutes - prevTotalMinutes
  const diffPct = prevTotalMinutes > 0 ? ((diff / prevTotalMinutes) * 100).toFixed(0) : null

  const goalMinutes = (settings?.monthly_goal_hours ?? 160) * 60
  const goalProgress = goalMinutes > 0 ? (totalMinutes / goalMinutes) * 100 : 0

  // Veckodata
  const weeklyData: WeeklyData[] = useMemo(() => {
    const weeks = getWeeksInMonth(year, month)
    return weeks.map(w => {
      const mins = entries
        .filter(e => {
          const d = parseISO(e.entry_date)
          return isWithinInterval(d, { start: w.start, end: w.end })
        })
        .reduce((s, e) => s + e.duration_minutes, 0)
      return { week: w.label, weekLabel: w.label, minutes: mins }
    })
  }, [entries, year, month])

  // Kategoridata
  const categoryData: CategoryData[] = useMemo(() => {
    const result = categories.map(cat => {
      const mins = entries.filter(e => e.category_id === cat.id).reduce((s, e) => s + e.duration_minutes, 0)
      return { name: cat.name, minutes: mins, color: cat.color, percentage: 0 }
    }).filter(c => c.minutes > 0)
    const total = result.reduce((s, c) => s + c.minutes, 0)
    return result.map(c => ({ ...c, percentage: total > 0 ? (c.minutes / total) * 100 : 0 }))
      .sort((a, b) => b.minutes - a.minutes)
  }, [entries, categories])

  // Vanligaste uppgifter
  const commonTasks = useMemo(() => {
    const map = new Map<string, { count: number; minutes: number }>()
    entries.forEach(e => {
      const key = (e.task_description ?? '').trim()
      if (!key) return
      const prev = map.get(key) ?? { count: 0, minutes: 0 }
      map.set(key, { count: prev.count + 1, minutes: prev.minutes + e.duration_minutes })
    })
    return Array.from(map.entries())
      .map(([task, v]) => ({ task, ...v }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 8)
  }, [entries])

  // Navigera månader
  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  // Exportera CSV
  const handleExportCSV = () => {
    const rows = entries.map(e => ({
      Datum: e.entry_date,
      Kategori: e.categories?.name ?? '',
      Arbetsuppgift: e.task_description ?? '',
      Starttid: e.start_time.slice(0, 5),
      Sluttid: e.end_time.slice(0, 5),
      'Tid (minuter)': e.duration_minutes,
      'Tid (tim:min)': `${Math.floor(e.duration_minutes / 60)}:${String(e.duration_minutes % 60).padStart(2, '0')}`,
    }))
    exportToCSV(rows, `arbetstid-${year}-${String(month).padStart(2, '0')}.csv`)
  }

  const handlePrint = () => window.print()

  const selectedDate = new Date(year, month - 1)

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Månadsrapport</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {formatMonthYear(selectedDate)}
            </p>
          </div>
          <div className="flex items-center gap-2 no-print">
            <Button variant="secondary" size="sm" onClick={handleExportCSV}>
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Exportera CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={handlePrint}>
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              Skriv ut
            </Button>
          </div>
        </div>

        {/* Månadsväljare */}
        <div className="flex items-center justify-center gap-4 no-print">
          <Button variant="ghost" size="sm" onClick={prevMonth}>
            ← Föregående
          </Button>
          <span className="text-base font-semibold text-gray-800 dark:text-gray-200 min-w-[160px] text-center capitalize">
            {formatMonthYear(selectedDate)}
          </span>
          <Button variant="ghost" size="sm" onClick={nextMonth} disabled={isCurrentMonth}>
            Nästa →
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : (
          <>
            {/* Sammanfattning */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print-page">
              <SummaryCard label="Total arbetstid" value={formatDuration(totalMinutes)} />
              <SummaryCard label="Föregående månad" value={formatDuration(prevTotalMinutes)} />
              <SummaryCard
                label="Förändring"
                value={`${diff >= 0 ? '+' : ''}${formatDuration(Math.abs(diff))}`}
                color={diff >= 0 ? 'green' : 'red'}
                subtitle={diffPct ? `${diff >= 0 ? '+' : ''}${diffPct}%` : undefined}
              />
              <SummaryCard label="Antal pass" value={String(entries.length)} />
            </div>

            {/* Målframsteg */}
            <Card className="print-page">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Framsteg mot mål</h2>
              <ProgressBar
                value={goalProgress}
                showPercent
                color={goalProgress >= 100 ? 'green' : goalProgress >= 60 ? 'forest' : 'amber'}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {formatDuration(totalMinutes)} av {formatDuration(goalMinutes)} mål
                {goalProgress < 100 && ` · ${formatDuration(goalMinutes - totalMinutes)} kvar`}
              </p>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Veckodiagram */}
              <Card className="print-page">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Arbetstid per vecka</h2>
                <WeeklyBarChart data={weeklyData} />
              </Card>

              {/* Kategorifördelning */}
              <Card className="print-page">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Fördelning per kategori</h2>
                <CategoryPieChart data={categoryData} />
              </Card>
            </div>

            {/* Vanligaste uppgifter */}
            <Card className="print-page">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Vanligaste arbetsuppgifter</h2>
              <CommonTasks tasks={commonTasks} />
            </Card>
          </>
        )}
      </div>
    </AppShell>
  )
}

function SummaryCard({ label, value, color, subtitle }: {
  label: string
  value: string
  color?: 'green' | 'red'
  subtitle?: string
}) {
  return (
    <Card>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold mt-1 ${
        color === 'green' ? 'text-emerald-600 dark:text-emerald-400' :
        color === 'red'   ? 'text-red-600 dark:text-red-400' :
        'text-gray-900 dark:text-white'
      }`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </Card>
  )
}
