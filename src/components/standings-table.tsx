import type { Player, StandingRow } from '../types/tournament'
import { getPlayerName } from '../utils/tournament'

interface StandingsTableProps {
  players: Player[]
  rows: StandingRow[]
  title: string
}

export function StandingsTable({ players, rows, title }: StandingsTableProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {rows.length} Teilnehmer
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Teilnehmer</th>
              <th className="px-3 py-2">Sp.</th>
              <th className="px-3 py-2">S</th>
              <th className="px-3 py-2">U</th>
              <th className="px-3 py-2">N</th>
              <th className="px-3 py-2">TD</th>
              <th className="px-3 py-2">Pkt.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.playerId} className="border-b border-slate-100 last:border-none dark:border-slate-900">
                <td className="px-3 py-3 font-semibold text-slate-900 dark:text-slate-50">{row.rank}</td>
                <td className="px-3 py-3 text-slate-800 dark:text-slate-100">{getPlayerName(players, row.playerId)}</td>
                <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{row.played}</td>
                <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{row.wins}</td>
                <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{row.draws}</td>
                <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{row.losses}</td>
                <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{row.goalDifference}</td>
                <td className="px-3 py-3 font-semibold text-fuchsia-600 dark:text-fuchsia-300">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
