/**
 * AUTH CONTROLLER - Controlador HTTP para Autenticación
 * 
 * Este controller maneja todas las peticiones HTTP relacionadas con autenticación:
 * - Registro
 * - Login
 * - Refresh token
 * - Recuperación de contraseña
 * - Cambio de contraseña
 * - Logout
 * 
 * USO:
 *   import { AuthController } from '../controllers/Auth.controller'
 *   const authController = new AuthController()
 *   router.post('/register', authController.register.bind(authController))
 */

import type { Request, Response } from 'express'
import { AuthService } from '../services/Auth.service'
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants'
import type { ApiResponse, AuthenticatedRequest } from '../types'
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  RefreshTokenInput,
  AuthResponse,
} from '../models/Auth.model'

export class AuthController {
  private authService: AuthService
  
  constructor() {
    this.authService = new AuthService()
  }
  
  /**
   * POST /api/v1/auth/register
   * Registra un nuevo usuario
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body as RegisterInput
      
      if (!email || !password) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: 'El email y la contraseña son requeridos',
        })
        return
      }
      
      const registerData: RegisterInput = { email, password }
      if (name) {
        registerData.name = name
      }
      
      const result = await this.authService.register(registerData)
      
      const response: ApiResponse<AuthResponse> = {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result,
      }
      
      res.status(HTTP_STATUS.CREATED).json(response)
    } catch (error) {
      this.handleError(error, res)
    }
  }
  
  /**
   * POST /api/v1/auth/login
   * Inicia sesión de un usuario
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LoginInput
      
      if (!email || !password) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: 'El email y la contraseña son requeridos',
        })
        return
      }
      
      const result = await this.authService.login({ email, password })
      
      const response: ApiResponse<AuthResponse> = {
        success: true,
        message: 'Inicio de sesión exitoso',
        data: result,
      }
      
      res.status(HTTP_STATUS.OK).json(response)
    } catch (error) {
      this.handleError(error, res)
    }
  }
  
  /**
   * POST /api/v1/auth/refresh
   * Refresca el access token usando un refresh token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body as RefreshTokenInput
      
      if (!refreshToken) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: 'El token de refresco es requerido',
        })
        return
      }
      
      const result = await this.authService.refreshToken({ refreshToken })
      
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Token actualizado exitosamente',
        data: result,
      }
      
      res.status(HTTP_STATUS.OK).json(response)
    } catch (error) {
      this.handleError(error, res)
    }
  }
  
  /**
   * POST /api/v1/auth/forgot-password
   * Solicita recuperación de contraseña
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body as ForgotPasswordInput
      
      if (!email) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: 'El email es requerido',
        })
        return
      }
      
      const result = await this.authService.forgotPassword({ email })
      
      const response: ApiResponse<typeof result> = {
        success: true,
        message: result.message,
      }
      
      res.status(HTTP_STATUS.OK).json(response)
    } catch (error) {
      this.handleError(error, res)
    }
  }
  
  /**
   * POST /api/v1/auth/reset-password
   * Resetea la contraseña usando un token de recuperación
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body as ResetPasswordInput
      
      if (!token || !password) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: 'El token y la contraseña son requeridos',
        })
        return
      }
      
      const result = await this.authService.resetPassword({ token, password })
      
      const response: ApiResponse<typeof result> = {
        success: true,
        message: result.message,
      }
      
      res.status(HTTP_STATUS.OK).json(response)
    } catch (error) {
      this.handleError(error, res)
    }
  }
  
  /**
   * POST /api/v1/auth/change-password
   * Cambia la contraseña (requiere autenticación)
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body as ChangePasswordInput
      const userId = (req as AuthenticatedRequest).user?.id
      
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: HTTP_MESSAGES.UNAUTHORIZED,
          error: 'Autenticación requerida',
        })
        return
      }
      
      if (!currentPassword || !newPassword) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: 'La contraseña actual y la nueva contraseña son requeridas',
        })
        return
      }
      
      const result = await this.authService.changePassword(userId, {
        currentPassword,
        newPassword,
      })
      
      const response: ApiResponse<typeof result> = {
        success: true,
        message: result.message,
      }
      
      res.status(HTTP_STATUS.OK).json(response)
    } catch (error) {
      this.handleError(error, res)
    }
  }
  
  /**
   * POST /api/v1/auth/logout
   * Cierra sesión (invalida el refresh token)
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user?.id
      
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: HTTP_MESSAGES.UNAUTHORIZED,
          error: 'Autenticación requerida',
        })
        return
      }
      
      const result = await this.authService.logout(userId)
      
      const response: ApiResponse<typeof result> = {
        success: true,
        message: result.message,
      }
      
      res.status(HTTP_STATUS.OK).json(response)
    } catch (error) {
      this.handleError(error, res)
    }
  }
  
  /**
   * GET /api/v1/auth/me
   * Obtiene la información del usuario autenticado
   */
  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user
      
      if (!user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: HTTP_MESSAGES.UNAUTHORIZED,
          error: 'Autenticación requerida',
        })
        return
      }
      
      const response: ApiResponse<typeof user> = {
        success: true,
        message: HTTP_MESSAGES.SUCCESS,
        data: user,
      }
      
      res.status(HTTP_STATUS.OK).json(response)
    } catch (error) {
      this.handleError(error, res)
    }
  }
  
  /**
   * Maneja errores y envía respuestas HTTP apropiadas
   */
  private handleError(error: unknown, res: Response): void {
    if (error instanceof Error) {
      const statusCode = (error as Error & { statusCode?: number }).statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR
      
      res.status(statusCode).json({
        success: false,
        message: HTTP_MESSAGES.INTERNAL_ERROR,
        error: error.message,
      })
      return
    }
    
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: HTTP_MESSAGES.INTERNAL_ERROR,
        error: 'Ocurrió un error desconocido',
    })
  }
}

