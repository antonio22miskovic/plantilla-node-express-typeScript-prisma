/**
 * MODELS - Modelos y Tipos de Datos
 * 
 * Este archivo contiene los tipos TypeScript derivados de los modelos de Prisma
 * y tipos adicionales relacionados con el modelo User.
 * 
 * NOTA: Los tipos de Prisma se generan automáticamente con:
 *   npm run prisma:generate
 * 
 * Puedes importarlos así:
 *   import type { User } from '@prisma/client'
 * 
 * USO:
 *   import type { UserWithRelations, CreateUserInput } from '../models/User.model'
 */

import type { User } from '@prisma/client'

// ============================================
// TIPOS DE PRISMA (generados automáticamente)
// ============================================
//
// Estos tipos están disponibles después de ejecutar prisma generate:
// - User: Tipo básico del modelo User
//
// NOTA: Agrega aquí otros tipos cuando crees nuevos modelos
// Ejemplo: import type { User, Product, Order } from '@prisma/client'

// ============================================
// TIPOS CON RELACIONES
// ============================================
//
// Tipos que incluyen relaciones de Prisma usando Prisma.UserGetPayload

/**
 * Usuario con relaciones personalizadas
 * 
 * NOTA: Agrega aquí los tipos de relaciones cuando crees nuevos modelos
 * Ejemplo:
 * export type UserWithOrders = User & { orders: Order[] }
 */
export type UserWithRelations<T = Record<string, unknown>> = User & T

// ============================================
// TIPOS DE INPUT (DTOs)
// ============================================

/**
 * Datos necesarios para crear un usuario
 */
export interface CreateUserInput {
  email: string
  name?: string
  // Agrega más campos según necesites
  // password: string
  // role?: string
}

/**
 * Datos para actualizar un usuario
 */
export interface UpdateUserInput {
  email?: string
  name?: string
  // Agrega más campos según necesites
  // password?: string
  // isActive?: boolean
}

// ============================================
// TIPOS DE OUTPUT (respuestas)
// ============================================

/**
 * Usuario sin información sensible (para respuestas públicas)
 */
export type PublicUser = Omit<User, 'password'>

/**
 * Usuario con información mínima (para listados)
 */
export type UserSummary = Pick<User, 'id' | 'email' | 'name'>

// ============================================
// TIPOS DE FILTROS Y BÚSQUEDA
// ============================================

/**
 * Filtros para buscar usuarios
 */
export interface UserFilters {
  email?: string
  name?: string
  // Agrega más filtros según necesites
  // role?: string
  // isActive?: boolean
}

/**
 * Opciones de ordenamiento para usuarios
 */
export interface UserOrderBy {
  id?: 'asc' | 'desc'
  email?: 'asc' | 'desc'
  name?: 'asc' | 'desc'
  createdAt?: 'asc' | 'desc'
}

