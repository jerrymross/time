'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ActiveTimer } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

export function useTimer() {
  const { user } = useAuth()
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  // Hämta aktiv timer vid mount
  const fetchTimer = useCallback(async () => {
    if (!user) { setLoading(false); return }
    const { data } = await supabase
      .from('active_timers')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    setActiveTimer(data)
    if (data) {
      const started = new Date(data.started_at).getTime()
      setElapsedSeconds(Math.floor((Date.now() - started) / 1000))
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchTimer()
  }, [fetchTimer])

  // Löpande klocka
  useEffect(() => {
    if (activeTimer) {
      intervalRef.current = setInterval(() => {
        const started = new Date(activeTimer.started_at).getTime()
        setElapsedSeconds(Math.floor((Date.now() - started) / 1000))
      }, 1000)
    } else {
      setElapsedSeconds(0)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [activeTimer])

  // Starta timer
  const startTimer = useCallback(async (): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Inte inloggad' }
    if (activeTimer) return { error: 'En timer är redan igång' }

    const { data, error } = await supabase
      .from('active_timers')
      .insert({ user_id: user.id })
      .select()
      .single()

    if (error) return { error: error.message }
    setActiveTimer(data)
    return { error: null }
  }, [user, activeTimer])

  // Stoppa timer
  const stopTimer = useCallback(async (): Promise<{ error: string | null }> => {
    if (!user || !activeTimer) return { error: 'Ingen aktiv timer' }

    const { error } = await supabase
      .from('active_timers')
      .delete()
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    setActiveTimer(null)
    setElapsedSeconds(0)
    return { error: null }
  }, [user, activeTimer])

  return {
    activeTimer,
    elapsedSeconds,
    isActive: !!activeTimer,
    loading,
    startTimer,
    stopTimer,
    refetch: fetchTimer,
  }
}
