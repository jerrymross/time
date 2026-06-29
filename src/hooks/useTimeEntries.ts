'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TimeEntry, TimeEntryFormData } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

interface Filters {
  dateFrom?: string
  dateTo?: string
  categoryId?: string
  search?: string
}

export function useTimeEntries(filters?: Filters) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchEntries = useCallback(async () => {
    if (!user) return
    setLoading(true)
    let query = supabase
      .from('time_entries')
      .select('*, categories(id, name, color)')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .order('start_time', { ascending: false })

    if (filters?.dateFrom) query = query.gte('entry_date', filters.dateFrom)
    if (filters?.dateTo)   query = query.lte('entry_date', filters.dateTo)
    if (filters?.categoryId) query = query.eq('category_id', filters.categoryId)
    if (filters?.search) query = query.ilike('task_description', `%${filters.search}%`)

    const { data } = await query
    setEntries(data ?? [])
    setLoading(false)
  }, [user, filters?.dateFrom, filters?.dateTo, filters?.categoryId, filters?.search])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const addEntry = async (form: TimeEntryFormData): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Inte inloggad' }
    const { error } = await supabase.from('time_entries').insert({
      user_id: user.id,
      category_id: form.category_id || null,
      task_description: form.task_description || null,
      entry_date: form.entry_date,
      start_time: form.start_time,
      end_time: form.end_time,
      duration_minutes: form.duration_minutes,
    })
    if (!error) await fetchEntries()
    return { error: error?.message ?? null }
  }

  const updateEntry = async (id: string, form: Partial<TimeEntryFormData>): Promise<{ error: string | null }> => {
    const { error } = await supabase
      .from('time_entries')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) await fetchEntries()
    return { error: error?.message ?? null }
  }

  const deleteEntry = async (id: string): Promise<{ error: string | null }> => {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', id)
    if (!error) await fetchEntries()
    return { error: error?.message ?? null }
  }

  return { entries, loading, addEntry, updateEntry, deleteEntry, refetch: fetchEntries }
}

// Hook för att hämta ett specifikt månads entries
export function useMonthEntries(year: number, month: number) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const dateFrom = `${year}-${String(month).padStart(2, '0')}-01`
  const dateToDate = new Date(year, month, 0)
  const dateTo = `${year}-${String(month).padStart(2, '0')}-${String(dateToDate.getDate()).padStart(2, '0')}`

  const fetchEntries = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('time_entries')
      .select('*, categories(id, name, color)')
      .eq('user_id', user.id)
      .gte('entry_date', dateFrom)
      .lte('entry_date', dateTo)
      .order('entry_date')
    setEntries(data ?? [])
    setLoading(false)
  }, [user, dateFrom, dateTo])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  return { entries, loading, refetch: fetchEntries }
}
