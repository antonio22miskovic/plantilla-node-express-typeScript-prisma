/**
 * JWT CONFIGURATION
 * 
 * Configuración para JSON Web Tokens (JWT)
 * 
 * Este archivo contiene la configuración y utilidades para JWT.
 * Asegúrate de tener instalado: npm install jsonwebtoken @types/jsonwebtoken
 * 
 * USO:
 *   import { generateToken, verifyToken } from '../config/jwt.config'
 */

import jwt from 'jsonwebtoken'
import type { JwtPayload } from '../types'

// ============================================
// CONFIGURACIÓN
// ============================================

/**
 * Clave secreta para firmar los tokens JWT
 * IMPORTANTE: En producción, usa una variable de entorno fuerte y segura
 * Genera una clave segura con: openssl rand -base64 32
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

/**
 * Tiempo de expiración del token de acceso (15 minutos por defecto)
 */
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m'

/**
 * Tiempo de expiración del token de refresco (7 días por defecto)
 */
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

// ============================================
// GENERAR TOKENS
// ============================================

/**
 * Genera un token JWT de acceso
 * 
 * @param payload - Datos a incluir en el token (userId, email, role, etc)
 * @returns Token JWT firmado
 */
export function generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  })
}

/**
 * Genera un token JWT de refresco
 * 
 * @param payload - Datos a incluir en el token
 * @returns Token JWT de refresco firmado
 */
export function generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  })
}

/**
 * Genera ambos tokens (acceso y refresco)
 * 
 * @param payload - Datos a incluir en los tokens
 * @returns Objeto con ambos tokens
 */
export function generateTokens(payload: Omit<JwtPayload, 'iat' | 'exp'>) {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  }
}

// ============================================
// VERIFICAR TOKENS
// ============================================

/**
 * Verifica y decodifica un token JWT
 * 
 * @param token - Token JWT a verificar
 * @returns Payload decodificado del token
 * @throws Error si el token es inválido o ha expirado
 */
export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired')
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token')
    }
    throw error
  }
}

/**
 * Decodifica un token sin verificar (útil para debugging)
 * NO usar en producción para validación de seguridad
 * 
 * @param token - Token JWT a decodificar
 * @returns Payload decodificado sin verificar
 */
export function decodeToken(token: string): JwtPayload | null {
  return jwt.decode(token) as JwtPayload | null
}

// ============================================
// EXPORTAR CONFIGURACIÓN
// ============================================

export const jwtConfig = {
  secret: JWT_SECRET,
  accessTokenExpiresIn: ACCESS_TOKEN_EXPIRES_IN,
  refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRES_IN,
} as const

