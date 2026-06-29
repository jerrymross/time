'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useUserSettings } from '@/hooks/useUserSettings'
import { useCategories } from '@/hooks/useCategories'
import { useToast } from '@/contexts/ToastContext'
import { Category } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
  '#6366F1', '#84CC16',
]

export default function SettingsPage() {
  const { user } = useAuth()
  const { settings, loading: settingsLoading, updateSettings } = useUserSettings()
  const { categories, loading: catLoading, addCategory, updateCategory, deleteCategory } = useCategories()
  const { addToast } = useToast()

  const [goalHours, setGoalHours] = useState('')
  const [savingGoal, setSavingGoal] = useState(false)

  const [showAddCat, setShowAddCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0])
  const [savingCat, setSavingCat] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)

  useEffect(() => {
    if (settings) setGoalHours(String(settings.monthly_goal_hours))
  }, [settings])

  const handleSaveGoal = async () => {
    const h = parseFloat(goalHours)
    if (isNaN(h) || h <= 0 || h > 999) {
      addToast('error', 'Ange ett giltigt antal timmar (1–999)')
      return
    }
    setSavingGoal(true)
    const { error } = await updateSettings({ monthly_goal_hours: h })
    setSavingGoal(false)
    if (error) addToast('error', `Fel: ${error}`)
    else addToast('success', 'Mål sparat!')
  }

  const handleAddCategory = async () => {
    if (!newCatName.trim()) {
      addToast('error', 'Ange ett kategorinamn')
      return
    }
    setSavingCat(true)
    const { error } = await addCategory(newCatName.trim(), newCatColor)
    setSavingCat(false)
    if (error) addToast('error', `Fel: ${error}`)
    else {
      addToast('success', 'Kategori skapad!')
      setNewCatName('')
      setNewCatColor(PRESET_COLORS[0])
      setShowAddCat(false)
    }
  }

  const handleEditSave = async () => {
    if (!editCat || !editCat.name.trim()) return
    setSavingCat(true)
    const { error } = await updateCategory(editCat.id, { name: editCat.name, color: editCat.color })
    setSavingCat(false)
    if (error) addToast('error', `Fel: ${error}`)
    else {
      addToast('success', 'Kategori uppdaterad!')
      setEditCat(null)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    const { error } = await deleteCategory(id)
    if (error) addToast('error', `Fel: ${error}`)
    else addToast('success', 'Kategori borttagen!')
  }

  if (settingsLoading) {
    return <AppShell><div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div></AppShell>
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inställningar</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Hantera mål och kategorier</p>
        </div>

        {/* Arbetstidsmål */}
        <Card>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Arbetstidsmål</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Ange önskat antal arbetstimmar per månad.
          </p>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Input
                label="Timmar per månad"
                type="number"
                min="1"
                max="999"
                step="0.5"
                value={goalHours}
                onChange={e => setGoalHours(e.target.value)}
              />
            </div>
            <Button variant="primary" onClick={handleSaveGoal} loading={savingGoal}>
              Spara mål
            </Button>
          </div>
        </Card>

        {/* Kategorier */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Kategorier</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Hantera dina arbetstidskategorier</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowAddCat(true)}>
              + Lägg till
            </Button>
          </div>

          {catLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-2">
              {categories.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">Inga kategorier ännu</p>
              )}
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-slate-700 p-3"
                >
                  <div className="h-8 w-8 rounded-lg flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="flex-1 font-medium text-gray-800 dark:text-gray-200">{cat.name}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditCat({ ...cat })}>
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDeleteCategory(cat.id)}>
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Kontoinformation */}
        <Card>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Konto</h2>
          <div className="rounded-xl bg-gray-50 dark:bg-slate-700/50 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Inloggad som</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">{user?.email}</p>
          </div>
        </Card>
      </div>

      {/* Ny kategori-modal */}
      <Modal open={showAddCat} onClose={() => setShowAddCat(false)} title="Ny kategori" size="sm">
        <div className="space-y-4">
          <Input
            label="Kategorinamn"
            placeholder="t.ex. Administration"
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            autoFocus
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Färg</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setNewCatColor(color)}
                  className={`h-8 w-8 rounded-lg transition-transform ${newCatColor === color ? 'scale-110 ring-2 ring-offset-2 ring-forest-700' : ''}`}
                  style={{ backgroundColor: color }}
                  aria-label={color}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowAddCat(false)}>Avbryt</Button>
            <Button variant="primary" className="flex-1" onClick={handleAddCategory} loading={savingCat}>Skapa</Button>
          </div>
        </div>
      </Modal>

      {/* Redigera kategori-modal */}
      <Modal open={!!editCat} onClose={() => setEditCat(null)} title="Redigera kategori" size="sm">
        {editCat && (
          <div className="space-y-4">
            <Input
              label="Kategorinamn"
              value={editCat.name}
              onChange={e => setEditCat(prev => prev ? { ...prev, name: e.target.value } : null)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Färg</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setEditCat(prev => prev ? { ...prev, color } : null)}
                    className={`h-8 w-8 rounded-lg transition-transform ${editCat.color === color ? 'scale-110 ring-2 ring-offset-2 ring-forest-700' : ''}`}
                    style={{ backgroundColor: color }}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setEditCat(null)}>Avbryt</Button>
              <Button variant="primary" className="flex-1" onClick={handleEditSave} loading={savingCat}>Spara</Button>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  )
}
