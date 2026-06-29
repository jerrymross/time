'use client'

import { TimeEntry } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDateSwedish, formatTime, formatDuration } from '@/lib/utils'

interface EntryTableProps {
  entries: TimeEntry[]
  onEdit: (entry: TimeEntry) => void
  onDelete: (entry: TimeEntry) => void
}

export function EntryTable({ entries, onEdit, onDelete }: EntryTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 dark:text-slate-500">
        <svg className="mx-auto h-12 w-12 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
        </svg>
        <p className="text-sm">Inga registreringar hittades</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktoptabell */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-700 text-left">
              <th className="pb-3 pr-4 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Datum</th>
              <th className="pb-3 pr-4 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Kategori</th>
              <th className="pb-3 pr-4 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Arbetsuppgift</th>
              <th className="pb-3 pr-4 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Tid</th>
              <th className="pb-3 pr-4 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-right">Total</th>
              <th className="pb-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-right">Åtgärder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {entries.map(entry => (
              <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="py-3 pr-4 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                  {formatDateSwedish(entry.entry_date)}
                </td>
                <td className="py-3 pr-4">
                  {entry.categories ? (
                    <Badge label={entry.categories.name} color={entry.categories.color} />
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="py-3 pr-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                  {entry.task_description || '—'}
                </td>
                <td className="py-3 pr-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {formatTime(entry.start_time)}–{formatTime(entry.end_time)}
                </td>
                <td className="py-3 pr-4 text-right font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                  {formatDuration(entry.duration_minutes)}
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(entry)} aria-label="Redigera">
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(entry)} aria-label="Ta bort" className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobilkort */}
      <div className="md:hidden space-y-3">
        {entries.map(entry => (
          <div key={entry.id} className="rounded-xl border border-gray-100 dark:border-slate-700 p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateSwedish(entry.entry_date)}</p>
                <p className="font-medium text-gray-900 dark:text-white text-sm mt-0.5 line-clamp-2">
                  {entry.task_description || '—'}
                </p>
              </div>
              {entry.categories && <Badge label={entry.categories.name} color={entry.categories.color} />}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatTime(entry.start_time)}–{formatTime(entry.end_time)} · <span className="font-medium text-gray-700 dark:text-gray-300">{formatDuration(entry.duration_minutes)}</span>
              </p>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(entry)}>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(entry)} className="text-red-400 hover:text-red-600">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
