import { create } from 'zustand'

import type { Player, Tournament, TournamentStep, TournamentType } from '../types/tournament'
import {
  buildTournament,
  canGenerateTournament,
  createEmptyTournament,
  createPlayer,
  recalculateTournament,
  updateMatchScore,
} from '../utils/tournament'

interface TournamentStore {
  tournament: Tournament
  setStep: (step: TournamentStep) => void
  setType: (type: TournamentType) => void
  addPlayer: (name: string) => void
  removePlayer: (playerId: string) => void
  renamePlayer: (playerId: string, name: string) => void
  generateTournament: () => void
  setMatchScore: (matchId: string, side: 'homeScore' | 'awayScore', value: string) => void
  resetTournament: () => void
}

export const useTournamentStore = create<TournamentStore>((set) => ({
  tournament: createEmptyTournament(),
  setStep: (step) =>
    set((state) => ({
      tournament: {
        ...state.tournament,
        step,
      },
    })),
  setType: (type) =>
    set((state) => {
      const nextPlayers = state.tournament.players.map((player, index) => ({
        ...player,
        seed: index + 1,
      }))

      return {
        tournament: {
          ...createEmptyTournament(),
          step: 3,
          type,
          players: nextPlayers,
        },
      }
    }),
  addPlayer: (name) =>
    set((state) => {
      const trimmedName = name.trim()
      if (trimmedName.length < 2) return state

      const isDuplicate = state.tournament.players.some(
        (player) => player.name.trim().toLowerCase() === trimmedName.toLowerCase(),
      )
      if (isDuplicate) return state

      const players = [...state.tournament.players, createPlayer(trimmedName, state.tournament.players.length + 1)]
      return {
        tournament: {
          ...state.tournament,
          players,
        },
      }
    }),
  removePlayer: (playerId) =>
    set((state) => ({
      tournament: {
        ...state.tournament,
        players: state.tournament.players
          .filter((player) => player.id !== playerId)
          .map((player, index) => ({ ...player, seed: index + 1 })),
      },
    })),
  renamePlayer: (playerId, name) =>
    set((state) => {
      const players = state.tournament.players.map((player): Player =>
        player.id === playerId ? { ...player, name } : player,
      )

      return {
        tournament: {
          ...state.tournament,
          players,
        },
      }
    }),
  generateTournament: () =>
    set((state) => {
      if (!state.tournament.type || !canGenerateTournament(state.tournament.type, state.tournament.players)) {
        return state
      }

      return {
        tournament: buildTournament(state.tournament.type, state.tournament.players),
      }
    }),
  setMatchScore: (matchId, side, value) =>
    set((state) => ({
      tournament: updateMatchScore(state.tournament, matchId, side, value),
    })),
  resetTournament: () => set({ tournament: createEmptyTournament() }),
}))

export function useTournamentCompletion() {
  return useTournamentStore((state) => recalculateTournament(state.tournament))
}
