interface BadgeProps {
  label: string
  color?: string
}

export function Badge({ label, color = '#3B82F6' }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `${color}22`,
        color: color,
        borderColor: `${color}44`,
        border: '1px solid',
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  )
}
