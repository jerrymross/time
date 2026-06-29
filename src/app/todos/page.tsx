'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { TodoItem } from '@/components/todos/TodoItem'
import { TodoForm } from '@/components/todos/TodoForm'
import { useTodos } from '@/hooks/useTodos'
import { useToast } from '@/contexts/ToastContext'
import { TodoFormData, TodoPriority } from '@/types'
import { classNames } from '@/lib/utils'

type FilterView = 'alla' | 'aktiva' | 'klara'
type PriorityFilter = 'alla' | TodoPriority

export default function TodosPage() {
  const { todos, loading, addTodo, updateTodo, toggleComplete, deleteTodo } = useTodos()
  const { addToast } = useToast()

  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<FilterView>('aktiva')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('alla')

  const handleAdd = async (data: TodoFormData) => {
    setSaving(true)
    const { error } = await addTodo(data)
    setSaving(false)
    if (error) addToast('error', `Fel: ${error}`)
    else {
      addToast('success', 'Uppgift tillagd!')
      setAddOpen(false)
    }
  }

  const handleUpdate = async (id: string, data: Partial<TodoFormData>) => {
    const { error } = await updateTodo(id, data)
    if (error) addToast('error', `Fel: ${error}`)
    else addToast('success', 'Uppgift uppdaterad!')
  }

  const handleToggle = async (todo: Parameters<typeof toggleComplete>[0]) => {
    const { error } = await toggleComplete(todo)
    if (error) addToast('error', `Fel: ${error}`)
  }

  const handleDelete = async (id: string) => {
    const { error } = await deleteTodo(id)
    if (error) addToast('error', `Fel: ${error}`)
    else addToast('success', 'Uppgift borttagen!')
  }

  const filtered = todos.filter(t => {
    if (view === 'aktiva' && t.completed) return false
    if (view === 'klara' && !t.completed) return false
    if (priorityFilter !== 'alla' && t.priority !== priorityFilter) return false
    return true
  })

  const activeCount = todos.filter(t => !t.completed).length
  const doneCount = todos.filter(t => t.completed).length

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Rubrik */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Att göra</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {activeCount} aktiv{activeCount !== 1 ? 'a' : ''} · {doneCount} klar{doneCount !== 1 ? 'a' : ''}
            </p>
          </div>
          <Button
            icon={
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
            onClick={() => setAddOpen(true)}
          >
            Ny uppgift
          </Button>
        </div>

        {/* Filter */}
        <Card padding="sm">
          <div className="flex flex-wrap items-center gap-4">
            {/* Statusflikar */}
            <div className="flex rounded-lg border border-gray-200 dark:border-slate-600 overflow-hidden">
              {(['aktiva', 'alla', 'klara'] as FilterView[]).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={classNames(
                    'px-3 py-1.5 text-sm font-medium transition-colors capitalize',
                    view === v
                      ? 'bg-forest-800 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                  )}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>

            {/* Prioritetsfilter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Prioritet:</span>
              {(['alla', 'hög', 'medel', 'låg'] as (PriorityFilter)[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={classNames(
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                    priorityFilter === p
                      ? p === 'hög'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : p === 'medel'
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        : p === 'låg'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-forest-50 dark:bg-forest-900/30 text-forest-800 dark:text-forest-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                  )}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Lista */}
        <Card padding="none">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Uppgifter
              {filtered.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-400">{filtered.length}</span>
              )}
            </h2>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="flex justify-center py-12"><LoadingSpinner /></div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {view === 'klara' ? 'Inga avklarade uppgifter ännu.' : 'Inga uppgifter. Skapa en ny!'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(todo => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={handleToggle}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Ny uppgift" size="md">
        <TodoForm
          onSubmit={handleAdd}
          onCancel={() => setAddOpen(false)}
          saving={saving}
          submitLabel="Lägg till"
        />
      </Modal>
    </AppShell>
  )
}
