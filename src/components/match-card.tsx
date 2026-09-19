import type { Match, Player } from '../types/tournament'
import { getPlayerName } from '../utils/tournament'

interface MatchCardProps {
  match: Match
  onScoreChange: (matchId: string, side: 'homeScore' | 'awayScore', value: string) => void
  players: Player[]
}

export function MatchCard({ match, onScoreChange, players }: MatchCardProps) {
  const homeName = getPlayerName(players, match.homePlayerId)
  const awayName = getPlayerName(players, match.awayPlayerId)
  const isPending = !match.homePlayerId || !match.awayPlayerId
  const isInvalidKnockoutDraw =
    match.stage === 'knockout' &&
    match.homeScore !== null &&
    match.awayScore !== null &&
    match.homeScore === match.awayScore

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{match.label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {match.stage === 'group' ? 'Gruppenphase' : match.stage === 'league' ? 'Ligaspiel' : 'K.-o.-Spiel'}
          </p>
        </div>
        {match.winnerId ? (
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
            Sieger: {getPlayerName(players, match.winnerId)}
          </span>
        ) : null}
      </div>

      <div className="space-y-3">
        {[
          { label: homeName, score: match.homeScore, side: 'homeScore' as const },
          { label: awayName, score: match.awayScore, side: 'awayScore' as const },
        ].map((entry) => (
          <label
            key={entry.side}
            className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900"
          >
            <span className="truncate font-medium text-slate-800 dark:text-slate-100">{entry.label}</span>
            <input
              type="number"
              min="0"
              step="1"
              aria-label={`${entry.label} ${entry.side === 'homeScore' ? 'Heimscore' : 'Auswärtsscore'}`}
              value={entry.score ?? ''}
              disabled={isPending}
              onChange={(event) => onScoreChange(match.id, entry.side, event.target.value)}
              className="h-11 w-20 rounded-2xl border border-slate-300 bg-white px-3 text-center text-slate-900 outline-none transition focus:border-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:disabled:bg-slate-800"
            />
          </label>
        ))}
      </div>

      {isPending ? (
        <p className="mt-3 text-xs text-amber-600 dark:text-amber-300">Teilnehmer stehen nach der vorherigen Runde fest.</p>
      ) : null}
      {isInvalidKnockoutDraw ? (
        <p className="mt-3 text-xs text-rose-600 dark:text-rose-300">Im K.-o.-Modus sind keine Unentschieden erlaubt.</p>
      ) : null}
    </article>
  )
}
