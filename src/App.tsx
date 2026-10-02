import { useEffect, useReducer, useRef, useState } from 'react'
import { RotateCcw, Settings2 } from 'lucide-react'
import './App.css'
import { OptionsDialog } from './OptionsDialog'
import { PlayerPanel } from './PlayerPanel'
import {
  createDefaultDisplaySettings,
  createInitialTrackerState,
  DISPLAY_LAYOUTS,
  PANEL_ORIENTATIONS,
  TRIBE_THEMES,
  trackerReducer,
  type DisplayLayout,
  type DisplaySettings,
  type PanelOrientation,
  type PlayerDisplaySettings,
  type StatName,
} from './model'
import { useScreenWakeLock } from './useScreenWakeLock'

const SETTINGS_STORAGE_KEY = 'chaotic-combat-tracker-display-settings'

function auditMetadata() {
  const timestamp = Date.now()
  return {
    id: `${timestamp}-${Math.random().toString(36).slice(2)}`,
    timestamp,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isPlayerDisplaySettings(value: unknown): value is PlayerDisplaySettings {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    typeof value.theme === 'string' &&
    (TRIBE_THEMES as readonly string[]).includes(value.theme)
  )
}

function readDisplaySettings(): DisplaySettings {
  const fallback = createDefaultDisplaySettings()

  try {
    const saved = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!saved) return fallback

    const parsed: unknown = JSON.parse(saved)
    if (!isRecord(parsed) || !Array.isArray(parsed.players) || parsed.players.length !== 2) {
      return fallback
    }

    const [firstPlayer, secondPlayer] = parsed.players
    const isLayout = (DISPLAY_LAYOUTS as readonly unknown[]).includes(parsed.layout)
    const isOrientation = (PANEL_ORIENTATIONS as readonly unknown[]).includes(
      parsed.orientation,
    )

    if (
      !isPlayerDisplaySettings(firstPlayer) ||
      !isPlayerDisplaySettings(secondPlayer) ||
      !isLayout ||
      !isOrientation
    ) {
      return fallback
    }

    return {
      players: [firstPlayer, secondPlayer],
      layout: parsed.layout as DisplayLayout,
      orientation: parsed.orientation as PanelOrientation,
      keepScreenAwake:
        typeof parsed.keepScreenAwake === 'boolean'
          ? parsed.keepScreenAwake
          : fallback.keepScreenAwake,
    }
  } catch {
    return fallback
  }
}

function App() {
  const [trackerState, dispatch] = useReducer(
    trackerReducer,
    undefined,
    createInitialTrackerState,
  )
  const { players, auditLog } = trackerState
  const [displaySettings, setDisplaySettings] =
    useState<DisplaySettings>(readDisplaySettings)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const resetDialogRef = useRef<HTMLDialogElement>(null)
  const screenWakeLock = useScreenWakeLock(displaySettings.keepScreenAwake)

  useEffect(() => {
    try {
      window.localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(displaySettings),
      )
    } catch {
      return
    }
  }, [displaySettings])

  function updatePlayerSettings(
    playerIndex: 0 | 1,
    changes: Partial<PlayerDisplaySettings>,
  ) {
    setDisplaySettings((currentSettings) => {
      const nextPlayers: DisplaySettings['players'] = [...currentSettings.players]
      nextPlayers[playerIndex] = {
        ...nextPlayers[playerIndex],
        ...changes,
      }
      return { ...currentSettings, players: nextPlayers }
    })
  }

  return (
    <main
      className={`battlefield battlefield--${displaySettings.layout} battlefield--${displaySettings.orientation}`}
      aria-label="Chaotic combat tracker"
    >
      {players.map((player, index) => {
        const playerIndex = index as 0 | 1
        const playerNumber: 1 | 2 = playerIndex === 0 ? 1 : 2
        const options = displaySettings.players[playerIndex]
        const playerName = options.name.trim() || `Player ${playerNumber}`

        return (
          <PlayerPanel
            key={playerNumber}
            player={player}
            playerName={playerName}
            playerNumber={playerNumber}
            theme={options.theme}
            onStatChange={(stat: StatName, direction) =>
              dispatch({
                ...auditMetadata(),
                type: 'stat-adjusted',
                playerIndex,
                playerName,
                stat,
                direction,
              })
            }
            onElementToggle={(element) =>
              dispatch({
                ...auditMetadata(),
                type: 'element-toggled',
                playerIndex,
                playerName,
                element,
              })
            }
          />
        )
      })}

      <div className="reset-band">
        <div className="reset-band__controls">
          <button
            className="reset-trigger"
            type="button"
            aria-label="Reset both players"
            title="Reset both players"
            onClick={() => resetDialogRef.current?.showModal()}
          >
            <RotateCcw size={18} strokeWidth={2.3} aria-hidden="true" />
            <span>RESET</span>
          </button>
          <button
            className="options-trigger"
            type="button"
            aria-label="Open tracker options"
            title="Tracker options"
            onClick={() => setOptionsOpen(true)}
          >
            <Settings2 size={19} aria-hidden="true" />
          </button>
        </div>
      </div>

      <OptionsDialog
        open={optionsOpen}
        settings={displaySettings}
        auditLog={auditLog}
        keepScreenAwakeSupported={screenWakeLock.isSupported}
        keepScreenAwakeActive={screenWakeLock.isActive}
        onRequestClose={() => setOptionsOpen(false)}
        onPlayerChange={updatePlayerSettings}
        onLayoutChange={(layout: DisplayLayout) =>
          setDisplaySettings((current) => ({ ...current, layout }))
        }
        onOrientationChange={(orientation: PanelOrientation) =>
          setDisplaySettings((current) => ({ ...current, orientation }))
        }
        onKeepScreenAwakeChange={(keepScreenAwake) =>
          setDisplaySettings((current) => ({ ...current, keepScreenAwake }))
        }
      />

      <dialog
        className="reset-dialog"
        ref={resetDialogRef}
        aria-labelledby="reset-dialog-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            resetDialogRef.current?.close()
          }
        }}
      >
        <div className="reset-dialog__mark" aria-hidden="true">
          <RotateCcw size={22} />
        </div>
        <h2 id="reset-dialog-title">Reset the match?</h2>
        <p>Both players return to 50. All elements turn off.</p>
        <div className="reset-dialog__actions">
          <button
            className="dialog-button dialog-button--quiet"
            type="button"
            onClick={() => resetDialogRef.current?.close()}
          >
            Cancel
          </button>
          <button
            className="dialog-button dialog-button--reset"
            type="button"
            onClick={() => {
              dispatch({ ...auditMetadata(), type: 'match-reset' })
              resetDialogRef.current?.close()
            }}
          >
            Reset all
          </button>
        </div>
      </dialog>
    </main>
  )
}

export default App
