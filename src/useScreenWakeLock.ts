import { useEffect, useState } from 'react'

interface WakeLockSentinel extends EventTarget {
  release: () => Promise<void>
}

interface NavigatorWithWakeLock {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinel>
  }
}

export function useScreenWakeLock(enabled: boolean) {
  const [isActive, setIsActive] = useState(false)
  const wakeLockApi = (navigator as Navigator & NavigatorWithWakeLock).wakeLock
  const isSupported = window.isSecureContext && Boolean(wakeLockApi)

  useEffect(() => {
    if (!enabled || !isSupported || !wakeLockApi) return
    const wakeLock = wakeLockApi

    let sentinel: WakeLockSentinel | null = null
    let isDisposed = false

    async function acquireWakeLock() {
      if (
        isDisposed ||
        sentinel ||
        document.visibilityState !== 'visible'
      ) {
        return
      }

      try {
        const requestedSentinel = await wakeLock.request('screen')
        if (isDisposed) {
          await requestedSentinel.release()
          return
        }

        sentinel = requestedSentinel
        setIsActive(true)
        requestedSentinel.addEventListener('release', handleRelease, {
          once: true,
        })
      } catch {
        if (!isDisposed) setIsActive(false)
      }
    }

    function handleRelease() {
      sentinel = null
      setIsActive(false)
      if (!isDisposed && document.visibilityState === 'visible') {
        void acquireWakeLock()
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void acquireWakeLock()
      } else if (sentinel) {
        void sentinel.release()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    void acquireWakeLock()

    return () => {
      isDisposed = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (sentinel) void sentinel.release()
    }
  }, [enabled, isSupported, wakeLockApi])

  return { isActive, isSupported }
}