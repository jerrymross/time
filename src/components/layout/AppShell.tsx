'use client'

import { ReactNode } from 'react'
import { Navigation } from './Navigation'
import { ToastList } from '@/components/ui/ToastList'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-paper dark:bg-slate-900">
      <Navigation />

      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>

      <ToastList />
    </div>
  )
}
