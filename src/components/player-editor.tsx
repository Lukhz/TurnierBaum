import { Plus, Trash2, Users } from 'lucide-react'
import { useState } from 'react'

import type { Player } from '../types/tournament'

interface PlayerEditorProps {
  canGenerate: boolean
  minPlayers: number
  onAddPlayer: (name: string) => void
  onBack: () => void
  onGenerate: () => void
  onRemovePlayer: (playerId: string) => void
  onRenamePlayer: (playerId: string, name: string) => void
  players: Player[]
  tournamentLabel: string
}

export function PlayerEditor({
  canGenerate,
  minPlayers,
  onAddPlayer,
  onBack,
  onGenerate,
  onRemovePlayer,
  onRenamePlayer,
  players,
  tournamentLabel,
}: PlayerEditorProps) {
  const [newPlayer, setNewPlayer] = useState('')
  const [draftNames, setDraftNames] = useState<Record<string, string>>({})


  return (
    <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-500">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Spieler erfassen</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Modus: {tournamentLabel} · mindestens {minPlayers} Teilnehmer
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={newPlayer}
            onChange={(event) => setNewPlayer(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onAddPlayer(newPlayer)
                setNewPlayer('')
              }
            }}
            className="min-h-12 flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            placeholder="Spieler oder Team hinzufügen"
          />
          <button
            type="button"
            onClick={() => {
              onAddPlayer(newPlayer)
              setNewPlayer('')
            }}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" /> Hinzufügen
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {players.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Noch keine Teilnehmer hinterlegt.
            </div>
          ) : (
            players.map((player, index) => (
              <div
                key={player.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 px-4 py-3 sm:flex-row sm:items-center dark:border-slate-800"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  {index + 1}
                </div>
                <input
                  value={draftNames[player.id] ?? player.name}
                  onChange={(event) =>
                    setDraftNames((current) => ({
                      ...current,
                      [player.id]: event.target.value,
                    }))
                  }
                  onBlur={() => {
                    const nextName = (draftNames[player.id] ?? player.name).trim()
                    const isDuplicate = players.some(
                      (entry) => entry.id !== player.id && entry.name.trim().toLowerCase() === nextName.toLowerCase(),
                    )

                    if (nextName.length < 2 || isDuplicate) {
                      setDraftNames((current) => ({
                        ...current,
                        [player.id]: player.name,
                      }))
                      return
                    }

                    onRenamePlayer(player.id, nextName)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.currentTarget.blur()
                    }
                  }}
                  className="min-h-11 flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                />
                <button
                  type="button"
                  aria-label={`${player.name} entfernen`}
                  onClick={() => onRemovePlayer(player.id)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-rose-200 px-4 py-2 font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="h-4 w-4" /> Entfernen
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <aside className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Validierung</h3>
        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <li>• Namen sollten mindestens 2 Zeichen lang sein.</li>
          <li>• Doppelte Teamnamen werden blockiert.</li>
          <li>• Für den gewählten Modus werden mindestens {minPlayers} Teilnehmer benötigt.</li>
        </ul>

        <div className="rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-sm dark:bg-slate-950 dark:text-slate-200">
          Aktuell erfasst: <span className="font-semibold">{players.length}</span>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:disabled:bg-slate-700"
          >
            Turnier generieren
          </button>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Zurück zur Moduswahl
          </button>
        </div>
      </aside>
    </section>
  )
}
