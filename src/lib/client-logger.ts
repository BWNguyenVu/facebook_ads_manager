/**
 * Client-side logger for React components
 * Uses console methods instead of Winston to avoid bundling Node.js modules
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface ClientLogger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Create a client-side logger instance
 * In production, only error logs are shown
 * In development, all logs are shown
 */
export function createClientLogger(component: string): ClientLogger {
  const prefix = `[${component}]`;

  return {
    debug: (message: string, ...args: any[]) => {
      if (isDevelopment) {
        console.debug(prefix, message, ...args);
      }
    },
    info: (message: string, ...args: any[]) => {
      if (isDevelopment) {
        console.info(prefix, message, ...args);
      }
    },
    warn: (message: string, ...args: any[]) => {
      console.warn(prefix, message, ...args);
    },
    error: (message: string, ...args: any[]) => {
      console.error(prefix, message, ...args);
    }
  };
}
