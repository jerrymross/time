'use client'

import { useState, useRef } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { BoardWidget } from '@/components/board/BoardWidget'
import { StickyNote } from '@/components/board/StickyNote'
import { TimerWidget } from '@/components/board/TimerWidget'
import { AINewsWidget } from '@/components/board/AINewsWidget'
import { useBoard, StickyColor } from '@/hooks/useBoard'

const STICKY_COLORS: { color: StickyColor; bg: string; label: string }[] = [
  { color: 'yellow', bg: '#FEF08A', label: 'Gul' },
  { color: 'pink',   bg: '#FBCFE8', label: 'Rosa' },
  { color: 'cyan',   bg: '#A5F3FC', label: 'Cyan' },
  { color: 'lime',   bg: '#D9F99D', label: 'Lime' },
  { color: 'purple', bg: '#DDD6FE', label: 'Lila' },
]

export default function BoardPage() {
  const board = useBoard()
  const [menu, setMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  return (
    <AppShell>
      {/* Break out of AppShell padding to fill content area */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-6 lg:-my-8 relative" style={{ minHeight: 'calc(100vh - 4rem)', background: '#F2F2F7' }}>

        {/* ── Toolbar ── */}
        <div
          className="relative z-50 flex items-center justify-between px-4 sm:px-6 py-3"
          style={{
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            background: 'rgba(242,242,247,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div>
            <h1 className="text-sm font-display font-medium text-gray-800 tracking-wide">Anslagstavla</h1>
            <p className="text-xs text-gray-400">Dra och släpp widgets var som helst · Dubbelklicka lappar för att redigera</p>
          </div>

          {/* Add widget button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenu(v => !v)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
              style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.08)' }}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Lägg till
            </button>

            {menu && (
              <div
                className="absolute right-0 top-full mt-2 rounded-2xl overflow-hidden py-2 min-w-[180px] z-50"
                style={{
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)',
                  border: '1px solid rgba(0,0,0,0.07)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                {/* Timer */}
                <button
                  onClick={() => { board.addTimer(); setMenu(false) }}
                  disabled={board.hasTimer}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-black/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" />
                  </svg>
                  Timer
                  {board.hasTimer && <span className="ml-auto text-xs text-gray-400">Aktiv</span>}
                </button>

                {/* AI news */}
                <button
                  onClick={() => { board.addAINews(); setMenu(false) }}
                  disabled={board.hasAINews}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-black/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 11a9 9 0 019-9M4 11a9 9 0 009 9M4 11H2M22 11h-2M12 2v2M12 20v2M6.36 6.36l-1.41-1.41M19.05 4.95l-1.41 1.41M6.36 17.64l-1.41 1.41M19.05 19.05l-1.41-1.41" />
                  </svg>
                  AI-nyheter
                  {board.hasAINews && <span className="ml-auto text-xs text-gray-400">Aktiv</span>}
                </button>

                {/* Divider */}
                <div className="my-1.5 border-t border-black/[0.06]" />

                {/* Sticky notes */}
                <div className="px-3 pb-1">
                  <p className="text-xs text-gray-400 mb-1.5">Klibbis</p>
                  <div className="flex gap-1.5">
                    {STICKY_COLORS.map(({ color, bg, label }) => (
                      <button
                        key={color}
                        onClick={() => { board.addSticky(color); setMenu(false) }}
                        className="h-6 w-6 rounded-md hover:scale-110 transition-transform"
                        style={{ background: bg, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.10)' }}
                        title={label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Board canvas ── */}
        <div
          className="relative"
          style={{ minHeight: 'calc(100vh - 8rem)' }}
          onClick={() => setMenu(false)}
        >
          {board.ready && board.widgets.map(w => {
            if (w.type === 'timer') {
              return (
                <BoardWidget
                  key={w.id}
                  id={w.id} x={w.x} y={w.y} z={w.z} pinned={w.pinned}
                  title="Timer"
                  width={220}
                  icon={
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" />
                    </svg>
                  }
                  onMove={board.move} onFront={board.front} onPin={board.pin} onClose={board.remove}
                >
                  <TimerWidget />
                </BoardWidget>
              )
            }

            if (w.type === 'ai-news') {
              return (
                <BoardWidget
                  key={w.id}
                  id={w.id} x={w.x} y={w.y} z={w.z} pinned={w.pinned}
                  title="AI-nyheter"
                  width={340}
                  icon={
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                    </svg>
                  }
                  onMove={board.move} onFront={board.front} onPin={board.pin} onClose={board.remove}
                >
                  <AINewsWidget />
                </BoardWidget>
              )
            }

            if (w.type === 'sticky') {
              return (
                <StickyNote
                  key={w.id}
                  id={w.id} x={w.x} y={w.y} z={w.z} pinned={w.pinned}
                  text={w.text} color={w.color}
                  onMove={board.move} onFront={board.front}
                  onPin={board.pin} onClose={board.remove}
                  onTextChange={board.setText}
                />
              )
            }

            return null
          })}
        </div>
      </div>
    </AppShell>
  )
}
