import { format, parseISO, startOfMonth, endOfMonth, eachWeekOfInterval, startOfWeek, endOfWeek, getISOWeek } from 'date-fns'
import { sv } from 'date-fns/locale'

// ──────────────────────────────────────────
// Tidsformatering
// ──────────────────────────────────────────

/** Formaterar minuter som "2 tim 30 min" */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0 min'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} tim`
  return `${h} tim ${m} min`
}

/** Formaterar sekunder som "HH:MM:SS" */
export function formatElapsedTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

/** Formaterar datum på svenska, t.ex. "15 juni 2024" */
export function formatDateSwedish(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'd MMMM yyyy', { locale: sv })
}

/** Formaterar datum som "15 jun" */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'd MMM', { locale: sv })
}

/** Formaterar månad och år, t.ex. "Juni 2024" */
export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: sv })
}

/** Formaterar tid som "HH:mm" */
export function formatTime(time: string): string {
  return time.slice(0, 5)
}

/** Konverterar "HH:MM:SS" eller "HH:MM" till minuter sedan midnatt */
export function timeToMinutes(time: string): number {
  const parts = time.split(':')
  return parseInt(parts[0]) * 60 + parseInt(parts[1])
}

/** Beräknar duration i minuter mellan start och slut */
export function calcDurationMinutes(startTime: string, endTime: string): number {
  const startM = timeToMinutes(startTime)
  const endM = timeToMinutes(endTime)
  return Math.max(0, endM - startM)
}

/** Lägger till minuter till en tid "HH:MM" och returnerar ny tid */
export function addMinutesToTime(time: string, minutes: number): string {
  const total = timeToMinutes(time) + minutes
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Konverterar Date till lokal ISO-datum "YYYY-MM-DD" */
export function toLocalDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/** Konverterar Date till lokal tidssträng "HH:MM" */
export function toLocalTimeString(date: Date): string {
  return format(date, 'HH:mm')
}

// ──────────────────────────────────────────
// Veckodata för rapporter
// ──────────────────────────────────────────

export function getWeeksInMonth(year: number, month: number): { start: Date; end: Date; label: string }[] {
  const start = startOfMonth(new Date(year, month - 1))
  const end = endOfMonth(new Date(year, month - 1))

  const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 })
  return weeks.map(weekStart => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    const clampedEnd = weekEnd > end ? end : weekEnd
    const clampedStart = weekStart < start ? start : weekStart
    return {
      start: clampedStart,
      end: clampedEnd,
      label: `V${getISOWeek(weekStart)}`,
    }
  })
}

// ──────────────────────────────────────────
// CSV-export
// ──────────────────────────────────────────

export function exportToCSV(rows: Record<string, string | number>[], filename: string): void {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(';'),
    ...rows.map(row => headers.map(h => `"${String(row[h]).replace(/"/g, '""')}"`).join(';')),
  ].join('\n')

  const bom = '﻿' // UTF-8 BOM för Excel
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ──────────────────────────────────────────
// Övrigt
// ──────────────────────────────────────────

export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}
