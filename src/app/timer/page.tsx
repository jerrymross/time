'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { TimerDisplay } from '@/components/timer/TimerDisplay'
import { StopTimerModal } from '@/components/timer/StopTimerModal'
import { ManualEntryForm } from '@/components/timer/ManualEntryForm'
import { useTimer } from '@/hooks/useTimer'
import { useCategories } from '@/hooks/useCategories'
import { useToast } from '@/contexts/ToastContext'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { StopTimerFormData, ManualEntryFormData } from '@/types'
import { calcDurationMinutes } from '@/lib/utils'

export default function TimerPage() {
  const { user } = useAuth()
  const { activeTimer, elapsedSeconds, isActive, loading, startTimer, stopTimer } = useTimer()
  const { categories } = useCategories()
  const { addToast } = useToast()
  const [showStopModal, setShowStopModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleStart = async () => {
    const { error } = await startTimer()
    if (error) addToast('error', `Kunde inte starta timer: ${error}`)
    else addToast('success', 'Timer startad!')
  }

  const handleStop = async () => {
    setShowStopModal(true)
  }

  const handleSaveStop = async (data: StopTimerFormData) => {
    if (!user) return
    setSaving(true)
    try {
      // Stoppa timern
      await stopTimer()

      // Spara tidsposten
      const { error } = await supabase.from('time_entries').insert({
        user_id: user.id,
        category_id: data.category_id || null,
        task_description: data.task_description || null,
        entry_date: data.entry_date,
        start_time: data.start_time,
        end_time: data.end_time,
        duration_minutes: data.duration_minutes,
      })

      if (error) {
        addToast('error', `Fel vid sparande: ${error.message}`)
      } else {
        addToast('success', 'Arbetstid registrerad!')
        setShowStopModal(false)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleManualSave = async (data: ManualEntryFormData) => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase.from('time_entries').insert({
        user_id: user.id,
        category_id: data.category_id || null,
        task_description: data.task_description || null,
        entry_date: data.entry_date,
        start_time: data.start_time,
        end_time: data.end_time,
        duration_minutes: data.duration_minutes,
      })
      if (error) addToast('error', `Fel vid sparande: ${error.message}`)
      else addToast('success', 'Registrering sparad!')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tidtagning</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Starta klockan eller registrera tid manuellt
          </p>
        </div>

        {/* Timer */}
        <Card className="py-8">
          <TimerDisplay
            isActive={isActive}
            elapsedSeconds={elapsedSeconds}
            activeTimer={activeTimer}
            loading={loading}
            onStart={handleStart}
            onStop={handleStop}
          />
        </Card>

        {/* Manuell registrering */}
        <ManualEntryForm
          categories={categories}
          onSave={handleManualSave}
          saving={saving}
        />
      </div>

      <StopTimerModal
        open={showStopModal}
        onClose={() => setShowStopModal(false)}
        onSave={handleSaveStop}
        activeTimer={activeTimer}
        categories={categories}
        saving={saving}
      />
    </AppShell>
  )
}
