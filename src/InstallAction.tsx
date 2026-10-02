import { useEffect, useState } from 'react'
import { Check, Download } from 'lucide-react'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

export function InstallAction() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<InstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(() => {
    const navigatorWithStandalone = navigator as Navigator & {
      standalone?: boolean
    }

    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      navigatorWithStandalone.standalone === true
    )
  })
  const [isSecureOrigin] = useState(() => window.isSecureContext)
  const [isAppleMobile] = useState(
    () =>
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
  )
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredPrompt(event as InstallPromptEvent)
    }

    function handleAppInstalled() {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  async function handleInstallClick() {
    if (!deferredPrompt) {
      setShowInstructions(true)
      return
    }

    try {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') setIsInstalled(true)
      setDeferredPrompt(null)
    } catch {
      setShowInstructions(true)
    }
  }

  if (isInstalled) {
    return (
      <span className="install-status">
        <Check size={17} aria-hidden="true" />
        Installed
      </span>
    )
  }

  return (
    <>
      <button
        className="install-trigger"
        type="button"
        aria-label="Install Chaotic Combat Tracker"
        aria-expanded={showInstructions}
        aria-controls="install-guidance"
        onClick={handleInstallClick}
      >
        <Download size={17} strokeWidth={2.3} aria-hidden="true" />
        <span>Install</span>
      </button>

      {showInstructions && (
        <div className="install-guidance" id="install-guidance">
          {!isSecureOrigin && (
            <p className="install-guidance__warning">
              This address uses HTTP. Mobile browsers require HTTPS to install a PWA.
              Open the HTTPS version of the site on your device; a LAN address such as
              http://192.168.x.x will not work.
            </p>
          )}
          {isAppleMobile ? (
            <ol className="install-guidance__steps">
              <li>Open this site in Safari over HTTPS.</li>
              <li>Tap Share, then choose Add to Home Screen.</li>
              <li>Tap Add to finish installing.</li>
            </ol>
          ) : (
            <ol className="install-guidance__steps">
              <li>Open this site in Chrome over HTTPS.</li>
              <li>Tap the browser menu, then choose Install app or Add to Home screen.</li>
              <li>If an Install prompt appears in the app, tap Install there.</li>
            </ol>
          )}
        </div>
      )}
    </>
  )
}