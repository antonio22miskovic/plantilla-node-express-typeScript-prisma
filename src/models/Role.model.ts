/**
 * ROLE MODELS - Tipos para Roles y Permisos
 * 
 * Este archivo contiene los tipos TypeScript relacionados con roles y permisos.
 * 
 * USO:
 *   import type { CreateRoleInput, PermissionInput } from '../models/Role.model'
 */

import type { Role, Permission } from '@prisma/client'

// ============================================
// INPUT TYPES (DTOs)
// ============================================

/**
 * Datos necesarios para crear un rol
 */
export interface CreateRoleInput {
  name: string
  description?: string
  permissionIds?: number[] // IDs de permisos a asignar
}

/**
 * Datos para actualizar un rol
 */
export interface UpdateRoleInput {
  name?: string
  description?: string
  isActive?: boolean
  permissionIds?: number[] // IDs de permisos a asignar (reemplaza los existentes)
}

/**
 * Datos necesarios para crear un permiso
 */
export interface CreatePermissionInput {
  name: string // Formato: "recurso.accion" (ej: "users.create")
  description?: string
}

/**
 * Datos para actualizar un permiso
 */
export interface UpdatePermissionInput {
  name?: string
  description?: string
  isActive?: boolean
}

/**
 * Datos para asignar permisos a un rol
 */
export interface AssignPermissionsInput {
  permissionIds: number[]
}

// ============================================
// OUTPUT TYPES
// ============================================

/**
 * Rol con sus permisos incluidos
 */
export type RoleWithPermissions = Role & {
  permissions: Permission[]
}

/**
 * Permiso con información básica
 */
export type PermissionInfo = Permission

// ============================================
// CONSTANTES DE ROLES Y PERMISOS
// ============================================

/**
 * Nombres de roles estándar
 */
export const ROLE_NAMES = {
  ADMIN: 'admin',
  USER: 'user',
} as const

export type RoleName = typeof ROLE_NAMES[keyof typeof ROLE_NAMES]

/**
 * Permisos estándar del sistema
 * Formato: "recurso.accion"
 */
export const PERMISSIONS = {
  // Usuarios
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_MANAGE: 'users.manage', // Todos los permisos de usuarios
  
  // Roles y Permisos
  ROLES_READ: 'roles.read',
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',
  ROLES_MANAGE: 'roles.manage',
  
  PERMISSIONS_READ: 'permissions.read',
  PERMISSIONS_MANAGE: 'permissions.manage',
  
  // Administración
  ADMIN_ACCESS: 'admin.access', // Acceso completo al sistema
} as const

export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS]

/**
 * Permisos asignados por defecto a cada rol
 */
export const DEFAULT_ROLE_PERMISSIONS = {
  [ROLE_NAMES.ADMIN]: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.ROLES_MANAGE,
    PERMISSIONS.PERMISSIONS_MANAGE,
  ],
  [ROLE_NAMES.USER]: [
    PERMISSIONS.USERS_READ, // Solo lectura de su propio perfil
  ],
} as const

