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
}

export function createDefaultDisplaySettings(): DisplaySettings {
  return {
    players: [
      { name: 'Player 1', theme: 'Overworld' },
      { name: 'Player 2', theme: 'Mipedians' },
    ],
    layout: 'opposed',
    orientation: 'facing',
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