import { useEffect, useRef } from 'react'
import { Settings2, X } from 'lucide-react'
import { InstallAction } from './InstallAction'
import {
  DISPLAY_LAYOUTS,
  PANEL_ORIENTATIONS,
  TRIBE_THEMES,
  type DisplayLayout,
  type DisplaySettings,
  type PanelOrientation,
  type PlayerDisplaySettings,
} from './model'

interface OptionsDialogProps {
  open: boolean
  settings: DisplaySettings
  onRequestClose: () => void
  onPlayerChange: (
    playerIndex: 0 | 1,
    changes: Partial<PlayerDisplaySettings>,
  ) => void
  onLayoutChange: (layout: DisplayLayout) => void
  onOrientationChange: (orientation: PanelOrientation) => void
}

export function OptionsDialog({
  open,
  settings,
  onRequestClose,
  onPlayerChange,
  onLayoutChange,
  onOrientationChange,
}: OptionsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      className="options-dialog"
      ref={dialogRef}
      aria-labelledby="options-dialog-title"
      onClose={onRequestClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onRequestClose()
      }}
    >
      <header className="options-dialog__header">
        <div className="options-dialog__title">
          <Settings2 size={19} aria-hidden="true" />
          <h2 id="options-dialog-title">Tracker options</h2>
        </div>
        <button
          className="options-close"
          type="button"
          aria-label="Close tracker options"
          title="Close options"
          onClick={onRequestClose}
        >
          <X size={19} aria-hidden="true" />
        </button>
      </header>

      <div className="options-dialog__content">
        <section className="options-section" aria-label="Player display settings">
          {[0, 1].map((playerIndex) => {
            const index = playerIndex as 0 | 1
            const player = settings.players[index]

            return (
              <fieldset className="player-options" key={playerIndex}>
                <legend>Player {playerIndex + 1}</legend>
                <label className="field-label">
                  <span>Display name</span>
                  <input
                    type="text"
                    name={`player-${playerIndex + 1}-name`}
                    maxLength={20}
                    autoComplete="off"
                    value={player.name}
                    onChange={(event) =>
                      onPlayerChange(index, { name: event.target.value })
                    }
                  />
                </label>
                <label className="field-label">
                  <span>Tribe theme</span>
                  <select
                    value={player.theme}
                    onChange={(event) =>
                      onPlayerChange(index, {
                        theme: event.target.value as PlayerDisplaySettings['theme'],
                      })
                    }
                  >
                    {TRIBE_THEMES.map((theme) => (
                      <option key={theme} value={theme}>
                        {theme}
                      </option>
                    ))}
                  </select>
                </label>
              </fieldset>
            )
          })}
        </section>

        <fieldset className="choice-setting">
          <legend>Player placement</legend>
          <div className="segmented-control">
            {DISPLAY_LAYOUTS.map((layout) => (
              <label
                className={settings.layout === layout ? 'is-selected' : ''}
                key={layout}
              >
                <input
                  type="radio"
                  name="player-layout"
                  value={layout}
                  checked={settings.layout === layout}
                  onChange={() => onLayoutChange(layout)}
                />
                <span>{layout === 'opposed' ? 'Opposite' : 'Next to each other'}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="choice-setting">
          <legend>Player orientation</legend>
          <div className="segmented-control">
            {PANEL_ORIENTATIONS.map((orientation) => (
              <label
                className={settings.orientation === orientation ? 'is-selected' : ''}
                key={orientation}
              >
                <input
                  type="radio"
                  name="player-orientation"
                  value={orientation}
                  checked={settings.orientation === orientation}
                  onChange={() => onOrientationChange(orientation)}
                />
                <span>
                  {orientation === 'facing' ? 'Facing each other' : 'Same way up'}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <section className="install-setting" aria-labelledby="install-setting-title">
          <h3 id="install-setting-title">Install app</h3>
          <InstallAction />
        </section>
      </div>
    </dialog>
  )
}