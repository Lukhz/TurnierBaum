import type {
  Match,
  Player,
  StandingRow,
  Tournament,
  TournamentGroup,
  TournamentType,
} from '../types/tournament'

export const TOURNAMENT_TYPE_META: Record<
  TournamentType,
  {
    title: string
    description: string
    minPlayers: number
    formatHint: string
  }
> = {
  league: {
    title: 'Liga',
    description: 'Jeder gegen jeden mit automatischer Tabelle und Punktewertung.',
    minPlayers: 3,
    formatHint: 'Ideal für vollständige Vergleichbarkeit aller Teilnehmer.',
  },
  'group-knockout': {
    title: 'Gruppen K.-O.',
    description: 'Gruppenphase mit direkter Qualifikation in die Finalrunde.',
    minPlayers: 4,
    formatHint: 'Kombiniert faire Vorrunde mit spannender Endrunde.',
  },
  cup: {
    title: 'Pokal',
    description: 'Klassischer Direkt-K.-O.-Baum mit automatischem Weiterkommen.',
    minPlayers: 2,
    formatHint: 'Perfekt für schnelle Turniere mit klarem Siegerpfad.',
  },
}

export function createEmptyTournament(): Tournament {
  return {
    id: crypto.randomUUID(),
    type: null,
    step: 1,
    players: [],
    groups: [],
    matches: [],
    standings: [],
    winnerId: null,
    isReady: false,
    isComplete: false,
    createdAt: new Date().toISOString(),
  }
}

export function getTournamentMeta(type: TournamentType | null) {
  return type ? TOURNAMENT_TYPE_META[type] : null
}

export function getPlayerName(players: Player[], playerId: string | null) {
  if (!playerId) return 'Offen'
  return players.find((player) => player.id === playerId)?.name ?? 'Offen'
}

export function createPlayer(name: string, seed: number): Player {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    seed,
  }
}

export function canGenerateTournament(type: TournamentType | null, players: Player[]) {
  if (!type) return false
  const minPlayers = TOURNAMENT_TYPE_META[type].minPlayers
  return players.length >= minPlayers && players.every((player) => player.name.trim().length >= 2)
}

export function buildTournament(type: TournamentType, players: Player[]): Tournament {
  const base = createEmptyTournament()
  const sanitizedPlayers = players.map((player, index) => ({
    ...player,
    name: player.name.trim(),
    seed: index + 1,
  }))

  if (type === 'league') {
    const matches = createRoundRobinMatches(sanitizedPlayers, 'league')
    return recalculateTournament({
      ...base,
      type,
      step: 4,
      players: sanitizedPlayers,
      matches,
      standings: calculateStandings(sanitizedPlayers, matches),
      isReady: true,
    })
  }

  if (type === 'cup') {
    const matches = syncKnockoutMatches(createKnockoutSkeleton(sanitizedPlayers.length), sanitizedPlayers.map((player) => player.id))
    return recalculateTournament({
      ...base,
      type,
      step: 4,
      players: sanitizedPlayers,
      matches,
      isReady: true,
    })
  }

  const groups = createGroups(sanitizedPlayers)
  const groupMatches = groups.flatMap((group) =>
    createRoundRobinMatches(
      group.playerIds
        .map((playerId) => sanitizedPlayers.find((player) => player.id === playerId))
        .filter((player): player is Player => Boolean(player)),
      'group',
      group.id,
      group.name,
    ),
  )
  const qualifierCount = groups.length * 2
  const knockoutMatches = createKnockoutSkeleton(qualifierCount)

  return recalculateTournament({
    ...base,
    type,
    step: 4,
    players: sanitizedPlayers,
    groups,
    matches: [...groupMatches, ...knockoutMatches],
    isReady: true,
  })
}

export function recalculateTournament(tournament: Tournament): Tournament {
  if (!tournament.type) return tournament

  if (tournament.type === 'league') {
    const standings = calculateStandings(tournament.players, tournament.matches)
    const complete = tournament.matches.every(isMatchComplete)
    return {
      ...tournament,
      standings,
      winnerId: complete ? standings[0]?.playerId ?? null : null,
      isComplete: complete,
    }
  }

  if (tournament.type === 'cup') {
    const matches = syncKnockoutMatches(tournament.matches, tournament.players.map((player) => player.id))
    const finalMatch = getFinalMatch(matches)
    return {
      ...tournament,
      matches,
      standings: [],
      winnerId: finalMatch?.winnerId ?? null,
      isComplete: Boolean(finalMatch?.winnerId),
    }
  }

  const groupMatches = tournament.matches.filter((match) => match.stage === 'group')
  const knockoutMatches = tournament.matches.filter((match) => match.stage === 'knockout')
  const overallStandings = tournament.groups.flatMap((group) =>
    calculateStandings(
      tournament.players.filter((player) => group.playerIds.includes(player.id)),
      groupMatches.filter((match) => match.groupId === group.id),
    ),
  )

  const qualifiedPlayers = buildQualifiedPlayerOrder(tournament.players, tournament.groups, groupMatches)
  const syncedKnockoutMatches = syncKnockoutMatches(knockoutMatches, qualifiedPlayers)
  const finalMatch = getFinalMatch(syncedKnockoutMatches)

  return {
    ...tournament,
    matches: [...groupMatches, ...syncedKnockoutMatches],
    standings: overallStandings,
    winnerId: finalMatch?.winnerId ?? null,
    isComplete: Boolean(finalMatch?.winnerId),
  }
}

