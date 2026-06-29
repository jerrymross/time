'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { TodoForm } from '@/components/todos/TodoForm'
import { Todo, TodoFormData, TodoPriority } from '@/types'
import { classNames } from '@/lib/utils'

const PRIORITY_CONFIG: Record<TodoPriority, { label: string; color: string; dot: string }> = {
  hög:   { label: 'Hög',   color: 'text-red-600 dark:text-red-400',    dot: 'bg-red-500' },
  medel: { label: 'Medel', color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  låg:   { label: 'Låg',   color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
}

function deadlineLabel(deadline: string | null): { text: string; urgent: boolean } | null {
  if (!deadline) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(deadline + 'T00:00:00')
  const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000)
  if (diff < 0) return { text: `${Math.abs(diff)} dag${Math.abs(diff) === 1 ? '' : 'ar'} försenad`, urgent: true }
  if (diff === 0) return { text: 'Idag', urgent: true }
  if (diff === 1) return { text: 'Imorgon', urgent: true }
  if (diff <= 7) return { text: `Om ${diff} dagar`, urgent: false }
  return { text: deadline, urgent: false }
}

interface TodoItemProps {
  todo: Todo
  onToggle: (todo: Todo) => Promise<void>
  onUpdate: (id: string, data: Partial<TodoFormData>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function TodoItem({ todo, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const p = PRIORITY_CONFIG[todo.priority]
  const dl = deadlineLabel(todo.deadline)

  const handleUpdate = async (data: TodoFormData) => {
    setSaving(true)
    await onUpdate(todo.id, data)
    setSaving(false)
    setEditOpen(false)
  }

  const handleDelete = async () => {
    if (!confirm('Ta bort uppgiften?')) return
    setDeleting(true)
    await onDelete(todo.id)
    setDeleting(false)
  }

  return (
    <>
      <div
        className={classNames(
          'flex items-start gap-3 rounded-xl p-4 border transition-colors group',
          todo.completed
            ? 'bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700/50 opacity-60'
            : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600'
        )}
      >
        {/* Checkbox */}
        <button
          onClick={() => onToggle(todo)}
          className={classNames(
            'mt-0.5 h-5 w-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors',
            todo.completed
              ? 'bg-forest-800 border-forest-800'
              : 'border-gray-300 dark:border-slate-500 hover:border-forest-600'
          )}
          aria-label={todo.completed ? 'Markera som ej klar' : 'Markera som klar'}
        >
          {todo.completed && (
            <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Innehåll */}
        <div className="flex-1 min-w-0">
          <p className={classNames(
            'text-sm font-medium text-gray-900 dark:text-white leading-snug',
            todo.completed && 'line-through text-gray-400 dark:text-gray-500'
          )}>
            {todo.title}
          </p>

          {todo.description && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {todo.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {/* Prioritet */}
            <span className={classNames('inline-flex items-center gap-1 text-xs font-medium', p.color)}>
              <span className={classNames('h-1.5 w-1.5 rounded-full', p.dot)} />
              {p.label}
            </span>

            {/* Deadline */}
            {dl && !todo.completed && (
              <span className={classNames(
                'text-xs font-medium',
                dl.urgent ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
              )}>
                · {dl.text}
              </span>
            )}
          </div>
        </div>

        {/* Åtgärder */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditOpen(true)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Redigera"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
            aria-label="Ta bort"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6M9 6V4h6v2" />
            </svg>
          </button>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Redigera uppgift" size="md">
        <TodoForm
          initial={{
            title: todo.title,
            description: todo.description ?? '',
            priority: todo.priority,
            deadline: todo.deadline ?? '',
          }}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
          saving={saving}
          submitLabel="Uppdatera"
        />
      </Modal>
    </>
  )
}
