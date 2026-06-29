'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { WeeklyData } from '@/types'

interface WeeklyBarChartProps {
  data: WeeklyData[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const hours = (payload[0].value / 60).toFixed(1)
  const mins = payload[0].value % 60
  const h = Math.floor(payload[0].value / 60)
  return (
    <div className="rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-gray-100 dark:border-slate-700 px-4 py-3">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className="text-base font-bold text-gray-900 dark:text-white">
        {h > 0 ? `${h} tim ` : ''}{mins > 0 ? `${mins} min` : h === 0 ? '0 min' : ''}
      </p>
    </div>
  )
}

export function WeeklyBarChart({ data }: WeeklyBarChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 dark:text-slate-500 text-sm">
        Inga data för denna period
      </div>
    )
  }

  const maxVal = Math.max(...data.map(d => d.minutes))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} vertical={false} />
        <XAxis
          dataKey="weekLabel"
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={v => `${Math.floor(v / 60)}t`}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6', radius: 8 }} />
        <Bar dataKey="minutes" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((entry, idx) => (
            <Cell
              key={idx}
              fill={entry.minutes === maxVal ? '#2563eb' : '#93c5fd'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
