import { ReactNode } from 'react'
import { classNames } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

const paddingClasses = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={classNames(
        'bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  )
}
