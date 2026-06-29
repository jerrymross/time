import { formatDuration } from '@/lib/utils'

interface Task {
  task: string
  count: number
  minutes: number
}

interface CommonTasksProps {
  tasks: Task[]
}

export function CommonTasks({ tasks }: CommonTasksProps) {
  if (!tasks.length) {
    return (
      <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">
        Inga arbetsuppgifter att visa
      </p>
    )
  }

  const max = tasks[0].minutes

  return (
    <div className="space-y-3">
      {tasks.map((task, idx) => (
        <div key={idx}>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-700 dark:text-gray-300 truncate flex-1 mr-3">{task.task}</span>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs text-gray-400">{task.count}×</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{formatDuration(task.minutes)}</span>
            </div>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full">
            <div
              className="h-1.5 rounded-full bg-forest-700"
              style={{ width: `${(task.minutes / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
