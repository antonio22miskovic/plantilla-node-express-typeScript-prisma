/**
 * UTILS - Utilidades y Helpers
 * 
 * Este archivo contiene funciones auxiliares reutilizables
 * que no pertenecen a ninguna capa específica.
 * 
 * USO:
 *   import { formatError, validateEmail } from '../utils'
 */

// ============================================
// VALIDACIÓN
// ============================================

/**
 * Valida si un email tiene formato válido
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida si una contraseña cumple con los requisitos mínimos
 */
export function validatePassword(password: string, minLength = 8): boolean {
  return password.length >= minLength
}

/**
 * Valida si un string no está vacío
 */
export function isNotEmpty(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim().length > 0
}

// ============================================
// FORMATEO DE DATOS
// ============================================

/**
 * Formatea un error para la respuesta de la API
 */
export function formatError(error: unknown): { message: string; details?: unknown } {
  if (error instanceof Error) {
    return {
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }
  }
  
  return {
    message: 'An unknown error occurred',
    details: error,
  }
}

/**
 * Sanitiza un string removiendo caracteres peligrosos
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

// ============================================
// PAGINACIÓN
// ============================================

/**
 * Calcula los valores de skip y take para Prisma basado en página y límite
 */
export function getPaginationParams(page = 1, limit = 10): { skip: number; take: number } {
  const skip = (page - 1) * limit
  const take = limit
  
  return { skip, take }
}

/**
 * Calcula el total de páginas
 */
export function getTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit)
}

// ============================================
// FECHAS
// ============================================

/**
 * Formatea una fecha a formato ISO string
 */
export function formatDate(date: Date): string {
  return date.toISOString()
}

/**
 * Obtiene la fecha actual
 */
export function getCurrentDate(): Date {
  return new Date()
}

// ============================================
// STRINGS
// ============================================

/**
 * Convierte un string a camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

/**
 * Convierte un string a kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

// ============================================
// OBJETOS
// ============================================

/**
 * Omite propiedades de un objeto
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach((key) => {
    delete result[key]
  })
  return result
}

/**
 * Selecciona solo ciertas propiedades de un objeto
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

