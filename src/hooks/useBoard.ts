'use client'

import { useState, useEffect, useCallback } from 'react'

export type StickyColor = 'yellow' | 'pink' | 'cyan' | 'lime' | 'purple'
export type WidgetType = 'timer' | 'ai-news' | 'sticky'

interface Base {
  id: string
  type: WidgetType
  x: number
  y: number
  z: number
  pinned: boolean
}

export interface TimerW  extends Base { type: 'timer' }
export interface AINewsW extends Base { type: 'ai-news' }
export interface StickyW extends Base { type: 'sticky'; text: string; color: StickyColor }

export type BoardWidget = TimerW | AINewsW | StickyW

interface BoardState { widgets: BoardWidget[]; nextZ: number }

const KEY = 'tidklocka-board-v1'

const DEFAULTS: BoardState = {
  nextZ: 20,
  widgets: [
    { id: 'timer-0',   type: 'timer',   x: 24,  y: 24,  z: 1, pinned: false },
    { id: 'ainews-0',  type: 'ai-news', x: 320, y: 24,  z: 2, pinned: false },
    { id: 'sticky-0',  type: 'sticky',  x: 24,  y: 240, z: 3, pinned: false, text: 'Dubbelklicka för att redigera', color: 'yellow' },
    { id: 'sticky-1',  type: 'sticky',  x: 230, y: 300, z: 4, pinned: false, text: '', color: 'pink' },
  ],
}

export function useBoard() {
  const [state, setState] = useState<BoardState>(DEFAULTS)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setState(JSON.parse(raw))
    } catch {}
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  }, [state, ready])

  const front = useCallback((id: string) =>
    setState(p => ({ ...p, nextZ: p.nextZ + 1, widgets: p.widgets.map(w => w.id === id ? { ...w, z: p.nextZ + 1 } : w) }))
  , [])

  const move = useCallback((id: string, x: number, y: number) =>
    setState(p => ({ ...p, widgets: p.widgets.map(w => w.id === id ? { ...w, x, y } : w) }))
  , [])

  const pin = useCallback((id: string) =>
    setState(p => ({ ...p, widgets: p.widgets.map(w => w.id === id ? { ...w, pinned: !w.pinned } : w) }))
  , [])

  const remove = useCallback((id: string) =>
    setState(p => ({ ...p, widgets: p.widgets.filter(w => w.id !== id) }))
  , [])

  const setText = useCallback((id: string, text: string) =>
    setState(p => ({ ...p, widgets: p.widgets.map(w => w.id === id && w.type === 'sticky' ? { ...w, text } : w) }))
  , [])

  const addSticky = useCallback((color: StickyColor) => {
    setState(p => {
      const nextZ = p.nextZ + 1
      const offset = p.widgets.filter(w => w.type === 'sticky').length * 20
      return { ...p, nextZ, widgets: [...p.widgets, { id: `sticky-${Date.now()}`, type: 'sticky' as const, x: 80 + offset, y: 80 + offset, z: nextZ, pinned: false, text: '', color }] }
    })
  }, [])

  const addTimer = useCallback(() => {
    if (state.widgets.some(w => w.type === 'timer')) return
    setState(p => ({ ...p, nextZ: p.nextZ + 1, widgets: [...p.widgets, { id: `timer-${Date.now()}`, type: 'timer' as const, x: 60, y: 60, z: p.nextZ + 1, pinned: false }] }))
  }, [state.widgets])

  const addAINews = useCallback(() => {
    if (state.widgets.some(w => w.type === 'ai-news')) return
    setState(p => ({ ...p, nextZ: p.nextZ + 1, widgets: [...p.widgets, { id: `ainews-${Date.now()}`, type: 'ai-news' as const, x: 340, y: 60, z: p.nextZ + 1, pinned: false }] }))
  }, [state.widgets])

  return {
    widgets: state.widgets,
    ready,
    front, move, pin, remove, setText,
    addSticky, addTimer, addAINews,
    hasTimer: state.widgets.some(w => w.type === 'timer'),
    hasAINews: state.widgets.some(w => w.type === 'ai-news'),
  }
}
