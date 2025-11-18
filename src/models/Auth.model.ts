/**
 * AUTH MODELS - Tipos para Autenticación
 * 
 * Este archivo contiene los tipos TypeScript relacionados con autenticación:
 * DTOs, inputs, outputs, etc.
 * 
 * USO:
 *   import type { RegisterInput, LoginInput, AuthResponse } from '../models/Auth.model'
 */

// ============================================
// INPUT TYPES (DTOs)
// ============================================

/**
 * Datos necesarios para registrar un nuevo usuario
 */
export interface RegisterInput {
  email: string
  password: string
  name?: string
}

/**
 * Datos necesarios para iniciar sesión
 */
export interface LoginInput {
  email: string
  password: string
}

/**
 * Datos para solicitar recuperación de contraseña
 */
export interface ForgotPasswordInput {
  email: string
}

/**
 * Datos para resetear la contraseña con token
 */
export interface ResetPasswordInput {
  token: string
  password: string
}

/**
 * Datos para cambiar la contraseña (requiere autenticación)
 */
export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

/**
 * Datos para refrescar el access token
 */
export interface RefreshTokenInput {
  refreshToken: string
}

// ============================================
// OUTPUT TYPES
// ============================================

/**
 * Respuesta de autenticación con tokens
 */
export interface AuthResponse {
  user: {
    id: number
    email: string
    name: string | null
    role: string
  }
  accessToken: string
  refreshToken: string
}

/**
 * Respuesta de refresh token
 */
export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

