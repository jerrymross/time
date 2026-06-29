'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

export function useCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchCategories = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('name')
    setCategories(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const addCategory = async (name: string, color: string): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Inte inloggad' }
    const { error } = await supabase
      .from('categories')
      .insert({ user_id: user.id, name, color })
    if (!error) await fetchCategories()
    return { error: error?.message ?? null }
  }

  const updateCategory = async (id: string, updates: Partial<Pick<Category, 'name' | 'color' | 'is_active'>>): Promise<{ error: string | null }> => {
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
    if (!error) await fetchCategories()
    return { error: error?.message ?? null }
  }

  const deleteCategory = async (id: string): Promise<{ error: string | null }> => {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', id)
    if (!error) await fetchCategories()
    return { error: error?.message ?? null }
  }

  return { categories, loading, addCategory, updateCategory, deleteCategory, refetch: fetchCategories }
}
