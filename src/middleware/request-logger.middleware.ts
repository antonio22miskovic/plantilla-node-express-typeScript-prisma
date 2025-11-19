/**
 * REQUEST LOGGER MIDDLEWARE - Middleware para Logging de Requests
 * 
 * Este middleware registra todas las peticiones HTTP con información
 * relevante: método, ruta, código de estado, duración, etc.
 * 
 * USO:
 *   import { requestLogger } from '../middleware/request-logger.middleware'
 *   app.use(requestLogger)
 */

import type { Request, Response, NextFunction } from 'express'
import { logRequest } from '../utils/logger.util'
import type { AuthenticatedRequest } from '../types'

/**
 * Middleware para registrar todas las peticiones HTTP
 * 
 * Registra:
 * - Método HTTP
 * - Ruta
 * - Código de estado
 * - Duración de la petición
 * - IP del cliente
 * - User agent
 * - Usuario autenticado (si existe)
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now()
  
  // Interceptar el método end de la respuesta para registrar cuando termine
  const originalEnd = res.end
  
  res.end = function (chunk?: unknown, encoding?: unknown) {
    const duration = Date.now() - startTime
    
    // Obtener información del usuario autenticado si existe
    const authReq = req as AuthenticatedRequest
    const context: {
      ip?: string
      userAgent?: string
      userId?: number
      query?: Record<string, unknown>
    } = {
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
    }
    
    if (authReq.user?.id) {
      context.userId = authReq.user.id
    }
    
    // Solo registrar query params en desarrollo
    if (process.env.NODE_ENV === 'development' && Object.keys(req.query).length > 0) {
      context.query = req.query as Record<string, unknown>
    }
    
    // Registrar la petición
    logRequest(req.method, req.path, res.statusCode, duration, context)
    
    // Llamar al método original
    originalEnd.call(this, chunk, encoding)
  }
  
  next()
}

