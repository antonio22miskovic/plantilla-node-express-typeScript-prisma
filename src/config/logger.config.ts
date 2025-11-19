/**
 * LOGGER CONFIGURATION
 * 
 * Configuración del sistema de logging usando Winston.
 * Los logs se guardan en archivos organizados por día.
 * 
 * NIVELES DE LOG:
 * - error: Solo errores críticos
 * - warn: Advertencias
 * - info: Información general
 * - debug: Información detallada (solo desarrollo)
 * 
 * USO:
 *   import { logger } from '../config/logger.config'
 *   logger.error('Error crítico', { error })
 *   logger.info('Operación completada', { userId: 123 })
 */

import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'path'

// ============================================
// CONFIGURACIÓN DE VARIABLES DE ENTORNO
// ============================================

/**
 * Nivel de logging según el entorno
 * - development: 'debug' (más detallado)
 * - production: 'info' (solo información importante)
 */
const LOG_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

/**
 * Directorio donde se guardan los logs
 */
const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs')

/**
 * Formato de fecha para los archivos de log
 */
const DATE_PATTERN = 'YYYY-MM-DD'

/**
 * Formato de los mensajes de log
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
)

/**
 * Formato para consola (más legible)
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta, null, 2)}`
    }
    return msg
  })
)

// ============================================
// TRANSPORTS (DESTINOS DE LOG)
// ============================================

const transports: winston.transport[] = []

// 1. Transport para errores (archivo separado)
const errorFileTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'error-%DATE%.log'),
  datePattern: DATE_PATTERN,
  level: 'error',
  format: logFormat,
  maxSize: '20m', // Tamaño máximo por archivo
  maxFiles: '30d', // Mantener logs de los últimos 30 días
  zippedArchive: true, // Comprimir archivos antiguos
})

// 2. Transport para todos los logs (combined)
const combinedFileTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'combined-%DATE%.log'),
  datePattern: DATE_PATTERN,
  format: logFormat,
  maxSize: '20m',
  maxFiles: '30d',
  zippedArchive: true,
})

// 3. Transport para consola (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: LOG_LEVEL,
    })
  )
}

// Agregar transports de archivos
transports.push(errorFileTransport, combinedFileTransport)

// ============================================
// CREAR LOGGER
// ============================================

export const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: logFormat,
  defaultMeta: {
    service: 'backend-api',
    environment: process.env.NODE_ENV || 'development',
  },
  transports,
  // Manejar excepciones no capturadas
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'exceptions-%DATE%.log'),
      datePattern: DATE_PATTERN,
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true,
    }),
  ],
  // Manejar promesas rechazadas
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'rejections-%DATE%.log'),
      datePattern: DATE_PATTERN,
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true,
    }),
  ],
})

// ============================================
// EXPORTAR CONFIGURACIÓN
// ============================================

export const loggerConfig = {
  level: LOG_LEVEL,
  logDir: LOG_DIR,
  datePattern: DATE_PATTERN,
} as const

