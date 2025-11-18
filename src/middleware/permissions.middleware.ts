/**
 * PERMISSIONS MIDDLEWARE
 * 
 * Middleware para verificar permisos de usuarios
 * 
 * Este middleware verifica que el usuario autenticado tenga los permisos
 * necesarios para acceder a una ruta específica.
 * 
 * USO:
 *   import { requirePermission, requireAnyPermission } from '../middleware/permissions.middleware'
 *   router.post('/', authenticate, requirePermission('users.create'), controller.create)
 */

import type { Request, Response, NextFunction } from 'express'
import { RoleService } from '../services/Role.service'
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants'
import type { AuthenticatedRequest } from '../types'
import type { PermissionName } from '../models/Role.model'

const roleService = new RoleService()

/**
 * Middleware que requiere un permiso específico
 * 
 * @param permission - Nombre del permiso requerido (ej: "users.create")
 * 
 * Ejemplo:
 *   router.post('/users', authenticate, requirePermission('users.create'), controller.create)
 */
export function requirePermission(permission: PermissionName | string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user
      
      if (!user || !user.id) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          message: HTTP_MESSAGES.UNAUTHORIZED,
          error: 'Authentication required',
        })
        return
      }
      
      const hasPermission = await roleService.userHasPermission(user.id, permission)
      
      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          message: HTTP_MESSAGES.FORBIDDEN,
          error: `Permission required: ${permission}`,
        })
        return
      }
      
      next()
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: HTTP_MESSAGES.INTERNAL_ERROR,
        error: 'Error checking permissions',
      })
    }
  }
}

/**
 * Middleware que requiere al menos uno de los permisos especificados
 * 
 * @param permissions - Array de permisos (si tiene alguno, puede acceder)
 * 
 * Ejemplo:
 *   router.get('/users', authenticate, requireAnyPermission(['users.read', 'admin.access']), controller.getAll)
 */
export function requireAnyPermission(permissions: (PermissionName | string)[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user
      
      if (!user || !user.id) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          message: HTTP_MESSAGES.UNAUTHORIZED,
          error: 'Authentication required',
        })
        return
      }
      
      // Verificar si tiene al menos uno de los permisos
      const permissionChecks = await Promise.all(
        permissions.map((permission) => roleService.userHasPermission(user.id, permission))
      )
      
      const hasAnyPermission = permissionChecks.some((has) => has === true)
      
      if (!hasAnyPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          message: HTTP_MESSAGES.FORBIDDEN,
          error: `One of these permissions required: ${permissions.join(', ')}`,
        })
        return
      }
      
      next()
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: HTTP_MESSAGES.INTERNAL_ERROR,
        error: 'Error checking permissions',
      })
    }
  }
}

/**
 * Middleware que requiere todos los permisos especificados
 * 
 * @param permissions - Array de permisos (debe tener todos)
 * 
 * Ejemplo:
 *   router.delete('/users/:id', authenticate, requireAllPermissions(['users.delete', 'admin.access']), controller.delete)
 */
export function requireAllPermissions(permissions: (PermissionName | string)[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user
      
      if (!user || !user.id) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          message: HTTP_MESSAGES.UNAUTHORIZED,
          error: 'Authentication required',
        })
        return
      }
      
      // Verificar si tiene todos los permisos
      const permissionChecks = await Promise.all(
        permissions.map((permission) => roleService.userHasPermission(user.id, permission))
      )
      
      const hasAllPermissions = permissionChecks.every((has) => has === true)
      
      if (!hasAllPermissions) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          message: HTTP_MESSAGES.FORBIDDEN,
          error: `All of these permissions required: ${permissions.join(', ')}`,
        })
        return
      }
      
      next()
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: HTTP_MESSAGES.INTERNAL_ERROR,
        error: 'Error checking permissions',
      })
    }
  }
}

/**
 * Middleware que requiere un rol específico
 * 
 * @param roleName - Nombre del rol requerido (ej: "admin")
 * 
 * Ejemplo:
 *   router.get('/admin', authenticate, requireRole('admin'), controller.admin)
 */
export function requireRole(roleName: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user
      
      if (!user || !user.role) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          message: HTTP_MESSAGES.UNAUTHORIZED,
          error: 'Authentication required',
        })
        return
      }
      
      if (user.role !== roleName) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          message: HTTP_MESSAGES.FORBIDDEN,
          error: `Role required: ${roleName}`,
        })
        return
      }
      
      next()
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: HTTP_MESSAGES.INTERNAL_ERROR,
        error: 'Error checking role',
      })
    }
  }
}

