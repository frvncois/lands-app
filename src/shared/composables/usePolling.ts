import { onScopeDispose } from 'vue'

interface PollingOptions {
  intervalMs: number
  maxAttempts?: number
  immediate?: boolean
  onTimeout?: () => void
}

export function usePolling() {
  let intervalId: ReturnType<typeof setInterval> | null = null
  let attempts = 0
  let isRunning = false

  function stop() {
    if (intervalId) { clearInterval(intervalId); intervalId = null }
    attempts = 0
    isRunning = false
  }

  function start(fn: () => boolean | void | Promise<boolean | void>, opts: PollingOptions) {
    stop()

    async function tick() {
      if (isRunning) return
      if (opts.maxAttempts !== undefined && attempts >= opts.maxAttempts) {
        stop()
        opts.onTimeout?.()
        return
      }
      isRunning = true
      attempts++
      try {
        const result = await fn()
        if (result === true) stop()
      } finally {
        isRunning = false
      }
    }

    if (opts.immediate) tick()
    intervalId = setInterval(tick, opts.intervalMs)
  }

  onScopeDispose(stop)

  return { start, stop }
}
