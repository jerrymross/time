'use client'

import { useState, useMemo } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { EntryTable } from '@/components/history/EntryTable'
import { FilterBar } from '@/components/history/FilterBar'
import { EditEntryModal } from '@/components/history/EditEntryModal'
import { DeleteConfirmModal } from '@/components/history/DeleteConfirmModal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { useCategories } from '@/hooks/useCategories'
import { useToast } from '@/contexts/ToastContext'
import { TimeEntry, TimeEntryFormData } from '@/types'
import { formatDuration } from '@/lib/utils'
import { format, startOfMonth, endOfMonth } from 'date-fns'

const now = new Date()
const DEFAULT_FROM = format(startOfMonth(now), 'yyyy-MM-dd')
const DEFAULT_TO   = format(endOfMonth(now), 'yyyy-MM-dd')

export default function HistoryPage() {
  const [filters, setFilters] = useState({
    dateFrom: DEFAULT_FROM,
    dateTo: DEFAULT_TO,
    categoryId: '',
    search: '',
  })

  const { entries, loading, updateEntry, deleteEntry, refetch } = useTimeEntries(filters)
  const { categories } = useCategories()
  const { addToast } = useToast()

  const [editEntry, setEditEntry] = useState<TimeEntry | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TimeEntry | null>(null)
  const [saving, setSaving] = useState(false)

  const totalMinutes = useMemo(() => entries.reduce((s, e) => s + e.duration_minutes, 0), [entries])

  const handleFilterChange = (key: string, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value }))

  const handleReset = () =>
    setFilters({ dateFrom: DEFAULT_FROM, dateTo: DEFAULT_TO, categoryId: '', search: '' })

  const handleEdit = async (id: string, data: Partial<TimeEntryFormData>) => {
    setSaving(true)
    const { error } = await updateEntry(id, data)
    setSaving(false)
    if (error) addToast('error', `Fel: ${error}`)
    else addToast('success', 'Registrering uppdaterad!')
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    const { error } = await deleteEntry(deleteTarget.id)
    setSaving(false)
    if (error) addToast('error', `Fel: ${error}`)
    else {
      addToast('success', 'Registrering borttagen!')
      setDeleteTarget(null)
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Historik</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {loading ? 'Laddar...' : `${entries.length} poster · ${formatDuration(totalMinutes)} totalt`}
            </p>
          </div>
        </div>

        <FilterBar
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          categoryId={filters.categoryId}
          search={filters.search}
          categories={categories}
          onChange={handleFilterChange}
          onReset={handleReset}
        />

        <Card padding="none" className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Registreringar
            </h2>
            {totalMinutes > 0 && (
              <span className="text-sm font-medium text-forest-700 dark:text-forest-400">
                Totalt: {formatDuration(totalMinutes)}
              </span>
            )}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12"><LoadingSpinner /></div>
            ) : (
              <EntryTable
                entries={entries}
                onEdit={entry => setEditEntry(entry)}
                onDelete={entry => setDeleteTarget(entry)}
              />
            )}
          </div>
        </Card>
      </div>

      <EditEntryModal
        open={!!editEntry}
        onClose={() => setEditEntry(null)}
        onSave={handleEdit}
        entry={editEntry}
        categories={categories}
        saving={saving}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={saving}
      />
    </AppShell>
  )
}
