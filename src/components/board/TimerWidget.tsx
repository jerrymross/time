'use client'

import { useState } from 'react'
import { useTimer } from '@/hooks/useTimer'
import { useCategories } from '@/hooks/useCategories'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { StopTimerModal } from '@/components/timer/StopTimerModal'
import { StopTimerFormData } from '@/types'
import { formatElapsedTime } from '@/lib/utils'

export function TimerWidget() {
  const { user } = useAuth()
  const { activeTimer, elapsedSeconds, isActive, loading, startTimer, stopTimer } = useTimer()
  const { categories } = useCategories()
  const [showStop, setShowStop] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleStart = async () => {
    await startTimer()
  }

  const handleSaveStop = async (data: StopTimerFormData) => {
    if (!user) return
    setSaving(true)
    await stopTimer()
    await supabase.from('time_entries').insert({
      user_id: user.id,
      category_id: data.category_id || null,
      task_description: data.task_description || null,
      entry_date: data.entry_date,
      start_time: data.start_time,
      end_time: data.end_time,
      duration_minutes: data.duration_minutes,
    })
    setSaving(false)
    setShowStop(false)
  }

  return (
    <>
      <div className="px-4 py-4 flex flex-col items-center gap-3">
        {/* Elapsed time display */}
        <div className={`font-display text-4xl font-medium tabular-nums tracking-tight transition-colors duration-500 ${isActive ? 'text-signal animate-breath' : 'text-white/20'}`}>
          {formatElapsedTime(elapsedSeconds)}
        </div>

        {/* Status dot */}
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-signal animate-pulse' : 'bg-white/20'}`} />
          <span className="text-xs text-white/40">{loading ? '...' : isActive ? 'Kör' : 'Inaktiv'}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full">
          {!isActive ? (
            <button
              onClick={handleStart}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-white transition-all disabled:opacity-40"
              style={{ background: 'rgba(17,76,54,0.8)', border: '1px solid rgba(29,94,66,0.6)' }}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
              Starta
            </button>
          ) : (
            <button
              onClick={() => setShowStop(true)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-white transition-all"
              style={{ background: 'rgba(185,28,28,0.5)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
              Stoppa
            </button>
          )}
        </div>
      </div>

      <StopTimerModal
        open={showStop}
        onClose={() => setShowStop(false)}
        onSave={handleSaveStop}
        activeTimer={activeTimer}
        categories={categories}
        saving={saving}
      />
    </>
  )
}
