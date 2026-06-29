'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Todo, TodoFormData } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

export function useTodos() {
  const { user } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTodos = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('completed', { ascending: true })
      .order('deadline', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
    setTodos(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchTodos() }, [fetchTodos])

  const addTodo = async (data: TodoFormData): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Inte inloggad' }
    const { error } = await supabase.from('todos').insert({
      user_id: user.id,
      title: data.title,
      description: data.description || null,
      priority: data.priority,
      deadline: data.deadline || null,
    })
    if (!error) await fetchTodos()
    return { error: error?.message ?? null }
  }

  const updateTodo = async (id: string, updates: Partial<TodoFormData>): Promise<{ error: string | null }> => {
    const payload: Record<string, unknown> = { ...updates }
    if (updates.description === '') payload.description = null
    if (updates.deadline === '') payload.deadline = null
    const { error } = await supabase.from('todos').update(payload).eq('id', id)
    if (!error) await fetchTodos()
    return { error: error?.message ?? null }
  }

  const toggleComplete = async (todo: Todo): Promise<{ error: string | null }> => {
    const { error } = await supabase
      .from('todos')
      .update({
        completed: !todo.completed,
        completed_at: todo.completed ? null : new Date().toISOString(),
      })
      .eq('id', todo.id)
    if (!error) await fetchTodos()
    return { error: error?.message ?? null }
  }

  const deleteTodo = async (id: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (!error) await fetchTodos()
    return { error: error?.message ?? null }
  }

  return { todos, loading, addTodo, updateTodo, toggleComplete, deleteTodo, refetch: fetchTodos }
}
