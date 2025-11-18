/**
 * ROLE SERVICE - Lógica de Negocio de Roles y Permisos
 * 
 * Este service contiene toda la lógica de negocio relacionada con roles y permisos.
 * 
 * USO:
 *   import { RoleService } from '../services/Role.service'
 *   const roleService = new RoleService()
 */

import { RoleRepository, PermissionRepository } from '../repositories/Role.repository'
import { HTTP_STATUS } from '../constants'
import type { CreateRoleInput, UpdateRoleInput, CreatePermissionInput, UpdatePermissionInput } from '../models/Role.model'
import { PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, ROLE_NAMES } from '../models/Role.model'

export class RoleService {
  private roleRepository: RoleRepository
  private permissionRepository: PermissionRepository
  
  constructor() {
    this.roleRepository = new RoleRepository()
    this.permissionRepository = new PermissionRepository()
  }
  
  /**
   * Inicializa los roles y permisos por defecto
   * Debe ejecutarse una vez al inicio del proyecto
   */
  async initializeDefaultRolesAndPermissions(): Promise<void> {
    // Crear permisos estándar
    const permissionNames = Object.values(PERMISSIONS)
    const existingPermissions = await this.permissionRepository.findAll()
    const existingPermissionNames = existingPermissions.map((p) => p.name)
    
    const permissionsToCreate = permissionNames
      .filter((name) => !existingPermissionNames.includes(name))
      .map((name) => ({
        name,
        description: `Permission: ${name}`,
      }))
    
    if (permissionsToCreate.length > 0) {
      await this.permissionRepository.createMany(permissionsToCreate)
    }
    
    // Crear roles por defecto
    const allPermissions = await this.permissionRepository.findAll()
    const permissionMap = new Map(allPermissions.map((p) => [p.name, p.id]))
    
    // Crear rol ADMIN
    const adminRole = await this.roleRepository.findByName(ROLE_NAMES.ADMIN)
    if (!adminRole) {
      const adminPermissionIds = DEFAULT_ROLE_PERMISSIONS[ROLE_NAMES.ADMIN]
        .map((permName) => permissionMap.get(permName))
        .filter((id): id is number => id !== undefined)
      
      await this.roleRepository.create({
        name: ROLE_NAMES.ADMIN,
        description: 'Administrator role with full access',
        permissionIds: adminPermissionIds,
      })
    }
    
    // Crear rol USER
    const userRole = await this.roleRepository.findByName(ROLE_NAMES.USER)
    if (!userRole) {
      const userPermissionIds = DEFAULT_ROLE_PERMISSIONS[ROLE_NAMES.USER]
        .map((permName) => permissionMap.get(permName))
        .filter((id): id is number => id !== undefined)
      
      await this.roleRepository.create({
        name: ROLE_NAMES.USER,
        description: 'Standard user role with basic permissions',
        permissionIds: userPermissionIds,
      })
    }
  }
  
  /**
   * Obtiene todos los roles
   */
  async getAllRoles() {
    return this.roleRepository.findAll()
  }
  
  /**
   * Obtiene un rol por ID
   */
  async getRoleById(id: number) {
    const role = await this.roleRepository.findById(id)
    if (!role) {
      const error = new Error('Role not found') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.NOT_FOUND
      throw error
    }
    return role
  }
  
  /**
   * Obtiene un rol por ID con sus permisos
   */
  async getRoleByIdWithPermissions(id: number) {
    const role = await this.roleRepository.findByIdWithPermissions(id)
    if (!role) {
      const error = new Error('Role not found') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.NOT_FOUND
      throw error
    }
    return role
  }
  
  /**
   * Crea un nuevo rol
   */
  async createRole(data: CreateRoleInput) {
    // Verificar si el rol ya existe
    const existing = await this.roleRepository.findByName(data.name)
    if (existing) {
      const error = new Error('Role with this name already exists') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.CONFLICT
      throw error
    }
    
    return this.roleRepository.create(data)
  }
  
  /**
   * Actualiza un rol
   */
  async updateRole(id: number, data: UpdateRoleInput) {
    await this.getRoleById(id) // Verifica que existe
    
    // Verificar nombre único si se está cambiando
    if (data.name) {
      const existing = await this.roleRepository.findByName(data.name)
      if (existing && existing.id !== id) {
        const error = new Error('Role with this name already exists') as Error & { statusCode?: number }
        error.statusCode = HTTP_STATUS.CONFLICT
        throw error
      }
    }
    
    return this.roleRepository.update(id, data)
  }
  
  /**
   * Elimina un rol
   */
  async deleteRole(id: number) {
    await this.getRoleById(id) // Verifica que existe
    
    // Verificar que no sea un rol del sistema (admin o user)
    const role = await this.roleRepository.findById(id)
    if (role && (role.name === ROLE_NAMES.ADMIN || role.name === ROLE_NAMES.USER)) {
      const error = new Error('Cannot delete system roles') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.BAD_REQUEST
      throw error
    }
    
    return this.roleRepository.delete(id)
  }
  
  /**
   * Verifica si un usuario tiene un permiso específico
   */
  async userHasPermission(userId: number, permissionName: string): Promise<boolean> {
    // Obtener el usuario con su rol
    const { db } = await import('../config/prisma')
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { role: true },
    })
    
    if (!user || !user.role) {
      return false
    }
    
    return this.roleRepository.hasPermission(user.role.id, permissionName)
  }
  
  /**
   * Obtiene todos los permisos
   */
  async getAllPermissions() {
    return this.permissionRepository.findAll()
  }
  
  /**
   * Crea un nuevo permiso
   */
  async createPermission(data: CreatePermissionInput) {
    // Verificar si el permiso ya existe
    const existing = await this.permissionRepository.findByName(data.name)
    if (existing) {
      const error = new Error('Permission with this name already exists') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.CONFLICT
      throw error
    }
    
    return this.permissionRepository.create(data)
  }
  
  /**
   * Actualiza un permiso
   */
  async updatePermission(id: number, data: UpdatePermissionInput) {
    await this.permissionRepository.findById(id) // Verifica que existe
    
    // Verificar nombre único si se está cambiando
    if (data.name) {
      const existing = await this.permissionRepository.findByName(data.name)
      if (existing && existing.id !== id) {
        const error = new Error('Permission with this name already exists') as Error & { statusCode?: number }
        error.statusCode = HTTP_STATUS.CONFLICT
        throw error
      }
    }
    
    return this.permissionRepository.update(id, data)
  }
}

