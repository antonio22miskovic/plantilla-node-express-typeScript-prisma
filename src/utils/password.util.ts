/**
 * PASSWORD UTILITIES
 * 
 * Utilidades para manejo de contraseñas usando Argon2
 * 
 * Argon2 es el algoritmo ganador de la Password Hashing Competition (2015)
 * y es considerado el estándar de oro actual para hash de contraseñas.
 * 
 * Ventajas sobre bcrypt:
 * - Más resistente a ataques con GPU/ASIC
 * - Mejor protección contra side-channel attacks
 * - Configuración más flexible (memory, parallelism, time)
 * - Recomendado por OWASP y NIST
 * 
 * USO:
 *   import { hashPassword, comparePassword } from '../utils/password.util'
 */

import argon2 from 'argon2'
import crypto from 'crypto'

// Configuración de Argon2
// - type: argon2id (recomendado, combina resistencia a timing y side-channel)
// - memoryCost: 65536 (64 MB) - memoria a usar
// - timeCost: 3 - número de iteraciones
// - parallelism: 4 - número de threads
// 
// Estos valores son un buen balance entre seguridad y rendimiento.
// Ajusta según las capacidades de tu servidor.
const ARGON2_OPTIONS: argon2.Options & { raw?: false } = {
  type: argon2.argon2id,  // Mejor opción: resistencia a ambos tipos de ataques
  memoryCost: 65536,       // 64 MB de memoria
  timeCost: 3,             // 3 iteraciones
  parallelism: 4,          // 4 threads paralelos
  raw: false,              // Retornar string en lugar de Buffer
}

/**
 * Genera un hash de una contraseña usando Argon2
 * 
 * @param password - Contraseña en texto plano
 * @returns Hash de la contraseña (para almacenar en BD)
 * 
 * El hash incluye automáticamente el salt y los parámetros,
 * por lo que no necesitas almacenarlos por separado.
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS)
}

/**
 * Compara una contraseña en texto plano con un hash Argon2
 * 
 * @param password - Contraseña en texto plano a verificar
 * @param hash - Hash almacenado en la base de datos
 * @returns true si la contraseña coincide, false en caso contrario
 * 
 * Argon2 extrae automáticamente los parámetros del hash,
 * por lo que funciona incluso si cambias la configuración en el futuro.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password)
  } catch (error) {
    // Si hay error en la verificación (hash inválido, etc), retornar false
    return false
  }
}

/**
 * Valida la fortaleza de una contraseña
 * 
 * @param password - Contraseña a validar
 * @param minLength - Longitud mínima (por defecto 8)
 * @returns Objeto con isValid y mensaje de error si aplica
 */
export function validatePasswordStrength(
  password: string,
  minLength = 8
): { isValid: boolean; error?: string } {
  if (password.length < minLength) {
    return {
      isValid: false,
      error: `Password must be at least ${minLength} characters long`,
    }
  }
  
  // Verificar que tenga al menos una letra mayúscula
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter',
    }
  }
  
  // Verificar que tenga al menos una letra minúscula
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one lowercase letter',
    }
  }
  
  // Verificar que tenga al menos un número
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one number',
    }
  }
  
  // Verificar que tenga al menos un carácter especial
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one special character',
    }
  }
  
  return { isValid: true }
}

/**
 * Genera un token aleatorio seguro para recuperación de contraseña
 * 
 * @param length - Longitud del token (por defecto 32)
 * @returns Token aleatorio en hexadecimal
 */
export function generateResetToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

