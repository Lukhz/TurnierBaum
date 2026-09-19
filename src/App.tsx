import { ArrowRight, CircleGauge, Crown, GitBranch, RotateCcw, Swords, Trophy, Users } from 'lucide-react'

import { MatchCard } from './components/match-card'
import { ModeCard } from './components/mode-card'
import { PlayerEditor } from './components/player-editor'
import { StandingsTable } from './components/standings-table'
import { useTournamentStore } from './store/tournament-store'
import type { Match, TournamentType } from './types/tournament'
import {
  canGenerateTournament,
  getGroupStandings,
  getMatchesByRound,
  getPlayerName,
  getTournamentMeta,
  TOURNAMENT_TYPE_META,
} from './utils/tournament'

const STEPS = [
  { id: 1, label: 'Willkommen' },
  { id: 2, label: 'Modus' },
  { id: 3, label: 'Spieler' },
  { id: 4, label: 'Turnier' },
  { id: 5, label: 'Ergebnis' },
] as const

const MODE_ICONS = {
  league: CircleGauge,
  'group-knockout': GitBranch,
  cup: Trophy,
} as const

function App() {
  const {
    tournament,
    addPlayer,
    generateTournament,
    removePlayer,
    renamePlayer,
    resetTournament,
    setMatchScore,
    setStep,
    setType,
  } = useTournamentStore()

  const selectedMeta = getTournamentMeta(tournament.type)
  const canGenerate = canGenerateTournament(tournament.type, tournament.players)
  const leagueMatches = tournament.matches.filter((match) => match.stage === 'league')
  const groupMatches = tournament.matches.filter((match) => match.stage === 'group')
  const knockoutMatches = tournament.matches.filter((match) => match.stage === 'knockout')
  const championName = getPlayerName(tournament.players, tournament.winnerId)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-500">TurnierBaum</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-slate-50 sm:text-4xl">
                Turniere vom Start bis zur Siegerehrung steuern
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
                Ein React- und TypeScript-Grundgerüst für Liga-, Gruppen-K.-o.- und Pokal-Turniere mit 5-stufigem User Flow.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[22rem]">
              <MetricCard icon={Users} label="Spieler" value={`${tournament.players.length}`} />
              <MetricCard
                icon={Swords}
                label="Spiele"
                value={`${tournament.matches.length}`}
              />
              <MetricCard
                icon={Crown}
                label="Status"
                value={tournament.isComplete ? 'Fertig' : `Schritt ${tournament.step}/5`}
              />
            </div>
          </div>

          <nav className="mt-6 grid gap-3 md:grid-cols-5">
            {STEPS.map((step) => {
              const isActive = tournament.step === step.id
              const isDone = tournament.step > step.id
              const canAccessStep = step.id <= tournament.step || (step.id === 5 && tournament.isComplete)

              return (
                <button
                  key={step.id}
                  type="button"
                  disabled={!canAccessStep}
                  onClick={() => {
                    if (canAccessStep) {
                      setStep(step.id)
                    }
                  }}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-500 text-white'
                      : isDone
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300'
                        : 'border-slate-200 bg-white text-slate-500 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">Schritt {step.id}</p>
                  <p className="mt-1 font-semibold">{step.label}</p>
                </button>
              )
            })}
          </nav>
        </header>

        <main className="mt-6 flex-1">
          {tournament.step === 1 ? (
            <section className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <span className="inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                  Seite 1 · Willkommen
                </span>
                <h2 className="mt-5 text-4xl font-bold text-slate-950 dark:text-slate-50">Turniermodus wählen, Teilnehmer eintragen, Ergebnisse pflegen.</h2>
                <p className="mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-300">
                  Das Setup liefert eine einsatzbereite Single-Page-WebApp mit TypeScript-Typen, globalem Zustand via Zustand, Tailwind-Styling und visuellen Modulen für alle drei Turnierarten.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500"
                  >
                    Starten <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={resetTournament}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    Reset <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                <FeatureCard title="Liga" description="Automatische Tabelle, Punkte und Tordifferenz nach jedem Spieltag." />
                <FeatureCard title="Gruppen K.-O." description="Vorrunde in Gruppen mit direkter Qualifikation der Top-Teams." />
                <FeatureCard title="Pokal" description="Direkter Turnierbaum mit automatischem Weiterkommen im K.-o.-Raster." />
              </div>
            </section>
          ) : null}

          {tournament.step === 2 ? (
            <section className="space-y-6">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                  Seite 2 · Modus-Auswahl
                </span>
                <h2 className="mt-4 text-3xl font-bold text-slate-950 dark:text-slate-50">Welcher Turniermodus soll abgebildet werden?</h2>
                <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                  Die Auswahl definiert Mindestanzahl, Turnierlogik und Visualisierung für die spätere Ergebnisansicht.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {(Object.entries(TOURNAMENT_TYPE_META) as [TournamentType, (typeof TOURNAMENT_TYPE_META)[TournamentType]][]).map(
                  ([type, meta]) => {
                    const Icon = MODE_ICONS[type]
                    return (
                      <ModeCard
                        key={type}
                        type={type}
                        icon={Icon}
                        title={meta.title}
                        description={meta.description}
                        formatHint={meta.formatHint}
                        isSelected={tournament.type === type}
                        onSelect={setType}
                      />
                    )
                  },
                )}
              </div>
            </section>
          ) : null}

          {tournament.step === 3 && selectedMeta ? (
            <PlayerEditor
              tournamentLabel={selectedMeta.title}
              players={tournament.players}
              minPlayers={selectedMeta.minPlayers}
              canGenerate={canGenerate}
              onAddPlayer={addPlayer}
              onRemovePlayer={removePlayer}
              onRenamePlayer={renamePlayer}
              onGenerate={generateTournament}
              onBack={() => setStep(2)}
            />
          ) : null}

          {tournament.step === 4 ? (
            <section className="space-y-6">
              <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <span className="inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                    Seite 4 · Turnierbaum & Ergebnisse
                  </span>
                  <h2 className="mt-4 text-3xl font-bold text-slate-950 dark:text-slate-50">{selectedMeta?.title ?? 'Turnier'} verwalten</h2>
                  <p className="mt-3 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
                    Ergebnisse werden unmittelbar im globalen Zustand gespeichert und aktualisieren Tabellen, Brackets und Sieger automatisch.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    Spieler anpassen
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    disabled={!tournament.isComplete}
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:disabled:bg-slate-700"
                  >
                    Zum Ergebnis
                  </button>
                </div>
              </div>

              {tournament.type === 'league' ? (
                <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                  <div className="space-y-4">
                    {leagueMatches.map((match) => (
                      <MatchCard key={match.id} match={match} players={tournament.players} onScoreChange={setMatchScore} />
                    ))}
                  </div>
                  <StandingsTable players={tournament.players} rows={tournament.standings} title="Ligatabelle" />
                </div>
              ) : null}

              {tournament.type === 'group-knockout' ? (
                <div className="space-y-6">
                  <div className="grid gap-6 xl:grid-cols-2">
                    {tournament.groups.map((group) => (
                      <div key={group.id} className="space-y-4">
                        <StandingsTable
                          players={tournament.players}
                          rows={getGroupStandings(tournament, group.id)}
                          title={group.name}
                        />
                        <div className="grid gap-4">
                          {groupMatches
                            .filter((match) => match.groupId === group.id)
                            .map((match) => (
                              <MatchCard key={match.id} match={match} players={tournament.players} onScoreChange={setMatchScore} />
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <KnockoutBracket matches={knockoutMatches} players={tournament.players} onScoreChange={setMatchScore} title="K.-o.-Runde" />
                </div>
              ) : null}

              {tournament.type === 'cup' ? (
                <KnockoutBracket matches={knockoutMatches} players={tournament.players} onScoreChange={setMatchScore} title="Pokalbaum" />
              ) : null}
            </section>
          ) : null}

          {tournament.step === 5 && tournament.isComplete ? (
            <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                  Seite 5 · Ergebnis & Reset
                </span>
                <h2 className="mt-4 text-3xl font-bold text-slate-950 dark:text-slate-50">{tournament.winnerId ? `${championName} gewinnt!` : 'Turnier läuft noch'}</h2>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  Abschlussansicht mit Siegerkachel, Ergebnistabelle und Reset für ein neues Turnier.
                </p>

                <div className="mt-8 rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 p-6 text-white shadow-lg">
                  <p className="text-sm uppercase tracking-[0.25em] text-white/80">Champion</p>
                  <p className="mt-3 text-3xl font-bold">{tournament.winnerId ? championName : 'Noch offen'}</p>
                  <p className="mt-3 text-sm text-white/80">Modus: {selectedMeta?.title ?? 'Nicht gewählt'}</p>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={resetTournament}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                  >
                    Neues Turnier <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    Ergebnisse prüfen
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {tournament.type === 'league' ? (
                  <StandingsTable players={tournament.players} rows={tournament.standings} title="Abschlusstabelle" />
                ) : null}
                {tournament.type === 'group-knockout' ? (
                  <div className="grid gap-6">
                    {tournament.groups.map((group) => (
                      <StandingsTable
                        key={group.id}
                        players={tournament.players}
                        rows={getGroupStandings(tournament, group.id)}
                        title={`${group.name} · Endstand`}
                      />
                    ))}
                  </div>
                ) : null}
                {tournament.type !== 'league' ? (
                  <KnockoutBracket matches={knockoutMatches} players={tournament.players} onScoreChange={setMatchScore} title="Finaler Baum" />
                ) : null}
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  )
}

interface MetricCardProps {
  icon: typeof Users
  label: string
  value: string
}

function MetricCard({ icon: Icon, label, value }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-indigo-500/10 p-2 text-indigo-500">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{value}</p>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ description, title }: { description: string; title: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  )
}

interface KnockoutBracketProps {
  matches: Match[]
  onScoreChange: (matchId: string, side: 'homeScore' | 'awayScore', value: string) => void
  players: Parameters<typeof MatchCard>[0]['players']
  title: string
}

function KnockoutBracket({ matches, onScoreChange, players, title }: KnockoutBracketProps) {
  const rounds = getMatchesByRound(matches)

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">{title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Mehrspaltige Ansicht der K.-o.-Runden mit automatischer Siegerlogik.</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {rounds.map((entry) => (
          <div key={entry.round} className="space-y-4">
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-100">
              Runde {entry.round}
            </div>
            {entry.matches.map((match) => (
              <MatchCard key={match.id} match={match} players={players} onScoreChange={onScoreChange} />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

export default App
