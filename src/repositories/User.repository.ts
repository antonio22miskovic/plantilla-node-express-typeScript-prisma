/**
 * REPOSITORY - Capa de Acceso a Datos
 * 
 * Los Repositories encapsulan toda la lógica de acceso a la base de datos.
 * Esta capa abstrae Prisma y permite cambiar el ORM sin afectar otras capas.
 * 
 * RESPONSABILIDADES:
 * - Ejecutar queries de Prisma
 * - Manejar relaciones entre modelos
 * - Abstraer la complejidad de la base de datos
 * 
 * REGLAS:
 * - NO debe contener lógica de negocio
 * - NO debe validar datos (eso es responsabilidad del Service)
 * - Solo debe interactuar con la base de datos
 * 
 * USO:
 *   import { UserRepository } from '../repositories/User.repository'
 *   const userRepo = new UserRepository()
 *   const users = await userRepo.findAll()
 */

import { db } from '../config/prisma'
import type { User, Prisma } from '@prisma/client'
import type { CreateUserInput, UpdateUserInput, UserFilters, UserOrderBy } from '../models/User.model'

export class UserRepository {
  /**
   * Encuentra todos los usuarios con opciones de filtrado y paginación
   * Excluye campos sensibles como password y tokens
   */
  async findAll(
    filters?: UserFilters,
    orderBy?: UserOrderBy,
    skip?: number,
    take?: number
  ): Promise<User[]> {
    const where: Prisma.UserWhereInput = {}
    
    // Aplicar filtros
    if (filters?.email) {
      where.email = { contains: filters.email }
    }
    if (filters?.name) {
      where.name = { contains: filters.name }
    }
    
    // Construir ordenamiento
    const orderByClause: Prisma.UserOrderByWithRelationInput = {}
    if (orderBy?.id) orderByClause.id = orderBy.id
    if (orderBy?.email) orderByClause.email = orderBy.email
    if (orderBy?.name) orderByClause.name = orderBy.name
    if (orderBy?.createdAt) orderByClause.createdAt = orderBy.createdAt
    
    const queryOptions: any = {
      where,
      skip,
      take,
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        // Excluir: password, refreshToken, passwordResetToken, passwordResetExpires, roleId
      },
    }
    
    if (Object.keys(orderByClause).length > 0) {
      queryOptions.orderBy = orderByClause
    }
    
    return db.user.findMany(queryOptions) as Promise<User[]>
  }
  
  /**
   * Cuenta el total de usuarios que coinciden con los filtros
   */
  async count(filters?: UserFilters): Promise<number> {
    const where: Prisma.UserWhereInput = {}
    
    if (filters?.email) {
      where.email = { contains: filters.email }
    }
    if (filters?.name) {
      where.name = { contains: filters.name }
    }
    
    return db.user.count({ where })
  }
  
  /**
   * Encuentra un usuario por su ID
   * Excluye campos sensibles como password y tokens
   */
  async findById(id: number): Promise<User | null> {
    return db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        // Excluir: password, refreshToken, passwordResetToken, passwordResetExpires, roleId
      },
    }) as Promise<User | null>
  }
  
  /**
   * Encuentra un usuario por su email
   * Excluye campos sensibles como password y tokens
   */
  async findByEmail(email: string): Promise<User | null> {
    return db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        // Excluir: password, refreshToken, passwordResetToken, passwordResetExpires, roleId
      },
    }) as Promise<User | null>
  }
  
  /**
   * Encuentra un usuario por ID con sus relaciones
   * 
   * NOTA: Agrega aquí las relaciones que necesites cuando crees nuevos modelos
   * Ejemplo: include: { orders: true, comments: true }
   */
  async findByIdWithRelations(id: number, include?: Record<string, boolean>) {
    return db.user.findUnique({
      where: { id },
      include: include || {},
    })
  }
  
  /**
   * Crea un nuevo usuario
   * 
   * NOTA: Este método requiere password y roleId.
   * Para crear usuarios, normalmente deberías usar AuthRepository.create()
   * que maneja el hash de contraseña y asigna el rol por defecto.
   */
  async create(data: CreateUserInput & { password: string; roleId?: number }) {
    const createData: any = {
      email: data.email,
      password: data.password,
      roleId: data.roleId || 2, // Por defecto rol "user"
    }
    
    if (data.name !== undefined) {
      createData.name = data.name
    }
    
    return db.user.create({
      data: createData,
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        role: true,
      },
    })
  }
  
  /**
   * Actualiza un usuario existente
   */
  async update(id: number, data: UpdateUserInput): Promise<User> {
    return db.user.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.name !== undefined && { name: data.name }),
      },
    })
  }
  
  /**
   * Elimina un usuario
   */
  async delete(id: number): Promise<User> {
    return db.user.delete({
      where: { id },
    })
  }
  
  /**
   * Verifica si un usuario existe por email
   */
  async existsByEmail(email: string): Promise<boolean> {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true },
    })
    return user !== null
  }
}

