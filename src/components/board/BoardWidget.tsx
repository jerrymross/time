'use client'

import { useRef, useCallback, ReactNode } from 'react'

interface BoardWidgetProps {
  id: string
  x: number
  y: number
  z: number
  pinned: boolean
  title: string
  icon?: ReactNode
  children: ReactNode
  width?: number
  onMove: (id: string, x: number, y: number) => void
  onFront: (id: string) => void
  onPin: (id: string) => void
  onClose: (id: string) => void
}

export function BoardWidget({
  id, x, y, z, pinned, title, icon, children,
  width = 284,
  onMove, onFront, onPin, onClose,
}: BoardWidgetProps) {
  const drag = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null)

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (pinned) return
    e.preventDefault()
    onFront(id)
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { sx: e.clientX, sy: e.clientY, px: x, py: y }
  }, [pinned, id, x, y, onFront])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const nx = Math.max(0, drag.current.px + (e.clientX - drag.current.sx))
    const ny = Math.max(0, drag.current.py + (e.clientY - drag.current.sy))
    onMove(id, nx, ny)
  }, [id, onMove])

  const onPointerUp = useCallback(() => { drag.current = null }, [])

  return (
    <div
      className="absolute"
      style={{ left: x, top: y, zIndex: z, width }}
      onMouseDown={() => onFront(id)}
    >
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Header / drag handle */}
        <div
          className={`flex items-center gap-2 px-3 py-2.5 ${pinned ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
          style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {/* Drag dots */}
          <div className="flex flex-col gap-0.5 opacity-30">
            <div className="flex gap-0.5">
              <span className="h-1 w-1 rounded-full bg-white" />
              <span className="h-1 w-1 rounded-full bg-white" />
            </div>
            <div className="flex gap-0.5">
              <span className="h-1 w-1 rounded-full bg-white" />
              <span className="h-1 w-1 rounded-full bg-white" />
            </div>
          </div>

          {icon && <span className="text-white/50">{icon}</span>}
          <span className="flex-1 text-xs font-medium text-white/50 select-none tracking-wide uppercase">{title}</span>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={() => onPin(id)}
              className={`rounded-md p-1 transition-colors ${pinned ? 'text-signal' : 'text-white/25 hover:text-white/60'}`}
              title={pinned ? 'Lossa' : 'Nåla fast'}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="17" x2="12" y2="22" />
                <path d="M5 17h14v-1.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V6h1a2 2 0 000-4H8a2 2 0 000 4h1v4.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24V17z" />
              </svg>
            </button>
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={() => onClose(id)}
              className="rounded-md p-1 text-white/25 hover:text-red-400 transition-colors"
              title="Ta bort widget"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  )
}
