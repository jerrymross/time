'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Felaktig e-postadress eller lösenord. Försök igen.')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 rounded-xl bg-forest-800 flex items-center justify-center shadow-lg mb-4">
            <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 15" />
            </svg>
          </div>
          <h1 className="text-2xl font-display font-medium text-gray-900 dark:text-white tracking-tight">Tidklocka</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Personlig arbetstidsregistrering</p>
        </div>

        {/* Inloggningskort */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Logga in</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-postadress"
              type="email"
              autoComplete="email"
              placeholder="din@epost.se"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              label="Lösenord"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Logga in
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          Inloggning krävs för att använda systemet.
          <br />Kontakta administratören för att skapa ett konto.
        </p>
      </div>
    </div>
  )
}
