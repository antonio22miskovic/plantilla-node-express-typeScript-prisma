/**
 * CONSTANTS - Constantes Globales de la Aplicación
 * 
 * Este archivo contiene todas las constantes reutilizables de la aplicación:
 * - Mensajes de respuesta
 * - Códigos de error
 * - Valores de configuración
 * - Textos estándar
 * 
 * USO:
 *   import { HTTP_MESSAGES, ERROR_CODES } from '../constants'
 */

// ============================================
// MENSAJES HTTP ESTÁNDAR
// ============================================

export const HTTP_MESSAGES = {
  // Mensajes de éxito
  SUCCESS: 'Operación completada exitosamente',
  CREATED: 'Recurso creado exitosamente',
  UPDATED: 'Recurso actualizado exitosamente',
  DELETED: 'Recurso eliminado exitosamente',
  
  // Mensajes de error
  NOT_FOUND: 'Recurso no encontrado',
  UNAUTHORIZED: 'Acceso no autorizado',
  FORBIDDEN: 'Acceso prohibido',
  BAD_REQUEST: 'Solicitud incorrecta',
  INTERNAL_ERROR: 'Error interno del servidor',
  VALIDATION_ERROR: 'Error de validación',
  
  // Mensajes específicos
  USER_CREATED: 'Usuario creado exitosamente',
  USER_UPDATED: 'Usuario actualizado exitosamente',
  USER_DELETED: 'Usuario eliminado exitosamente',
  USER_NOT_FOUND: 'Usuario no encontrado',
  USER_ALREADY_EXISTS: 'Ya existe un usuario con este email',
} as const

// ============================================
// CÓDIGOS DE ERROR PRISMA
// ============================================
// 
// Códigos de error comunes de Prisma para manejo de errores
// Documentación: https://www.prisma.io/docs/reference/api-reference/error-reference

export const PRISMA_ERROR_CODES = {
  // Error de constraint único violado (ej: email duplicado)
  UNIQUE_CONSTRAINT: 'P2002',
  
  // Registro no encontrado
  RECORD_NOT_FOUND: 'P2025',
  
  // Foreign key constraint violado
  FOREIGN_KEY_CONSTRAINT: 'P2003',
  
  // Valor requerido faltante
  REQUIRED_VALUE_MISSING: 'P2011',
} as const

// ============================================
// CÓDIGOS DE ESTADO HTTP
// ============================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const

// ============================================
// CONFIGURACIÓN DE VALIDACIÓN
// ============================================

export const VALIDATION = {
  // Longitudes mínimas y máximas
  EMAIL_MIN_LENGTH: 5,
  EMAIL_MAX_LENGTH: 255,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  
  // Patrones de validación (regex)
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const

// ============================================
// CONFIGURACIÓN DE JWT (ejemplo - ajustar según necesidades)
// ============================================

export const JWT_CONFIG = {
  // Tiempo de expiración de tokens
  ACCESS_TOKEN_EXPIRES_IN: '15m',      // 15 minutos
  REFRESH_TOKEN_EXPIRES_IN: '7d',      // 7 días
  
  // Tipos de token
  TOKEN_TYPES: {
    ACCESS: 'access',
    REFRESH: 'refresh',
  },
} as const

// ============================================
// ROLES DE USUARIO (ejemplo - ajustar según necesidades)
// ============================================

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

