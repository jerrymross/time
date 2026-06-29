interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  fullPage?: boolean
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export function LoadingSpinner({ size = 'md', fullPage = false }: LoadingSpinnerProps) {
  const spinner = (
    <svg
      className={`animate-spin text-forest-700 ${sizeClasses[size]}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Laddar..."
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )

  if (fullPage) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper dark:bg-slate-900">
        {spinner}
      </div>
    )
  }

  return spinner
}
