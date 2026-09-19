import type { LucideIcon } from 'lucide-react'
import type { TournamentType } from '../types/tournament'

interface ModeCardProps {
  description: string
  formatHint: string
  icon: LucideIcon
  isSelected: boolean
  onSelect: (type: TournamentType) => void
  title: string
  type: TournamentType
}

export function ModeCard({
  description,
  formatHint,
  icon: Icon,
  isSelected,
  onSelect,
  title,
  type,
}: ModeCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      className={`flex h-full flex-col rounded-3xl border p-6 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
        isSelected
          ? 'border-fuchsia-500 bg-fuchsia-500/10 shadow-lg ring-2 ring-fuchsia-400/50'
          : 'border-slate-200 bg-white hover:border-pink-300 dark:border-slate-800 dark:bg-slate-950'
      }`}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-fuchsia-500">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{description}</p>
      <p className="mt-4 text-sm font-medium text-fuchsia-600 dark:text-fuchsia-300">{formatHint}</p>
    </button>
  )
}
