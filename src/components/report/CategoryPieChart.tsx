'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CategoryData } from '@/types'
import { formatDuration } from '@/lib/utils'

interface CategoryPieChartProps {
  data: CategoryData[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as CategoryData
  return (
    <div className="rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-gray-100 dark:border-slate-700 px-4 py-3">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-0.5">{d.name}</p>
      <p className="text-base font-bold" style={{ color: d.color }}>{formatDuration(d.minutes)}</p>
      <p className="text-xs text-gray-400">{d.percentage.toFixed(1)}%</p>
    </div>
  )
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 dark:text-slate-500 text-sm">
        Inga data för denna period
      </div>
    )
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="minutes"
          >
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {data.map((d, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-gray-700 dark:text-gray-300">{d.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 dark:text-gray-400">{formatDuration(d.minutes)}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200 w-12 text-right">
                {d.percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
