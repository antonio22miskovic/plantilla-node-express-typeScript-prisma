/**
 * ROLE REPOSITORY - Capa de Acceso a Datos para Roles y Permisos
 * 
 * Este repository maneja todas las operaciones de base de datos
 * relacionadas con roles y permisos.
 * 
 * USO:
 *   import { RoleRepository } from '../repositories/Role.repository'
 *   const roleRepo = new RoleRepository()
 */

import { db } from '../config/prisma'
import type { Role, Permission, RolePermission } from '@prisma/client'
import type { CreateRoleInput, UpdateRoleInput, CreatePermissionInput, UpdatePermissionInput } from '../models/Role.model'

export class RoleRepository {
  /**
   * Encuentra todos los roles
   */
  async findAll(): Promise<Role[]> {
    return db.role.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
  }
  
  /**
   * Encuentra un rol por ID
   */
  async findById(id: number): Promise<Role | null> {
    return db.role.findUnique({
      where: { id },
    })
  }
  
  /**
   * Encuentra un rol por nombre
   */
  async findByName(name: string): Promise<Role | null> {
    return db.role.findUnique({
      where: { name },
    })
  }
  
  /**
   * Encuentra un rol por ID con sus permisos
   */
  async findByIdWithPermissions(id: number) {
    return db.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })
  }
  
  /**
   * Crea un nuevo rol
   */
  async create(data: CreateRoleInput): Promise<Role> {
    return db.role.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissionIds
          ? {
              create: data.permissionIds.map((permissionId) => ({
                permissionId,
              })),
            }
          : undefined,
      },
    })
  }
  
  /**
   * Actualiza un rol
   */
  async update(id: number, data: UpdateRoleInput): Promise<Role> {
    // Si se proporcionan nuevos permissionIds, reemplazar los existentes
    if (data.permissionIds !== undefined) {
      // Eliminar permisos existentes
      await db.rolePermission.deleteMany({
        where: { roleId: id },
      })
      
      // Crear nuevos permisos si hay alguno
      if (data.permissionIds.length > 0) {
        await db.rolePermission.createMany({
          data: data.permissionIds.map((permissionId) => ({
            roleId: id,
            permissionId,
          })),
        })
      }
    }
    
    return db.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      },
    })
  }
  
  /**
   * Elimina un rol (soft delete)
   */
  async delete(id: number): Promise<Role> {
    return db.role.update({
      where: { id },
      data: { isActive: false },
    })
  }
  
  /**
   * Asigna permisos a un rol
   */
  async assignPermissions(roleId: number, permissionIds: number[]): Promise<void> {
    // Eliminar permisos existentes
    await db.rolePermission.deleteMany({
      where: { roleId },
    })
    
    // Crear nuevos permisos
    if (permissionIds.length > 0) {
      await db.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      })
    }
  }
  
  /**
   * Obtiene los permisos de un rol
   */
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const rolePermissions = await db.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    })
    
    return rolePermissions.map((rp) => rp.permission)
  }
  
  /**
   * Verifica si un rol tiene un permiso específico
   */
  async hasPermission(roleId: number, permissionName: string): Promise<boolean> {
    const rolePermission = await db.rolePermission.findFirst({
      where: {
        roleId,
        permission: {
          name: permissionName,
          isActive: true,
        },
      },
    })
    
    return rolePermission !== null
  }
}

export class PermissionRepository {
  /**
   * Encuentra todos los permisos
   */
  async findAll(): Promise<Permission[]> {
    return db.permission.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
  }
  
  /**
   * Encuentra un permiso por ID
   */
  async findById(id: number): Promise<Permission | null> {
    return db.permission.findUnique({
      where: { id },
    })
  }
  
  /**
   * Encuentra un permiso por nombre
   */
  async findByName(name: string): Promise<Permission | null> {
    return db.permission.findUnique({
      where: { name },
    })
  }
  
  /**
   * Crea un nuevo permiso
   */
  async create(data: CreatePermissionInput): Promise<Permission> {
    return db.permission.create({
      data: {
        name: data.name,
        description: data.description,
      },
    })
  }
  
  /**
   * Actualiza un permiso
   */
  async update(id: number, data: UpdatePermissionInput): Promise<Permission> {
    return db.permission.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      },
    })
  }
  
  /**
   * Elimina un permiso (soft delete)
   */
  async delete(id: number): Promise<Permission> {
    return db.permission.update({
      where: { id },
      data: { isActive: false },
    })
  }
  
  /**
   * Crea múltiples permisos
   */
  async createMany(permissions: CreatePermissionInput[]): Promise<number> {
    const result = await db.permission.createMany({
      data: permissions,
      skipDuplicates: true,
    })
    return result.count
  }
}

