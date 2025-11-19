/**
 * ERROR HANDLING MIDDLEWARE
 * 
 * Middleware centralizado para manejo de errores
 * 
 * Este middleware captura todos los errores no manejados
 * y los formatea de manera consistente.
 * 
 * USO:
 *   // Al final de todas las rutas en server.ts:
 *   app.use(errorHandler)
 */

import type { Request, Response, NextFunction } from 'express'
import { HTTP_STATUS, HTTP_MESSAGES, PRISMA_ERROR_CODES } from '../constants'
import { formatError } from '../utils'
import { logError } from '../utils/logger.util'
import type { ApiError } from '../types'

/**
 * Middleware de manejo de errores
 * 
 * Debe ser el último middleware en la cadena.
 * Captura errores y los formatea para la respuesta.
 */
export function errorHandler(
  error: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log del error con contexto
  logError(error, {
    method: req.method,
    path: req.path,
    statusCode: (error as ApiError & { statusCode?: number }).statusCode || 500,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })
  
  // Manejar errores de Prisma
  if (isPrismaError(error)) {
    handlePrismaError(error, res)
    return
  }
  
  // Manejar errores de JWT
  if (error.message === 'Token expired' || error.message === 'Invalid token') {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: HTTP_MESSAGES.UNAUTHORIZED,
      error: error.message,
    })
    return
  }
  
  // Error genérico
  const formattedError = formatError(error)
  
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: HTTP_MESSAGES.INTERNAL_ERROR,
    error: formattedError.message,
    ...(process.env.NODE_ENV === 'development' && {
      details: formattedError.details,
    }),
  })
}

/**
 * Verifica si un error es un error de Prisma
 */
function isPrismaError(error: unknown): error is { code: string; meta?: unknown } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  )
}

/**
 * Maneja errores específicos de Prisma
 */
function handlePrismaError(
  error: { code: string; meta?: unknown },
  res: Response
): void {
  switch (error.code) {
    case PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT:
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: HTTP_MESSAGES.VALIDATION_ERROR,
        error: 'Ya existe un registro con este valor',
        details: error.meta,
      })
      break
      
    case PRISMA_ERROR_CODES.RECORD_NOT_FOUND:
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: HTTP_MESSAGES.NOT_FOUND,
        error: 'Registro no encontrado',
      })
      break
      
    case PRISMA_ERROR_CODES.FOREIGN_KEY_CONSTRAINT:
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: HTTP_MESSAGES.VALIDATION_ERROR,
        error: 'Referencia inválida al registro relacionado',
        details: error.meta,
      })
      break
      
    default:
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: HTTP_MESSAGES.INTERNAL_ERROR,
        error: 'Error de base de datos',
        ...(process.env.NODE_ENV === 'development' && {
          details: error,
        }),
      })
  }
}

/**
 * Middleware para manejar rutas no encontradas (404)
 * 
 * Debe ir después de todas las rutas pero antes del errorHandler
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: HTTP_MESSAGES.NOT_FOUND,
    error: `Ruta ${req.method} ${req.path} no encontrada`,
  })
}

