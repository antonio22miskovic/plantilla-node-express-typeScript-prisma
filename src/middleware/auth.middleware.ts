/**
 * AUTHENTICATION MIDDLEWARE
 * 
 * Middleware para autenticación JWT
 * 
 * Este middleware verifica que el usuario esté autenticado
 * y agrega la información del usuario al objeto Request.
 * 
 * USO:
 *   import { authenticate } from '../middleware/auth.middleware'
 *   router.get('/protected', authenticate, controller)
 */

import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../config/jwt.config'
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants'
import type { AuthenticatedRequest } from '../types'
import { db } from '../config/prisma'

/**
 * Middleware de autenticación JWT
 * 
 * Verifica el token JWT en el header Authorization y agrega
 * la información del usuario al objeto Request.
 * 
 * Headers requeridos:
 *   Authorization: Bearer <token>
 * 
 * Si el token es válido, agrega req.user con la información del usuario.
 * Si el token es inválido o falta, retorna un error 401.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: HTTP_MESSAGES.UNAUTHORIZED,
        error: 'Header de autorización faltante o inválido',
      })
      return
    }
    
    // Extraer el token (remover "Bearer ")
    const token = authHeader.substring(7)
    
    // Verificar y decodificar el token
    const payload = verifyToken(token)
    
    // Obtener información actualizada del usuario (incluyendo rol)
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        isActive: true,
      },
    })
    
    if (!user || !user.isActive) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: HTTP_MESSAGES.UNAUTHORIZED,
        error: 'Usuario no encontrado o inactivo',
      })
      return
    }
    
    // Agregar información del usuario al request
    ;(req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      role: user.role?.name || payload.role,
      roleId: user.roleId,
    }
    
    // Continuar al siguiente middleware/controlador
    next()
  } catch (error) {
    // Token inválido o expirado
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: HTTP_MESSAGES.UNAUTHORIZED,
      error: error instanceof Error ? error.message : 'Token inválido',
    })
  }
}

/**
 * Middleware opcional de autenticación
 * 
 * Similar a authenticate, pero no retorna error si no hay token.
 * Útil para rutas que funcionan tanto con usuario autenticado como anónimo.
 */
export async function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const payload = verifyToken(token)
        
        const user = await db.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            email: true,
            roleId: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
            isActive: true,
          },
        })
        
        if (user && user.isActive) {
          ;(req as AuthenticatedRequest).user = {
            id: user.id,
            email: user.email,
            role: user.role?.name || payload.role,
            roleId: user.roleId,
          }
        }
      } catch (error) {
        // Si hay error, simplemente continuar sin usuario autenticado
      }
    }
    
    next()
  } catch (error) {
    // Si hay error, simplemente continuar sin usuario autenticado
    next()
  }
}

