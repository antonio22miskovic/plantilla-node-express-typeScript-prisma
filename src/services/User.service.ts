/**
 * SERVICE - Capa de Lógica de Negocio
 * 
 * Los Services contienen la lógica de negocio de la aplicación.
 * Esta capa orquesta las operaciones y aplica las reglas de negocio.
 * 
 * RESPONSABILIDADES:
 * - Implementar reglas de negocio
 * - Validar datos de entrada
 * - Orquestar operaciones entre repositories
 * - Transformar datos entre capas
 * 
 * REGLAS:
 * - NO debe conocer detalles de HTTP (req/res)
 * - NO debe acceder directamente a la base de datos (usa Repository)
 * - Debe ser independiente del framework (Express)
 * 
 * USO:
 *   import { UserService } from '../services/User.service'
 *   const userService = new UserService()
 *   const user = await userService.createUser(data)
 */

import { UserRepository } from '../repositories/User.repository'
import type { CreateUserInput, UpdateUserInput, UserFilters, UserOrderBy } from '../models/User.model'
import type { User } from '@prisma/client'
import { HTTP_STATUS, PRISMA_ERROR_CODES } from '../constants'
import { validateEmail } from '../utils'

export class UserService {
  private userRepository: UserRepository
  
  constructor() {
    this.userRepository = new UserRepository()
  }
  
  /**
   * Obtiene todos los usuarios con paginación
   */
  async getAllUsers(
    filters?: UserFilters,
    orderBy?: UserOrderBy,
    page = 1,
    limit = 10
  ) {
    // Validar parámetros de paginación
    const validPage = Math.max(1, page)
    const validLimit = Math.min(Math.max(1, limit), 100) // Máximo 100 por página
    const skip = (validPage - 1) * validLimit
    
    // Obtener usuarios y total
    const [users, total] = await Promise.all([
      this.userRepository.findAll(filters, orderBy, skip, validLimit),
      this.userRepository.count(filters),
    ])
    
    return {
      data: users,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages: Math.ceil(total / validLimit),
      },
    }
  }
  
  /**
   * Obtiene un usuario por ID
   */
  async getUserById(id: number) {
    if (!id || id <= 0) {
      throw new Error('ID de usuario inválido')
    }
    
    const user = await this.userRepository.findById(id)
    
    if (!user) {
      const error = new Error('Usuario no encontrado') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.NOT_FOUND
      throw error
    }
    
    return user
  }
  
  
  /**
   * Crea un nuevo usuario
   */
  async createUser(data: CreateUserInput): Promise<User> {
    // Validar datos de entrada
    if (!data.email) {
      const error = new Error('El email es requerido') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.BAD_REQUEST
      throw error
    }
    
    if (!validateEmail(data.email)) {
      const error = new Error('Formato de email inválido') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.BAD_REQUEST
      throw error
    }
    
    // Verificar si el usuario ya existe
    const exists = await this.userRepository.existsByEmail(data.email)
    if (exists) {
      const error = new Error('Ya existe un usuario con este email') as Error & { statusCode?: number; code?: string }
      error.statusCode = HTTP_STATUS.CONFLICT
      error.code = PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT
      throw error
    }
    
    // Crear el usuario
    try {
      return await this.userRepository.create(data)
    } catch (error: unknown) {
      // Manejar errores de Prisma
      if (isPrismaError(error) && error.code === PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT) {
        const prismaError = new Error('User with this email already exists') as Error & { statusCode?: number; code?: string }
        prismaError.statusCode = HTTP_STATUS.CONFLICT
        prismaError.code = PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT
        throw prismaError
      }
      throw error
    }
  }
  
  /**
   * Actualiza un usuario existente
   */
  async updateUser(id: number, data: UpdateUserInput): Promise<User> {
    if (!id || id <= 0) {
      const error = new Error('Invalid user ID') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.BAD_REQUEST
      throw error
    }
    
    // Validar email si se proporciona
    if (data.email && !validateEmail(data.email)) {
      const error = new Error('Formato de email inválido') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.BAD_REQUEST
      throw error
    }
    
    // Verificar si el usuario existe
    const user = await this.userRepository.findById(id)
    if (!user) {
      const error = new Error('Usuario no encontrado') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.NOT_FOUND
      throw error
    }
    
    // Verificar si el nuevo email ya está en uso por otro usuario
    if (data.email && data.email !== user.email) {
      const exists = await this.userRepository.existsByEmail(data.email)
      if (exists) {
        const error = new Error('Ya existe un usuario con este email') as Error & { statusCode?: number; code?: string }
        error.statusCode = HTTP_STATUS.CONFLICT
        error.code = PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT
        throw error
      }
    }
    
    // Actualizar el usuario
    try {
      return await this.userRepository.update(id, data)
    } catch (error: unknown) {
      if (isPrismaError(error) && error.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) {
        const prismaError = new Error('User not found') as Error & { statusCode?: number }
        prismaError.statusCode = HTTP_STATUS.NOT_FOUND
        throw prismaError
      }
      throw error
    }
  }
  
  /**
   * Elimina un usuario
   */
  async deleteUser(id: number): Promise<void> {
    if (!id || id <= 0) {
      const error = new Error('Invalid user ID') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.BAD_REQUEST
      throw error
    }
    
    // Verificar si el usuario existe
    const user = await this.userRepository.findById(id)
    if (!user) {
      const error = new Error('Usuario no encontrado') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.NOT_FOUND
      throw error
    }
    
    // Eliminar el usuario
    try {
      await this.userRepository.delete(id)
    } catch (error: unknown) {
      if (isPrismaError(error) && error.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) {
        const prismaError = new Error('User not found') as Error & { statusCode?: number }
        prismaError.statusCode = HTTP_STATUS.NOT_FOUND
        throw prismaError
      }
      throw error
    }
  }
}

/**
 * Helper para verificar si un error es de Prisma
 */
function isPrismaError(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  )
}

