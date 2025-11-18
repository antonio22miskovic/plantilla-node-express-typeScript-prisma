/**
 * TYPES - Tipos Globales de TypeScript
 * 
 * Este archivo contiene tipos, interfaces y tipos de utilidad
 * que se usan en toda la aplicación.
 * 
 * USO:
 *   import type { ApiResponse, PaginationParams } from '../types'
 */

import { Request } from 'express'

// ============================================
// TIPOS DE RESPUESTA API
// ============================================

/**
 * Respuesta estándar de la API
 * Usa este tipo para mantener consistencia en todas las respuestas
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
  statusCode?: number
}

/**
 * Respuesta de error estándar
 */
export interface ApiError {
  message: string
  code?: string
  details?: unknown
}

// ============================================
// PAGINACIÓN
// ============================================

/**
 * Parámetros de paginación para listados
 */
export interface PaginationParams {
  page?: number
  limit?: number
  skip?: number
  take?: number
}

/**
 * Resultado paginado
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================
// EXTENSIONES DE EXPRESS REQUEST
// ============================================
//
// Extiende el tipo Request de Express para incluir datos personalizados
// que agregas en los middlewares (ej: usuario autenticado)

export interface AuthenticatedRequest extends Request {
  // Usuario autenticado (agregado por el middleware de autenticación)
  user?: {
    id: number
    email: string
    role?: string        // Nombre del rol (ej: "admin", "user")
    roleId?: number      // ID del rol en la base de datos
    // Agrega más campos según necesites
  }
  
  // Otros datos que puedas agregar en middlewares
  // requestId?: string  // Para logging/tracing
  // ip?: string         // IP del cliente
}

// ============================================
// TIPOS DE UTILIDAD
// ============================================

/**
 * Hace todas las propiedades de un tipo opcionales
 */
export type Partial<T> = {
  [P in keyof T]?: T[P]
}

/**
 * Hace todas las propiedades de un tipo requeridas
 */
export type Required<T> = {
  [P in keyof T]-?: T[P]
}

/**
 * Selecciona solo ciertas propiedades de un tipo
 */
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

/**
 * Omite ciertas propiedades de un tipo
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

// ============================================
// TIPOS PARA DTOs (Data Transfer Objects)
// ============================================
//
// DTOs son objetos que definen la estructura de datos
// que se transfieren entre capas (request/response)

/**
 * DTO para crear un usuario
 */
export interface CreateUserDto {
  email: string
  name?: string
  password?: string
}

/**
 * DTO para actualizar un usuario
 */
export interface UpdateUserDto {
  email?: string
  name?: string
  password?: string
}

/**
 * DTO para login
 */
export interface LoginDto {
  email: string
  password: string
}

// ============================================
// TIPOS PARA JWT
// ============================================

/**
 * Payload del token JWT
 */
export interface JwtPayload {
  userId: number
  email: string
  role?: string
  iat?: number  // Issued at
  exp?: number  // Expiration
}

