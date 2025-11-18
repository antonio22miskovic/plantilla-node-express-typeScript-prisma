/**
 * AUTH SERVICE - Lógica de Negocio de Autenticación
 * 
 * Este service contiene toda la lógica de negocio relacionada con autenticación:
 * - Registro de usuarios
 * - Login
 * - Refresh tokens
 * - Recuperación de contraseña
 * - Cambio de contraseña
 * 
 * USO:
 *   import { AuthService } from '../services/Auth.service'
 *   const authService = new AuthService()
 *   const result = await authService.login({ email, password })
 */

import { AuthRepository } from '../repositories/Auth.repository'
import { hashPassword, comparePassword, generateResetToken, validatePasswordStrength } from '../utils/password.util'
import { generateTokens, verifyToken, generateAccessToken } from '../config/jwt.config'
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants'
import { db } from '../config/prisma'
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  RefreshTokenInput,
  AuthResponse,
  RefreshTokenResponse,
} from '../models/Auth.model'

export class AuthService {
  private authRepository: AuthRepository
  
  constructor() {
    this.authRepository = new AuthRepository()
  }
  
  /**
   * Registra un nuevo usuario
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    // Validar email
    if (!input.email || !input.email.trim()) {
      const error = new Error('El email es requerido') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.BAD_REQUEST
      throw error
    }
    
    // Validar contraseña
    const passwordValidation = validatePasswordStrength(input.password)
    if (!passwordValidation.isValid) {
      const error = new Error(passwordValidation.error || 'Contraseña inválida') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.BAD_REQUEST
      throw error
    }
    
    // Verificar si el email ya existe
    const emailExists = await this.authRepository.emailExists(input.email)
    if (emailExists) {
      const error = new Error('Ya existe un usuario con este email') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.CONFLICT
      throw error
    }
    
    // Hash de la contraseña
    const hashedPassword = await hashPassword(input.password)
    
    // Crear usuario
    const user = await this.authRepository.create({
      email: input.email,
      password: hashedPassword,
      name: input.name,
    })
    
    // Obtener el rol del usuario
    const userWithRole = await db.user.findUnique({
      where: { id: user.id },
      include: { role: true },
    })
    
    const roleName = userWithRole?.role?.name || 'user'
    
    // Generar tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: roleName,
    })
    
    // Guardar refresh token en la BD
    await this.authRepository.updateRefreshToken(user.id, tokens.refreshToken)
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: roleName,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }
  
  /**
   * Inicia sesión de un usuario
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    // Validar entrada
    if (!input.email || !input.password) {
      const error = new Error('El email y la contraseña son requeridos') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.BAD_REQUEST
      throw error
    }
    
    // Buscar usuario con contraseña
    const user = await this.authRepository.findByEmailWithPassword(input.email)
    
    if (!user) {
      const error = new Error('Email o contraseña inválidos') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.UNAUTHORIZED
      throw error
    }
    
    // Verificar si el usuario está activo
    if (!user.isActive) {
      const error = new Error('La cuenta está desactivada') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.FORBIDDEN
      throw error
    }
    
    // Verificar contraseña
    const isPasswordValid = await comparePassword(input.password, user.password)
    if (!isPasswordValid) {
      const error = new Error('Email o contraseña inválidos') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.UNAUTHORIZED
      throw error
    }
    
    // Obtener el nombre del rol
    const roleName = user.role?.name || 'user'
    
    // Generar tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: roleName,
    })
    
    // Guardar refresh token en la BD
    await this.authRepository.updateRefreshToken(user.id, tokens.refreshToken)
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: roleName,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }
  
  /**
   * Refresca el access token usando un refresh token
   */
  async refreshToken(input: RefreshTokenInput): Promise<RefreshTokenResponse> {
    if (!input.refreshToken) {
      const error = new Error('El token de refresco es requerido') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.BAD_REQUEST
      throw error
    }
    
    // Verificar el refresh token
    let payload
    try {
      payload = verifyToken(input.refreshToken)
    } catch (error) {
      const authError = new Error('Token de refresco inválido o expirado') as Error & { statusCode?: number }
      authError.statusCode = HTTP_STATUS.UNAUTHORIZED
      throw authError
    }
    
    // Buscar usuario y verificar que el refresh token coincida
    const user = await this.authRepository.findById(payload.userId)
    
    if (!user) {
      const error = new Error('Usuario no encontrado') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.NOT_FOUND
      throw error
    }
    
    if (!user.isActive) {
      const error = new Error('La cuenta está desactivada') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.FORBIDDEN
      throw error
    }
    
    // Verificar que el refresh token almacenado coincida
    if (user.refreshToken !== input.refreshToken) {
      const error = new Error('Token de refresco inválido') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.UNAUTHORIZED
      throw error
    }
    
    // Obtener el nombre del rol
    const roleName = user.role?.name || 'user'
    
    // Generar nuevos tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: roleName,
    })
    
    // Actualizar refresh token en la BD
    await this.authRepository.updateRefreshToken(user.id, tokens.refreshToken)
    
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }
  
  /**
   * Solicita recuperación de contraseña (envía email con token)
   */
  async forgotPassword(input: ForgotPasswordInput): Promise<{ message: string }> {
    if (!input.email) {
      const error = new Error('El email es requerido') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.BAD_REQUEST
      throw error
    }
    
    // Buscar usuario
    const user = await this.authRepository.findByEmail(input.email)
    
    // Por seguridad, siempre retornamos el mismo mensaje
    // aunque el usuario no exista (previene enumeración de emails)
    if (!user) {
      return {
        message: 'Si existe una cuenta con ese email, se ha enviado un enlace para restablecer la contraseña.',
      }
    }
    
    // Generar token de reset
    const resetToken = generateResetToken()
    const resetExpires = new Date()
    resetExpires.setHours(resetExpires.getHours() + 1) // Expira en 1 hora
    
    // Guardar token en la BD
    await this.authRepository.updatePasswordResetToken(user.id, resetToken, resetExpires)
    
    // TODO: Enviar email con el token
    // En producción, aquí deberías enviar un email con el token
    // Ejemplo: await emailService.sendPasswordResetEmail(user.email, resetToken)
    
    console.log(`Password reset token for ${user.email}: ${resetToken}`)
    
    return {
      message: 'Si existe una cuenta con ese email, se ha enviado un enlace para restablecer la contraseña.',
    }
  }
  
  /**
   * Resetea la contraseña usando un token de recuperación
   */
  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    if (!input.token || !input.password) {
      const error = new Error('El token y la contraseña son requeridos') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.BAD_REQUEST
      throw error
    }
    
    // Validar fortaleza de la nueva contraseña
    const passwordValidation = validatePasswordStrength(input.password)
    if (!passwordValidation.isValid) {
      const error = new Error(passwordValidation.error || 'Contraseña inválida') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.BAD_REQUEST
      throw error
    }
    
    // Buscar usuario por token
    const user = await this.authRepository.findByPasswordResetToken(input.token)
    
    if (!user) {
      const error = new Error('Token de restablecimiento inválido o expirado') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.BAD_REQUEST
      throw error
    }
    
    // Hash de la nueva contraseña
    const hashedPassword = await hashPassword(input.password)
    
    // Actualizar contraseña y limpiar token
    await this.authRepository.updatePassword(user.id, hashedPassword)
    
    // Invalidar todos los refresh tokens (forzar re-login)
    await this.authRepository.updateRefreshToken(user.id, null)
    
    return {
      message: 'La contraseña ha sido restablecida exitosamente',
    }
  }
  
  /**
   * Cambia la contraseña (requiere autenticación)
   */
  async changePassword(userId: number, input: ChangePasswordInput): Promise<{ message: string }> {
    if (!input.currentPassword || !input.newPassword) {
      const error = new Error('La contraseña actual y la nueva contraseña son requeridas') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.BAD_REQUEST
      throw error
    }
    
    // Validar fortaleza de la nueva contraseña
    const passwordValidation = validatePasswordStrength(input.newPassword)
    if (!passwordValidation.isValid) {
      const error = new Error(passwordValidation.error || 'Contraseña inválida') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.BAD_REQUEST
      throw error
    }
    
    // Buscar usuario con contraseña
    const user = await this.authRepository.findByEmailWithPassword(
      (await this.authRepository.findById(userId))?.email || ''
    )
    
    if (!user) {
      const error = new Error('Usuario no encontrado') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.NOT_FOUND
      throw error
    }
    
    // Verificar contraseña actual
    const isCurrentPasswordValid = await comparePassword(input.currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      const error = new Error('La contraseña actual es incorrecta') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.UNAUTHORIZED
      throw error
    }
    
    // Hash de la nueva contraseña
    const hashedPassword = await hashPassword(input.newPassword)
    
    // Actualizar contraseña
    await this.authRepository.updatePassword(user.id, hashedPassword)
    
    // Invalidar todos los refresh tokens (forzar re-login en otros dispositivos)
    await this.authRepository.updateRefreshToken(user.id, null)
    
    return {
      message: 'La contraseña ha sido cambiada exitosamente',
    }
  }
  
  /**
   * Cierra sesión (invalida el refresh token)
   */
  async logout(userId: number): Promise<{ message: string }> {
    await this.authRepository.updateRefreshToken(userId, null)
    
    return {
      message: 'Sesión cerrada exitosamente',
    }
  }
}

