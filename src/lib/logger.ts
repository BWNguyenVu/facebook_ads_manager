// Check if we're running on server side
const isServer = typeof window === 'undefined';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Simple logger interface for both client and server
interface ILogger {
  error: (message: string, error?: any, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  info: (message: string, meta?: any) => void;
  http: (message: string, meta?: any) => void;
  debug: (message: string, meta?: any) => void;
}

// Create server-side logger with Winston (only when on server)
let serverLogger: ILogger | null = null;

if (isServer) {
  try {
    // Dynamic import Winston only on server-side
    const winston = require('winston');
    const path = require('path');

    // Define colors for each level
    const colors = {
      error: 'red',
      warn: 'yellow',
      info: 'green',
      http: 'magenta',
      debug: 'white',
    };

    // Add colors to winston
    winston.addColors(colors);

    // Define which logs to show based on environment
    const level = () => {
      const env = process.env.NODE_ENV || 'development';
      const isDevelopment = env === 'development';
      return isDevelopment ? 'debug' : 'warn';
    };

    // Define console format (for development)
    const consoleFormat = winston.format.combine(
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info: any) => `[${info.timestamp}] ${info.level}: ${info.message}`,
      ),
    );

    // Define file format (for production)
    const fileFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    );

    // Create transports array
    const transports = [];

    // Always add console transport for Docker logs
    transports.push(
      new winston.transports.Console({
        format: process.env.NODE_ENV === 'production' ? fileFormat : consoleFormat,
      })
    );

    // Add file transports for production
    if (process.env.NODE_ENV === 'production') {
      try {
        // Ensure logs directory exists
        const logsDir = '/app/logs';
        
        // Error logs
        transports.push(
          new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            format: fileFormat,
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
          })
        );

        // Combined logs
        transports.push(
          new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            format: fileFormat,
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
          })
        );

        // Application logs
        transports.push(
          new winston.transports.File({
            filename: path.join(logsDir, 'app.log'),
            level: 'info',
            format: fileFormat,
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
          })
        );
      } catch (error) {
        // If file transport setup fails, just continue with console
        console.warn('File transport setup failed, using console only:', error);
      }
    }

    // Create the winston logger
    const winstonLogger = winston.createLogger({
      level: level(),
      levels,
      transports,
      exitOnError: false,
    });

    // Create server logger wrapper
    serverLogger = {
      error: (message: string, error?: any, meta?: any) => {
        if (error instanceof Error) {
          winstonLogger.error(message, { ...meta, error: error.message, stack: error.stack });
        } else {
          winstonLogger.error(message, { ...meta, error });
        }
      },
      warn: (message: string, meta?: any) => winstonLogger.warn(message, meta),
      info: (message: string, meta?: any) => winstonLogger.info(message, meta),
      http: (message: string, meta?: any) => winstonLogger.http(message, meta),
      debug: (message: string, meta?: any) => winstonLogger.debug(message, meta),
    };

  } catch (error) {
    console.warn('Winston setup failed, falling back to console logging:', error);
    serverLogger = null;
  }
}

// Create client-side logger (fallback to console)
const clientLogger: ILogger = {
  error: (message: string, error?: any, meta?: any) => {
    console.error(message, error, meta);
  },
  warn: (message: string, meta?: any) => {
    console.warn(message, meta);
  },
  info: (message: string, meta?: any) => {
    console.info(message, meta);
  },
  http: (message: string, meta?: any) => {
    console.log(`[HTTP] ${message}`, meta);
  },
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, meta);
    }
  },
};

// Logger utility functions with enhanced features
export class Logger {
  private context: string;
  private logger: ILogger;

  constructor(context: string = 'App') {
    this.context = context;
    this.logger = isServer && serverLogger ? serverLogger : clientLogger;
  }

  private formatMessage(message: string, meta?: any): string {
    const baseMessage = `[${this.context}] ${message}`;
    if (meta && typeof meta === 'object') {
      return `${baseMessage} ${JSON.stringify(meta, null, 2)}`;
    }
    return baseMessage;
  }

  error(message: string, error?: Error | any, meta?: any): void {
    this.logger.error(this.formatMessage(message), error, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(this.formatMessage(message, meta));
  }

  info(message: string, meta?: any): void {
    this.logger.info(this.formatMessage(message, meta));
  }

  http(message: string, meta?: any): void {
    this.logger.http(this.formatMessage(message, meta));
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(this.formatMessage(message, meta));
  }

  // Specialized methods for common use cases
  apiRequest(method: string, url: string, userId?: string, meta?: any): void {
    this.http(`${method} ${url}`, { userId, ...meta });
  }

  apiResponse(method: string, url: string, status: number, duration?: number, meta?: any): void {
    this.http(`${method} ${url} - ${status}`, { duration, ...meta });
  }

  dbOperation(operation: string, collection: string, meta?: any): void {
    this.debug(`DB ${operation} on ${collection}`, meta);
  }

  userAction(userId: string, action: string, meta?: any): void {
    this.info(`User ${userId} - ${action}`, meta);
  }

  securityEvent(event: string, userId?: string, meta?: any): void {
    this.warn(`Security: ${event}`, { userId, ...meta });
  }

  performance(operation: string, duration: number, meta?: any): void {
    if (duration > 1000) {
      this.warn(`Slow operation: ${operation} took ${duration}ms`, meta);
    } else {
      this.debug(`Performance: ${operation} took ${duration}ms`, meta);
    }
  }
}

// Create default logger instance
export const defaultLogger = new Logger('DefaultApp');

// Export winston logger for advanced usage (server-side only)
export const winstonLogger = isServer && serverLogger ? serverLogger : null;

// Helper function to create context-specific logger
export const createLogger = (context: string): Logger => {
  return new Logger(context);
};

// Helper for measuring operation time
export const measureTime = async <T>(
  operation: string,
  fn: () => Promise<T>,
  logger: Logger = defaultLogger
): Promise<T> => {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    logger.performance(operation, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(`${operation} failed after ${duration}ms`, error);
    throw error;
  }
};
