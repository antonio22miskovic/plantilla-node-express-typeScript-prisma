/**
 * AUTH ROUTES - Rutas de Autenticación
 * 
 * Este archivo define todas las rutas relacionadas con autenticación:
 * - POST /api/v1/auth/register - Registro de usuarios
 * - POST /api/v1/auth/login - Inicio de sesión
 * - POST /api/v1/auth/refresh - Refrescar access token
 * - POST /api/v1/auth/forgot-password - Solicitar recuperación de contraseña
 * - POST /api/v1/auth/reset-password - Resetear contraseña con token
 * - POST /api/v1/auth/change-password - Cambiar contraseña (requiere auth)
 * - POST /api/v1/auth/logout - Cerrar sesión (requiere auth)
 * - GET /api/v1/auth/me - Obtener usuario actual (requiere auth)
 * 
 * USO:
 *   import authRouter from './routes/auth'
 *   app.use('/api/v1/auth', authRouter)
 */

import { Router } from 'express'
import { AuthController } from '../controllers/Auth.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()
const authController = new AuthController()

// ============================================
// RUTAS PÚBLICAS
// ============================================

/**
 * POST /api/v1/auth/register
 * Registra un nuevo usuario
 * Body: { email, password, name? }
 */
router.post('/register', authController.register.bind(authController))

/**
 * POST /api/v1/auth/login
 * Inicia sesión de un usuario
 * Body: { email, password }
 * Returns: { user, accessToken, refreshToken }
 */
router.post('/login', authController.login.bind(authController))

/**
 * POST /api/v1/auth/refresh
 * Refresca el access token usando un refresh token
 * Body: { refreshToken }
 * Returns: { accessToken, refreshToken }
 */
router.post('/refresh', authController.refreshToken.bind(authController))

/**
 * POST /api/v1/auth/forgot-password
 * Solicita recuperación de contraseña
 * Body: { email }
 * Returns: { message }
 */
router.post('/forgot-password', authController.forgotPassword.bind(authController))

/**
 * POST /api/v1/auth/reset-password
 * Resetea la contraseña usando un token de recuperación
 * Body: { token, password }
 * Returns: { message }
 */
router.post('/reset-password', authController.resetPassword.bind(authController))

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

/**
 * GET /api/v1/auth/me
 * Obtiene la información del usuario autenticado
 * Headers: Authorization: Bearer <accessToken>
 * Returns: { user }
 */
router.get('/me', authenticate, authController.getMe.bind(authController))

/**
 * POST /api/v1/auth/change-password
 * Cambia la contraseña del usuario autenticado
 * Headers: Authorization: Bearer <accessToken>
 * Body: { currentPassword, newPassword }
 * Returns: { message }
 */
router.post('/change-password', authenticate, authController.changePassword.bind(authController))

/**
 * POST /api/v1/auth/logout
 * Cierra sesión e invalida el refresh token
 * Headers: Authorization: Bearer <accessToken>
 * Returns: { message }
 */
router.post('/logout', authenticate, authController.logout.bind(authController))

export default router

