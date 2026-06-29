'use client'

import { useRef, useCallback, useState } from 'react'
import { StickyColor } from '@/hooks/useBoard'

const COLORS: Record<StickyColor, { bg: string; border: string; text: string; fold: string }> = {
  yellow: { bg: '#FEF08A', border: '#FDE047', text: '#713F12', fold: '#FDE047' },
  pink:   { bg: '#FBCFE8', border: '#F9A8D4', text: '#831843', fold: '#F9A8D4' },
  cyan:   { bg: '#A5F3FC', border: '#67E8F9', text: '#164E63', fold: '#67E8F9' },
  lime:   { bg: '#D9F99D', border: '#BEF264', text: '#365314', fold: '#BEF264' },
  purple: { bg: '#DDD6FE', border: '#C4B5FD', text: '#4C1D95', fold: '#C4B5FD' },
}

interface StickyNoteProps {
  id: string
  x: number
  y: number
  z: number
  pinned: boolean
  text: string
  color: StickyColor
  onMove: (id: string, x: number, y: number) => void
  onFront: (id: string) => void
  onPin: (id: string) => void
  onClose: (id: string) => void
  onTextChange: (id: string, text: string) => void
}

export function StickyNote({
  id, x, y, z, pinned, text, color,
  onMove, onFront, onPin, onClose, onTextChange,
}: StickyNoteProps) {
  const drag = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(text)
  const c = COLORS[color]

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (pinned || editing) return
    e.preventDefault()
    onFront(id)
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { sx: e.clientX, sy: e.clientY, px: x, py: y }
  }, [pinned, editing, id, x, y, onFront])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const nx = Math.max(0, drag.current.px + (e.clientX - drag.current.sx))
    const ny = Math.max(0, drag.current.py + (e.clientY - drag.current.sy))
    onMove(id, nx, ny)
  }, [id, onMove])

  const onPointerUp = useCallback(() => { drag.current = null }, [])

  const commitEdit = () => {
    onTextChange(id, draft)
    setEditing(false)
  }

  return (
    <div
      className="absolute"
      style={{ left: x, top: y, zIndex: z, width: 192 }}
      onMouseDown={() => onFront(id)}
    >
      <div
        className={`relative rounded-sm shadow-xl ${pinned ? 'cursor-default' : editing ? 'cursor-text' : 'cursor-grab active:cursor-grabbing'}`}
        style={{ background: c.bg, border: `1px solid ${c.border}` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={() => { if (!editing) { setDraft(text); setEditing(true) } }}
      >
        {/* Dog-ear fold (top right corner) */}
        <div
          className="absolute top-0 right-0"
          style={{
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: '0 20px 20px 0',
            borderColor: `transparent ${c.fold} transparent transparent`,
            filter: 'brightness(0.85)',
          }}
        />

        {/* Top action bar */}
        <div className="flex items-center justify-between px-2 pt-1.5 pb-0.5">
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={() => onPin(id)}
            className="rounded p-0.5 transition-opacity opacity-40 hover:opacity-80"
            style={{ color: c.text }}
            title={pinned ? 'Lossa' : 'Nåla fast'}
          >
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill={pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="17" x2="12" y2="22" />
              <path d="M5 17h14v-1.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V6h1a2 2 0 000-4H8a2 2 0 000 4h1v4.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24V17z" />
            </svg>
          </button>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={() => onClose(id)}
            className="rounded p-0.5 opacity-30 hover:opacity-70 transition-opacity"
            style={{ color: c.text }}
          >
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content area */}
        <div className="px-3 pb-3 pt-1 min-h-[80px]">
          {editing ? (
            <textarea
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={commitEdit}
              onPointerDown={e => e.stopPropagation()}
              onKeyDown={e => { if (e.key === 'Escape') commitEdit() }}
              rows={4}
              className="w-full resize-none bg-transparent outline-none text-sm leading-snug"
              style={{ color: c.text, fontFamily: 'DM Sans, sans-serif' }}
              placeholder="Skriv något..."
            />
          ) : (
            <p
              className="text-sm leading-snug whitespace-pre-wrap break-words min-h-[64px]"
              style={{ color: c.text }}
            >
              {text || <span style={{ opacity: 0.4 }}>Dubbelklicka för att redigera</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
