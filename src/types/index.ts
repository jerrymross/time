export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  is_active: boolean
  created_at: string
}

export interface TimeEntry {
  id: string
  user_id: string
  category_id: string | null
  task_description: string | null
  entry_date: string        // YYYY-MM-DD
  start_time: string        // HH:MM:SS
  end_time: string          // HH:MM:SS
  duration_minutes: number
  created_at: string
  updated_at: string
  categories?: Category | null
}

export interface ActiveTimer {
  id: string
  user_id: string
  started_at: string        // ISO timestamptz
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  monthly_goal_hours: number
  created_at: string
  updated_at: string
}

// Formulärtyper
export interface StopTimerFormData {
  category_id: string
  task_description: string
  entry_date: string
  start_time: string
  end_time: string
  duration_minutes: number
}

export interface ManualEntryFormData {
  category_id: string
  task_description: string
  entry_date: string
  start_time: string
  end_time: string
  duration_minutes: number
}

export interface TimeEntryFormData {
  category_id: string
  task_description: string
  entry_date: string
  start_time: string
  end_time: string
  duration_minutes: number
}

// Rapportdata
export interface WeeklyData {
  week: string
  weekLabel: string
  minutes: number
}

export interface CategoryData {
  name: string
  minutes: number
  color: string
  percentage: number
}

export interface MonthlyReport {
  totalMinutes: number
  prevMonthMinutes: number
  weeklyData: WeeklyData[]
  categoryData: CategoryData[]
  commonTasks: { task: string; count: number; minutes: number }[]
}

// Toast
export interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

// To-do
export type TodoPriority = 'hög' | 'medel' | 'låg'

export interface Todo {
  id: string
  user_id: string
  title: string
  description: string | null
  priority: TodoPriority
  deadline: string | null   // YYYY-MM-DD
  completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface TodoFormData {
  title: string
  description: string
  priority: TodoPriority
  deadline: string
}
