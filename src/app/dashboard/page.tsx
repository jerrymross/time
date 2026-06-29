'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { TimeEntry, ActiveTimer, UserSettings, Category } from '@/types'
import {
  formatDuration, formatElapsedTime, formatDateSwedish, formatTime,
  toLocalDateString,
} from '@/lib/utils'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { sv } from 'date-fns/locale'
import Link from 'next/link'

interface DashboardStats {
  todayMinutes: number
  monthMinutes: number
  prevMonthMinutes: number
  categoryBreakdown: { category: Category; minutes: number }[]
  recentEntries: TimeEntry[]
  activeTimer: ActiveTimer | null
  settings: UserSettings | null
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const supabase = createClient()

  const fetchStats = async () => {
    if (!user) return

    const today = toLocalDateString(new Date())
    const now = new Date()
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
    const prevMonthStart = format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd')
    const prevMonthEnd = format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd')

    const [
      { data: todayData },
      { data: monthData },
      { data: prevData },
      { data: recentData },
      { data: timerData },
      { data: settingsData },
      { data: catData },
    ] = await Promise.all([
      supabase.from('time_entries').select('duration_minutes').eq('user_id', user.id).eq('entry_date', today),
      supabase.from('time_entries').select('duration_minutes, category_id').eq('user_id', user.id).gte('entry_date', monthStart).lte('entry_date', monthEnd),
      supabase.from('time_entries').select('duration_minutes').eq('user_id', user.id).gte('entry_date', prevMonthStart).lte('entry_date', prevMonthEnd),
      supabase.from('time_entries').select('*, categories(id,name,color)').eq('user_id', user.id).order('entry_date', { ascending: false }).order('start_time', { ascending: false }).limit(5),
      supabase.from('active_timers').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('categories').select('*').eq('user_id', user.id).eq('is_active', true),
    ])

    // Beräkna kategorifördelning för denna månad
    const categoryBreakdown = (catData ?? []).map(cat => {
      const mins = (monthData ?? [])
        .filter(e => e.category_id === cat.id)
        .reduce((sum, e) => sum + e.duration_minutes, 0)
      return { category: cat, minutes: mins }
    }).filter(c => c.minutes > 0).sort((a, b) => b.minutes - a.minutes)

    setStats({
      todayMinutes: (todayData ?? []).reduce((s, e) => s + e.duration_minutes, 0),
      monthMinutes: (monthData ?? []).reduce((s, e) => s + e.duration_minutes, 0),
      prevMonthMinutes: (prevData ?? []).reduce((s, e) => s + e.duration_minutes, 0),
      categoryBreakdown,
      recentEntries: recentData ?? [],
      activeTimer: timerData,
      settings: settingsData,
    })
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60000) // uppdatera varje minut
    return () => clearInterval(interval)
  }, [user])

  // Löpande timer
  useEffect(() => {
    if (!stats?.activeTimer) { setElapsedSeconds(0); return }
    const tick = () => {
      const started = new Date(stats.activeTimer!.started_at).getTime()
      setElapsedSeconds(Math.floor((Date.now() - started) / 1000))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [stats?.activeTimer])

  if (!stats) {
    return (
      <AppShell>
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      </AppShell>
    )
  }

  const goalMinutes = (stats.settings?.monthly_goal_hours ?? 160) * 60
  const goalProgress = goalMinutes > 0 ? (stats.monthMinutes / goalMinutes) * 100 : 0
  const remainingMinutes = Math.max(0, goalMinutes - stats.monthMinutes)
  const monthDiff = stats.monthMinutes - stats.prevMonthMinutes
  const monthDiffPct = stats.prevMonthMinutes > 0 ? ((monthDiff / stats.prevMonthMinutes) * 100).toFixed(0) : null

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Sidrubrik */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatDateSwedish(new Date())} · {format(new Date(), 'MMMM yyyy', { locale: sv })}
          </p>
        </div>

        {/* Aktiv timer-banner */}
        {stats.activeTimer && (
          <Link href="/timer">
            <div className="bg-forest-800 dark:bg-forest-900 rounded-xl p-5 flex items-center justify-between cursor-pointer hover:bg-forest-700 dark:hover:bg-forest-800 transition-colors">
              <div className="flex items-center gap-5">
                <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="h-2.5 w-2.5 rounded-full bg-signal animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-medium text-forest-200 uppercase tracking-wide">Timer pågår</p>
                  <p className="text-3xl font-display font-medium text-signal tabular-nums animate-breath leading-none mt-0.5">
                    {formatElapsedTime(elapsedSeconds)}
                  </p>
                </div>
              </div>
              <div className="text-forest-300 text-sm font-medium">Stoppa →</div>
            </div>
          </Link>
        )}

        {/* Nyckeltal */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Idag"
            value={formatDuration(stats.todayMinutes)}
            icon={<ClockIcon />}
            color="forest"
          />
          <StatCard
            label="Denna månad"
            value={formatDuration(stats.monthMinutes)}
            icon={<CalendarIcon />}
            color="forest"
          />
          <StatCard
            label="Förra månaden"
            value={formatDuration(stats.prevMonthMinutes)}
            icon={<TrendIcon up={monthDiff >= 0} />}
            color={monthDiff >= 0 ? 'green' : 'red'}
            subtitle={monthDiffPct ? `${monthDiff >= 0 ? '+' : ''}${monthDiffPct}% vs föregående` : undefined}
          />
          <StatCard
            label="Kvar av mål"
            value={formatDuration(remainingMinutes)}
            icon={<TargetIcon />}
            color="amber"
            subtitle={`Mål: ${stats.settings?.monthly_goal_hours ?? 160} tim/mån`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Månadsframsteg */}
          <Card className="lg:col-span-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Månadsframsteg
            </h2>
            <div className="mb-4">
              <ProgressBar
                value={goalProgress}
                showPercent
                color={goalProgress >= 100 ? 'green' : goalProgress >= 60 ? 'forest' : 'amber'}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                {formatDuration(stats.monthMinutes)} registrerade
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                Mål: {stats.settings?.monthly_goal_hours ?? 160} tim
              </span>
            </div>

            {/* Kategorifördelning */}
            {stats.categoryBreakdown.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Fördelning denna månad</h3>
                {stats.categoryBreakdown.map(({ category, minutes }) => (
                  <div key={category.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <Badge label={category.name} color={category.color} />
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {formatDuration(minutes)}
                      </span>
                    </div>
                    <ProgressBar
                      value={stats.monthMinutes > 0 ? (minutes / stats.monthMinutes) * 100 : 0}
                      size="sm"
                      color="forest"
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Senaste registreringar */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Senaste</h2>
              <Link href="/history" className="text-sm text-forest-700 dark:text-forest-400 hover:underline">
                Visa alla
              </Link>
            </div>
            {stats.recentEntries.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">Inga registreringar ännu</p>
            ) : (
              <div className="space-y-3">
                {stats.recentEntries.map(entry => (
                  <div key={entry.id} className="flex items-start gap-3">
                    <div
                      className="mt-0.5 h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: entry.categories?.color ?? '#94a3b8' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
                        {entry.task_description || '—'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDateSwedish(entry.entry_date)} · {formatDuration(entry.duration_minutes)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  )
}

// ──────────────────────────────────────────
// Underkomponenter
// ──────────────────────────────────────────

function StatCard({ label, value, icon, color, subtitle }: {
  label: string
  value: string
  icon: React.ReactNode
  color: 'forest' | 'violet' | 'green' | 'red' | 'amber'
  subtitle?: string
}) {
  const colors = {
    forest: 'bg-forest-50 dark:bg-forest-900/20 text-forest-700 dark:text-forest-400',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
    green:  'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    red:    'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    amber:  'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  }
  return (
    <Card>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
    </Card>
  )
}

function ClockIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" /></svg>
}
function CalendarIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
}
function TrendIcon({ up }: { up: boolean }) {
  return up
    ? <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
    : <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></svg>
}
function TargetIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /></svg>
}
