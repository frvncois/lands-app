/**
 * LOGGER
 *
 * Controlled logging utility that only outputs in development
 * or when specific debug flags are enabled.
 */

const isDev = import.meta.env.DEV
const debugAuth = isDev && import.meta.env.VITE_DEBUG_AUTH === 'true'
const debugEditor = isDev && import.meta.env.VITE_DEBUG_EDITOR === 'true'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerOptions {
  enabled?: boolean
}

function createLogger(namespace: string, options: LoggerOptions = {}) {
  const { enabled = isDev } = options

  const log = (level: LogLevel, ...args: unknown[]) => {
    if (!enabled) return

    const prefix = `[${namespace}]`
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 12)

    switch (level) {
      case 'debug':
        console.log(`${timestamp} ${prefix}`, ...args)
        break
      case 'info':
        console.info(`${timestamp} ${prefix}`, ...args)
        break
      case 'warn':
        console.warn(`${timestamp} ${prefix}`, ...args)
        break
      case 'error':
        console.error(`${timestamp} ${prefix}`, ...args)
        break
    }
  }

  return {
    debug: (...args: unknown[]) => log('debug', ...args),
    info: (...args: unknown[]) => log('info', ...args),
    warn: (...args: unknown[]) => log('warn', ...args),
    error: (...args: unknown[]) => log('error', ...args),
  }
}

// Pre-configured loggers for different parts of the app
export const authLogger = createLogger('Auth', { enabled: debugAuth })
export const editorLogger = createLogger('Editor', { enabled: debugEditor })
export const apiLogger = createLogger('API', { enabled: isDev })

// Generic logger for one-off use
export const logger = createLogger('App')
