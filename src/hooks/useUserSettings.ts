'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserSettings } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

export function useUserSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchSettings = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!data) {
      // Skapa standardinställningar om de saknas
      const { data: created } = await supabase
        .from('user_settings')
        .insert({ user_id: user.id, monthly_goal_hours: 160 })
        .select()
        .single()
      setSettings(created)
    } else {
      setSettings(data)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateSettings = async (updates: Partial<Pick<UserSettings, 'monthly_goal_hours'>>): Promise<{ error: string | null }> => {
    if (!user || !settings) return { error: 'Inga inställningar hittades' }
    const { error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', user.id)
    if (!error) await fetchSettings()
    return { error: error?.message ?? null }
  }

  return { settings, loading, updateSettings, refetch: fetchSettings }
}
