'use client'

import { useState, useEffect, useCallback } from 'react'

interface HNStory {
  objectID: string
  title: string
  url: string | null
  author: string
  points: number
  num_comments: number
  created_at: string
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 60) return `${mins}m`
  if (mins < 1440) return `${Math.floor(mins / 60)}t`
  return `${Math.floor(mins / 1440)}d`
}

export function AINewsWidget() {
  const [stories, setStories] = useState<HNStory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(
        'https://hn.algolia.com/api/v1/search?query=AI+LLM+machine+learning&tags=story&hitsPerPage=8&numericFilters=points>40'
      )
      if (!res.ok) throw new Error()
      const data = await res.json()
      setStories(data.hits ?? [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch_()
    const id = setInterval(fetch_, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [fetch_])

  return (
    <div className="py-3">
      {/* Refresh row */}
      <div className="flex items-center justify-between px-3 mb-2">
        <span className="text-xs text-gray-400">Hämtas från Hacker News</span>
        <button
          onClick={fetch_}
          disabled={loading}
          className="text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30"
          title="Uppdatera"
        >
          <svg className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
        </button>
      </div>

      {/* Stories list */}
      <div className="space-y-0.5 max-h-72 overflow-y-auto scrollbar-thin">
        {loading && !stories.length && (
          <div className="px-3 py-8 text-center text-xs text-gray-400">Laddar nyheter...</div>
        )}
        {error && (
          <div className="px-3 py-4 text-center text-xs text-red-500">Kunde inte hämta nyheter</div>
        )}
        {stories.map((s, i) => (
          <a
            key={s.objectID}
            href={s.url || `https://news.ycombinator.com/item?id=${s.objectID}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-2.5 px-3 py-2 hover:bg-black/[0.04] transition-colors group"
            onPointerDown={e => e.stopPropagation()}
          >
            <span className="mt-0.5 text-xs text-gray-300 tabular-nums w-4 flex-shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-700 group-hover:text-gray-900 leading-snug line-clamp-2 transition-colors">
                {s.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400">▲ {s.points}</span>
                <span className="text-xs text-gray-400">{s.num_comments} komm.</span>
                <span className="text-xs text-gray-400">{timeAgo(s.created_at)}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
