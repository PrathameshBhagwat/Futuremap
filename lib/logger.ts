/**
 * Centralized Logging Utility
 *
 * Use this wrapper for logging instead of generic console.log/error.
 * In a production environment, this can be integrated with 
 * observability platforms like Sentry, Datadog, or LogRocket.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogMeta {
  [key: string]: any
}

class Logger {
  private log(level: LogLevel, message: string, meta?: LogMeta) {
    const timestamp = new Date().toISOString()
    
    // In development, colorize console output
    const isDev = process.env.NODE_ENV === 'development'
    
    const formattedMeta = meta ? JSON.stringify(meta) : ''

    if (isDev) {
      const prefix = `[${timestamp}] [${level.toUpperCase()}]:`
      switch (level) {
        case 'info':
          console.info(`\x1b[36m${prefix}\x1b[0m`, message, meta || '')
          break
        case 'warn':
          console.warn(`\x1b[33m${prefix}\x1b[0m`, message, meta || '')
          break
        case 'error':
          console.error(`\x1b[31m${prefix}\x1b[0m`, message, meta || '')
          break
        case 'debug':
          console.debug(`\x1b[90m${prefix}\x1b[0m`, message, meta || '')
          break
      }
    } else {
      // Production logging format (JSON is usually better for log aggregators)
      const logEntry = JSON.stringify({
        timestamp,
        level,
        message,
        ...meta
      })

      switch (level) {
        case 'info':
          console.info(logEntry)
          break
        case 'warn':
          console.warn(logEntry)
          break
        case 'error':
          console.error(logEntry)
          // TODO: Add external service integration here (e.g., Sentry.captureException)
          break
        case 'debug':
          // We usually don't emit debug logs in production
          break
      }
    }
  }

  info(message: string, meta?: LogMeta) {
    this.log('info', message, meta)
  }

  warn(message: string, meta?: LogMeta) {
    this.log('warn', message, meta)
  }

  error(message: string, error?: unknown, meta?: LogMeta) {
    const errorMeta = {
      ...meta,
      error_message: error instanceof Error ? error.message : String(error),
      error_stack: error instanceof Error ? error.stack : undefined
    }
    this.log('error', message, errorMeta)
  }

  debug(message: string, meta?: LogMeta) {
    this.log('debug', message, meta)
  }
}

export const logger = new Logger()
