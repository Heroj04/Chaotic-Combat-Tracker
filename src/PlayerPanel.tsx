import {
  BatteryCharging,
  Droplets,
  Eye,
  Flame,
  Heart,
  Minus,
  MoveUpRight,
  Mountain,
  Plus,
  Wind,
  Zap,
} from 'lucide-react'
import {
  ELEMENT_ORDER,
  STAT_ORDER,
  type ElementName,
  type PlayerState,
  type StatName,
  type TribeTheme,
} from './model'

const statIcons = {
  Energy: BatteryCharging,
  Courage: Heart,
  Power: Zap,
  Wisdom: Eye,
  Speed: MoveUpRight,
}

const elementIcons = {
  Fire: Flame,
  Air: Wind,
  Earth: Mountain,
  Water: Droplets,
}

const themeClasses: Record<TribeTheme, string> = {
  Overworld: 'overworld',
  Underworld: 'underworld',
  Mipedians: 'mipedians',
  Danians: 'danians',
  "M'arrillians": 'marrillians',
}

interface PlayerPanelProps {
  player: PlayerState
  playerName: string
  playerNumber: 1 | 2
  theme: TribeTheme
  onStatChange: (stat: StatName, direction: -1 | 1) => void
  onElementToggle: (element: ElementName) => void
}

export function PlayerPanel({
  player,
  playerName,
  playerNumber,
  theme,
  onStatChange,
  onElementToggle,
}: PlayerPanelProps) {
  return (
    <section
      className={`player-panel player-panel--${playerNumber} player-panel--theme-${themeClasses[theme]}`}
      aria-labelledby={`player-${playerNumber}-heading`}
    >
      <div className="player-panel__face">
        <header className="player-heading">
          <div className="player-heading__identity">
            <span className="player-heading__number" aria-hidden="true">
              0{playerNumber}
            </span>
            <h2 id={`player-${playerNumber}-heading`} title={playerName}>
              {playerName}
            </h2>
          </div>
          <span className="player-heading__caption">CREATURE STATS</span>
        </header>

        <div className="stat-list" aria-label={`${playerName} stats`}>
          {STAT_ORDER.map((stat) => {
            const Icon = statIcons[stat]

            return (
              <div className="stat-row" key={stat}>
                <span className="stat-label">
                  <Icon size={17} strokeWidth={2.1} aria-hidden="true" />
                  <span>{stat}</span>
                </span>
                <button
                  className="stat-step"
                  type="button"
                  aria-label={`Decrease ${stat} for ${playerName} by 5`}
                  title={`Decrease ${stat} by 5`}
                  disabled={player.stats[stat] === 0}
                  onClick={() => onStatChange(stat, -1)}
                >
                  <Minus size={18} strokeWidth={2.5} aria-hidden="true" />
                </button>
                <output
                  className="stat-value"
                  aria-label={`${stat}, ${playerName}`}
                  aria-live="polite"
                >
                  {player.stats[stat]}
                </output>
                <button
                  className="stat-step"
                  type="button"
                  aria-label={`Increase ${stat} for ${playerName} by 5`}
                  title={`Increase ${stat} by 5`}
                  onClick={() => onStatChange(stat, 1)}
                >
                  <Plus size={18} strokeWidth={2.5} aria-hidden="true" />
                </button>
              </div>
            )
          })}
        </div>

        <div className="element-tray" role="group" aria-label={`${playerName} elements`}>
          {ELEMENT_ORDER.map((element) => {
            const Icon = elementIcons[element]
            const isActive = player.elements[element]

            return (
              <button
                className={`element-toggle${isActive ? ' is-active' : ''}`}
                type="button"
                aria-pressed={isActive}
                aria-label={`${element}, ${playerName}`}
                title={`${element}${isActive ? ' active' : ' inactive'}`}
                key={element}
                onClick={() => onElementToggle(element)}
              >
                <Icon size={17} strokeWidth={2.2} aria-hidden="true" />
                <span>{element}</span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}