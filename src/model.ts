export const STAT_ORDER = [
  'Energy',
  'Courage',
  'Power',
  'Wisdom',
  'Speed',
] as const

export const ELEMENT_ORDER = ['Fire', 'Air', 'Earth', 'Water'] as const

export type StatName = (typeof STAT_ORDER)[number]
export type ElementName = (typeof ELEMENT_ORDER)[number]

export interface PlayerState {
  stats: Record<StatName, number>
  elements: Record<ElementName, boolean>
}

export type MatchState = [PlayerState, PlayerState]

export interface AuditEntry {
  id: string
  timestamp: number
  message: string
}

export interface TrackerState {
  players: MatchState
  auditLog: AuditEntry[]
}

interface AuditMetadata {
  id: string
  timestamp: number
}

export type TrackerAction =
  | (AuditMetadata & {
      type: 'stat-adjusted'
      playerIndex: 0 | 1
      playerName: string
      stat: StatName
      direction: -1 | 1
    })
  | (AuditMetadata & {
      type: 'element-toggled'
      playerIndex: 0 | 1
      playerName: string
      element: ElementName
    })
  | (AuditMetadata & { type: 'match-reset' })

export const TRIBE_THEMES = [
  'Overworld',
  'Underworld',
  'Mipedians',
  'Danians',
  "M'arrillians",
] as const

export const DISPLAY_LAYOUTS = ['opposed', 'adjacent'] as const
export const PANEL_ORIENTATIONS = ['facing', 'same'] as const

export type TribeTheme = (typeof TRIBE_THEMES)[number]
export type DisplayLayout = (typeof DISPLAY_LAYOUTS)[number]
export type PanelOrientation = (typeof PANEL_ORIENTATIONS)[number]

export interface PlayerDisplaySettings {
  name: string
  theme: TribeTheme
}

export interface DisplaySettings {
  players: [PlayerDisplaySettings, PlayerDisplaySettings]
  layout: DisplayLayout
  orientation: PanelOrientation
  keepScreenAwake: boolean
}

export function createDefaultDisplaySettings(): DisplaySettings {
  return {
    players: [
      { name: 'Player 1', theme: 'Overworld' },
      { name: 'Player 2', theme: 'Mipedians' },
    ],
    layout: 'opposed',
    orientation: 'facing',
    keepScreenAwake: true,
  }
}

export function createInitialPlayer(): PlayerState {
  return {
    stats: {
      Energy: 50,
      Courage: 50,
      Power: 50,
      Wisdom: 50,
      Speed: 50,
    },
    elements: {
      Fire: false,
      Air: false,
      Earth: false,
      Water: false,
    },
  }
}

export function createInitialMatch(): MatchState {
  return [createInitialPlayer(), createInitialPlayer()]
}

export function createInitialTrackerState(): TrackerState {
  return {
    players: createInitialMatch(),
    auditLog: [],
  }
}

function appendAuditEntry(
  state: TrackerState,
  players: MatchState,
  action: AuditMetadata,
  message: string,
): TrackerState {
  return {
    players,
    auditLog: [
      ...state.auditLog,
      { id: action.id, timestamp: action.timestamp, message },
    ].slice(-100),
  }
}

export function trackerReducer(
  state: TrackerState,
  action: TrackerAction,
): TrackerState {
  if (action.type === 'match-reset') {
    return appendAuditEntry(
      state,
      createInitialMatch(),
      action,
      'Match reset: both players returned to 50 and all elements were turned off',
    )
  }

  const currentPlayer = state.players[action.playerIndex]

  if (action.type === 'stat-adjusted') {
    const nextPlayer = adjustStat(currentPlayer, action.stat, action.direction)
    const previousValue = currentPlayer.stats[action.stat]
    const nextValue = nextPlayer.stats[action.stat]

    if (previousValue === nextValue) return state

    const nextPlayers: MatchState = [...state.players]
    nextPlayers[action.playerIndex] = nextPlayer

    return appendAuditEntry(
      state,
      nextPlayers,
      action,
      `${action.playerName}: ${action.stat} ${previousValue} -> ${nextValue}`,
    )
  }

  const wasActive = currentPlayer.elements[action.element]
  const nextPlayers: MatchState = [...state.players]
  nextPlayers[action.playerIndex] = toggleElement(currentPlayer, action.element)

  return appendAuditEntry(
    state,
    nextPlayers,
    action,
    `${action.playerName}: ${action.element} turned ${wasActive ? 'off' : 'on'}`,
  )
}

export function adjustStat(
  player: PlayerState,
  stat: StatName,
  direction: -1 | 1,
): PlayerState {
  return {
    ...player,
    stats: {
      ...player.stats,
      [stat]: Math.max(0, player.stats[stat] + direction * 5),
    },
  }
}

export function toggleElement(
  player: PlayerState,
  element: ElementName,
): PlayerState {
  return {
    ...player,
    elements: {
      ...player.elements,
      [element]: !player.elements[element],
    },
  }
}