/**
 * ROUTES - Definición de Rutas
 * 
 * Este archivo define las rutas HTTP y las conecta con los controllers.
 * Las rutas NO deben contener lógica, solo definen endpoints y middlewares.
 * 
 * USO:
 *   import userRouter from './routes/users'
 *   app.use('/api/v1/users', userRouter)
 */

import { Router } from 'express'
import { UserController } from '../controllers/User.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()
const userController = new UserController()

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================
// 
// Todas las rutas de usuarios requieren autenticación.
// El registro de usuarios está disponible en /api/v1/auth/register

/**
 * GET /api/v1/users
 * Obtiene todos los usuarios (con paginación y filtros)
 * Headers: Authorization: Bearer <accessToken>
 * Query params: page, limit, email, name, orderBy, orderByEmail, orderByName
 */
router.get('/', authenticate, userController.getAll.bind(userController))

/**
 * GET /api/v1/users/:id
 * Obtiene un usuario por su ID
 * Headers: Authorization: Bearer <accessToken>
 */
router.get('/:id', authenticate, userController.getById.bind(userController))

/**
 * POST /api/v1/users
 * Crea un nuevo usuario
 * Headers: Authorization: Bearer <accessToken>
 * Body: { email, name? }
 */
router.post('/', authenticate, userController.create.bind(userController))

/**
 * PUT /api/v1/users/:id
 * Actualiza un usuario existente
 * Headers: Authorization: Bearer <accessToken>
 * Body: { email?, name? }
 */
router.put('/:id', authenticate, userController.update.bind(userController))

/**
 * DELETE /api/v1/users/:id
 * Elimina un usuario
 * Headers: Authorization: Bearer <accessToken>
 */
router.delete('/:id', authenticate, userController.delete.bind(userController))

export default router