export function updateMatchScore(
  tournament: Tournament,
  matchId: string,
  side: 'homeScore' | 'awayScore',
  rawValue: string,
) {
  const value = rawValue === '' ? null : Number.parseInt(rawValue, 10)
  const nextMatches = tournament.matches.map((match) => {
    if (match.id !== matchId) return match

    return {
      ...match,
      [side]: Number.isNaN(value) ? null : value,
    }
  })

  return recalculateTournament({
    ...tournament,
    matches: nextMatches,
  })
}

export function getMatchesByRound(matches: Match[]) {
  const rounds = new Map<number, Match[]>()

  for (const match of matches) {
    const roundMatches = rounds.get(match.round) ?? []
    roundMatches.push(match)
    rounds.set(match.round, roundMatches)
  }

  return [...rounds.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([round, roundMatches]) => ({
      round,
      matches: roundMatches.sort((left, right) => left.order - right.order),
    }))
}

export function getGroupStandings(tournament: Tournament, groupId: string) {
  const group = tournament.groups.find((entry) => entry.id === groupId)
  if (!group) return []

  return calculateStandings(
    tournament.players.filter((player) => group.playerIds.includes(player.id)),
    tournament.matches.filter((match) => match.groupId === groupId),
  )
}

function createRoundRobinMatches(
  players: Player[],
  stage: 'league' | 'group',
  groupId?: string,
  groupName?: string,
) {
  const matches: Match[] = []
  let order = 1

  for (let homeIndex = 0; homeIndex < players.length; homeIndex += 1) {
    for (let awayIndex = homeIndex + 1; awayIndex < players.length; awayIndex += 1) {
      matches.push({
        id: crypto.randomUUID(),
        stage,
        round: 1,
        order,
        groupId,
        label: groupName ? `${groupName} · Spiel ${order}` : `Spiel ${order}`,
        homePlayerId: players[homeIndex]?.id ?? null,
        awayPlayerId: players[awayIndex]?.id ?? null,
        homeScore: null,
        awayScore: null,
        winnerId: null,
      })
      order += 1
    }
  }

  return matches
}

function createGroups(players: Player[]) {
  const groupCount = players.length >= 12 ? 4 : 2
  const groups: TournamentGroup[] = Array.from({ length: groupCount }, (_, index) => ({
    id: `group-${index + 1}`,
    name: `Gruppe ${String.fromCharCode(65 + index)}`,
    playerIds: [],
  }))

  for (const player of players) {
    const index = (player.seed - 1) % groupCount
    groups[index]?.playerIds.push(player.id)
  }

  return groups
}

function buildQualifiedPlayerOrder(players: Player[], groups: TournamentGroup[], groupMatches: Match[]) {
  const standingsByGroup = groups.map((group) =>
    calculateStandings(
      players.filter((player) => group.playerIds.includes(player.id)),
      groupMatches.filter((match) => match.groupId === group.id),
    ),
  )

  if (groups.length === 2) {
    const [groupA, groupB] = standingsByGroup
    return [groupA?.[0]?.playerId, groupB?.[1]?.playerId, groupB?.[0]?.playerId, groupA?.[1]?.playerId].filter(
      (playerId): playerId is string => Boolean(playerId),
    )
  }

  const [groupA, groupB, groupC, groupD] = standingsByGroup
  return [
    groupA?.[0]?.playerId,
    groupB?.[1]?.playerId,
    groupB?.[0]?.playerId,
    groupA?.[1]?.playerId,
    groupC?.[0]?.playerId,
    groupD?.[1]?.playerId,
    groupD?.[0]?.playerId,
    groupC?.[1]?.playerId,
  ].filter((playerId): playerId is string => Boolean(playerId))
}

