/**
 * LOGGER UTILITIES - Utilidades de Logging
 * 
 * Funciones auxiliares para logging estructurado.
 * Facilita el logging de errores, requests, y eventos del sistema.
 * 
 * USO:
 *   import { logError, logRequest, logInfo } from '../utils/logger.util'
 *   logError(error, { userId: 123, action: 'createUser' })
 */

import { logger } from '../config/logger.config'

/**
 * Contexto adicional para los logs
 */
export interface LogContext {
  userId?: number
  requestId?: string
  action?: string
  [key: string]: unknown
}

/**
 * Registra un error con contexto adicional
 * 
 * @param error - Error a registrar
 * @param context - Contexto adicional (userId, action, etc.)
 */
export function logError(error: Error | unknown, context?: LogContext): void {
  const errorObj = error instanceof Error 
    ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      }
    : { message: String(error) }

  logger.error('Error ocurrido', {
    ...errorObj,
    ...context,
  })
}

/**
 * Registra información general
 * 
 * @param message - Mensaje a registrar
 * @param context - Contexto adicional
 */
export function logInfo(message: string, context?: LogContext): void {
  logger.info(message, context || {})
}

/**
 * Registra una advertencia
 * 
 * @param message - Mensaje de advertencia
 * @param context - Contexto adicional
 */
export function logWarn(message: string, context?: LogContext): void {
  logger.warn(message, context || {})
}

/**
 * Registra información de debug (solo en desarrollo)
 * 
 * @param message - Mensaje de debug
 * @param context - Contexto adicional
 */
export function logDebug(message: string, context?: LogContext): void {
  logger.debug(message, context || {})
}

/**
 * Registra información de una petición HTTP
 * 
 * @param method - Método HTTP (GET, POST, etc.)
 * @param path - Ruta de la petición
 * @param statusCode - Código de estado HTTP
 * @param duration - Duración de la petición en ms
 * @param context - Contexto adicional
 */
export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  context?: LogContext
): void {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'
  
  logger.log(level, 'HTTP Request', {
    method,
    path,
    statusCode,
    duration: `${duration}ms`,
    ...context,
  })
}

/**
 * Registra el inicio de la aplicación
 */
export function logAppStart(port: number, environment: string): void {
  logger.info('🚀 Aplicación iniciada', {
    port,
    environment,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Registra el cierre de la aplicación
 */
export function logAppShutdown(signal: string): void {
  logger.info('🛑 Aplicación cerrada', {
    signal,
    timestamp: new Date().toISOString(),
  })
}

