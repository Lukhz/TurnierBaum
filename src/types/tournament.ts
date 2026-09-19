export type TournamentType = 'league' | 'group-knockout' | 'cup'
export type TournamentStep = 1 | 2 | 3 | 4 | 5
export type MatchStage = 'league' | 'group' | 'knockout'

export interface Player {
  id: string
  name: string
  seed: number
}

export interface Match {
  id: string
  stage: MatchStage
  round: number
  order: number
  label: string
  groupId?: string
  homePlayerId: string | null
  awayPlayerId: string | null
  homeScore: number | null
  awayScore: number | null
  winnerId: string | null
}

export interface TournamentGroup {
  id: string
  name: string
  playerIds: string[]
}

export interface StandingRow {
  playerId: string
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  rank: number
}

export interface Tournament {
  id: string
  type: TournamentType | null
  step: TournamentStep
  players: Player[]
  groups: TournamentGroup[]
  matches: Match[]
  standings: StandingRow[]
  winnerId: string | null
  isReady: boolean
  isComplete: boolean
  createdAt: string
}