function createKnockoutSkeleton(participantCount: number) {
  const size = nextPowerOfTwo(participantCount)
  const totalRounds = Math.log2(size)
  const matches: Match[] = []

  for (let round = 1; round <= totalRounds; round += 1) {
    const matchCount = size / 2 ** round

    for (let order = 1; order <= matchCount; order += 1) {
      matches.push({
        id: crypto.randomUUID(),
        stage: 'knockout',
        round,
        order,
        label: getKnockoutRoundLabel(totalRounds, round, order),
        homePlayerId: null,
        awayPlayerId: null,
        homeScore: null,
        awayScore: null,
        winnerId: null,
      })
    }
  }

  return matches
}

function syncKnockoutMatches(matches: Match[], participants: string[]) {
  const rounds = getMatchesByRound(matches).map((entry) => entry.matches.map((match) => ({ ...match })))

  const firstRound = rounds[0] ?? []
  for (const [index, match] of firstRound.entries()) {
    assignParticipants(match, participants[index * 2] ?? null, participants[index * 2 + 1] ?? null)
  }

  for (let roundIndex = 1; roundIndex < rounds.length; roundIndex += 1) {
    const previousRound = rounds[roundIndex - 1] ?? []
    const currentRound = rounds[roundIndex] ?? []

    for (const [index, match] of currentRound.entries()) {
      assignParticipants(match, previousRound[index * 2]?.winnerId ?? null, previousRound[index * 2 + 1]?.winnerId ?? null)
    }
  }

  return rounds.flat()
}

function assignParticipants(match: Match, homePlayerId: string | null, awayPlayerId: string | null) {
  const didParticipantsChange = match.homePlayerId !== homePlayerId || match.awayPlayerId !== awayPlayerId
  match.homePlayerId = homePlayerId
  match.awayPlayerId = awayPlayerId

  if (didParticipantsChange) {
    match.homeScore = null
    match.awayScore = null
    match.winnerId = null
  }

  if (homePlayerId && !awayPlayerId) {
    match.winnerId = homePlayerId
    return
  }

  if (awayPlayerId && !homePlayerId) {
    match.winnerId = awayPlayerId
    return
  }

  if (!homePlayerId || !awayPlayerId) {
    match.winnerId = null
    return
  }

  if (match.homeScore === null || match.awayScore === null || match.homeScore === match.awayScore) {
    match.winnerId = null
    return
  }

  match.winnerId = match.homeScore > match.awayScore ? homePlayerId : awayPlayerId
}

function calculateStandings(players: Player[], matches: Match[]): StandingRow[] {
  const base = new Map<string, StandingRow>()

  for (const player of players) {
    base.set(player.id, {
      playerId: player.id,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      rank: 0,
    })
  }

  for (const match of matches) {
    if (!isMatchComplete(match) || !match.homePlayerId || !match.awayPlayerId) continue

    const home = base.get(match.homePlayerId)
    const away = base.get(match.awayPlayerId)
    if (!home || !away || match.homeScore === null || match.awayScore === null) continue

    home.played += 1
    away.played += 1
    home.goalsFor += match.homeScore
    home.goalsAgainst += match.awayScore
    away.goalsFor += match.awayScore
    away.goalsAgainst += match.homeScore

    if (match.homeScore > match.awayScore) {
      home.wins += 1
      home.points += 3
      away.losses += 1
    } else if (match.homeScore < match.awayScore) {
      away.wins += 1
      away.points += 3
      home.losses += 1
    } else {
      home.draws += 1
      away.draws += 1
      home.points += 1
      away.points += 1
    }
  }

  return [...base.values()]
    .map((row) => ({
      ...row,
      goalDifference: row.goalsFor - row.goalsAgainst,
    }))
    .sort((left, right) => {
      if (right.points !== left.points) return right.points - left.points
      if (right.goalDifference !== left.goalDifference) return right.goalDifference - left.goalDifference
      if (right.goalsFor !== left.goalsFor) return right.goalsFor - left.goalsFor
      return left.playerId.localeCompare(right.playerId)
    })
    .map((row, index) => ({
      ...row,
      rank: index + 1,
    }))
}

function getKnockoutRoundLabel(totalRounds: number, round: number, order: number) {
  if (round === totalRounds) return 'Finale'
  if (round === totalRounds - 1) return `Halbfinale ${order}`
  if (round === totalRounds - 2) return `Viertelfinale ${order}`
  return `Runde ${round} · Match ${order}`
}

function getFinalMatch(matches: Match[]) {
  const knockoutMatches = matches.filter((match) => match.stage === 'knockout')
  if (knockoutMatches.length === 0) return null

  return knockoutMatches.reduce((latest, current) => {
    if (current.round > latest.round) return current
    if (current.round === latest.round && current.order > latest.order) return current
    return latest
  })
}

function isMatchComplete(match: Match) {
  return match.homeScore !== null && match.awayScore !== null
}

function nextPowerOfTwo(value: number) {
  let power = 1
  while (power < value) {
    power *= 2
  }
  return power
}
