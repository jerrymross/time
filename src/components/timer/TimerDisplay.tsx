'use client'

import { formatElapsedTime } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { formatDateSwedish, formatTime } from '@/lib/utils'
import { ActiveTimer } from '@/types'

interface TimerDisplayProps {
  isActive: boolean
  elapsedSeconds: number
  activeTimer: ActiveTimer | null
  loading: boolean
  onStart: () => void
  onStop: () => void
}

export function TimerDisplay({ isActive, elapsedSeconds, activeTimer, loading, onStart, onStop }: TimerDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-8 py-6">
      {/* Tidvisning */}
      <div className="relative">
        <div
          className={`
            text-6xl sm:text-8xl font-display font-medium tracking-tight tabular-nums
            transition-colors duration-300
            ${isActive ? 'text-signal animate-breath' : 'text-gray-200 dark:text-slate-700'}
          `}
          aria-live="polite"
          aria-atomic="true"
        >
          {formatElapsedTime(elapsedSeconds)}
        </div>

        {/* Pulserande ring vid aktiv timer */}
        {isActive && (
          <div className="absolute -inset-4 rounded-full border border-forest-200 dark:border-forest-900 animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Statusinformation */}
      {activeTimer && (
        <div className="text-center space-y-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Startade{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {formatDateSwedish(activeTimer.started_at)}{' '}
              kl.&nbsp;{formatTime(new Date(activeTimer.started_at).toTimeString())}
            </span>
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-signal animate-pulse" />
            <span className="text-sm font-medium text-signal">Timer pågår</span>
          </div>
        </div>
      )}

      {!isActive && !loading && (
        <p className="text-gray-400 dark:text-slate-500 text-sm">Ingen timer aktiv</p>
      )}

      {/* Knappar */}
      <div className="flex gap-4">
        {!isActive ? (
          <Button
            size="xl"
            variant="primary"
            onClick={onStart}
            loading={loading}
            icon={
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            }
          >
            Starta klockan
          </Button>
        ) : (
          <Button
            size="xl"
            variant="danger"
            onClick={onStop}
            icon={
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
            }
          >
            Stoppa klockan
          </Button>
        )}
      </div>
    </div>
  )
}
