interface ProgressBarProps {
  value: number   // 0–100
  label?: string
  showPercent?: boolean
  color?: 'forest' | 'green' | 'red' | 'amber'
  size?: 'sm' | 'md'
}

const colorClasses = {
  forest: 'bg-forest-700',
  green:  'bg-emerald-500',
  red:    'bg-red-500',
  amber:  'bg-amber-500',
}

const heightClasses = {
  sm: 'h-2',
  md: 'h-3',
}

export function ProgressBar({
  value,
  label,
  showPercent = false,
  color = 'forest',
  size = 'md',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>}
          {showPercent && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{Math.round(clamped)}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-100 dark:bg-slate-700 rounded-full ${heightClasses[size]}`}>
        <div
          className={`${heightClasses[size]} rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
