/**
 * CONTROLLER - Capa de Controladores HTTP
 * 
 * Los Controllers manejan las peticiones HTTP (req/res) y delegan
 * la lógica de negocio a los Services.
 * 
 * RESPONSABILIDADES:
 * - Recibir y validar peticiones HTTP
 * - Extraer datos de req (body, params, query)
 * - Llamar a los Services apropiados
 * - Formatear respuestas HTTP
 * - Manejar errores HTTP
 * 
 * REGLAS:
 * - NO debe contener lógica de negocio (usa Service)
 * - NO debe acceder directamente a la base de datos (usa Service)
 * - Debe ser delgado y solo orquestar llamadas
 * 
 * USO:
 *   import { UserController } from '../controllers/User.controller'
 *   const userController = new UserController()
 *   router.get('/', userController.getAll.bind(userController))
 */

import type { Request, Response } from 'express'
import { UserService } from '../services/User.service'
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants'
import type { ApiResponse, PaginatedResponse } from '../types'
import type { User } from '@prisma/client'

export class UserController {
  private userService: UserService
  
  constructor() {
    this.userService = new UserService()
  }
  
  /**
   * GET /api/v1/users
   * Obtiene todos los usuarios con paginación y filtros
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const filters: {
        email?: string
        name?: string
      } = {}
      if (req.query.email) filters.email = req.query.email as string
      if (req.query.name) filters.name = req.query.name as string
      const orderBy: {
        id?: 'asc' | 'desc'
        email?: 'asc' | 'desc'
        name?: 'asc' | 'desc'
      } = {}
      if (req.query.orderBy) orderBy.id = req.query.orderBy as 'asc' | 'desc'
      if (req.query.orderByEmail) orderBy.email = req.query.orderByEmail as 'asc' | 'desc'
      if (req.query.orderByName) orderBy.name = req.query.orderByName as 'asc' | 'desc'
      
      const result = await this.userService.getAllUsers(filters, orderBy, page, limit)
      
      const response: ApiResponse<PaginatedResponse<User>> = {
        success: true,
        message: HTTP_MESSAGES.SUCCESS,
        data: result,
      }
      
      res.status(HTTP_STATUS.OK).json(response)
    } catch (error) {
      this.handleError(error, res)
    }
  }
  
  /**
   * GET /api/v1/users/:id
   * Obtiene un usuario por su ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params.id
      if (!idParam) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: 'El ID de usuario es requerido',
        })
        return
      }
      
      const id = parseInt(idParam)
      
      if (isNaN(id) || id <= 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: 'ID de usuario inválido',
        })
        return
      }
      
      const user = await this.userService.getUserById(id)
      
      const response: ApiResponse<User> = {
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
   * POST /api/v1/users
   * Crea un nuevo usuario
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { email, name } = req.body
      
      if (!email) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: 'El email es requerido',
        })
        return
      }
      
      const user = await this.userService.createUser({ email, name })
      
      const response: ApiResponse<User> = {
        success: true,
        message: HTTP_MESSAGES.USER_CREATED,
        data: user,
      }
      
      res.status(HTTP_STATUS.CREATED).json(response)
    } catch (error) {
      this.handleError(error, res)
    }
  }
  
  /**
   * PUT /api/v1/users/:id
   * Actualiza un usuario existente
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params.id
      if (!idParam) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: 'El ID de usuario es requerido',
        })
        return
      }
      
      const id = parseInt(idParam)
      
      if (isNaN(id) || id <= 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: 'ID de usuario inválido',
        })
        return
      }
      
      const { email, name } = req.body
      
      const user = await this.userService.updateUser(id, { email, name })
      
      const response: ApiResponse<User> = {
        success: true,
        message: HTTP_MESSAGES.USER_UPDATED,
        data: user,
      }
      
      res.status(HTTP_STATUS.OK).json(response)
    } catch (error) {
      this.handleError(error, res)
    }
  }
  
  /**
   * DELETE /api/v1/users/:id
   * Elimina un usuario
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params.id
      if (!idParam) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: 'El ID de usuario es requerido',
        })
        return
      }
      
      const id = parseInt(idParam)
      
      if (isNaN(id) || id <= 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: 'ID de usuario inválido',
        })
        return
      }
      
      await this.userService.deleteUser(id)
      
      const response: ApiResponse = {
        success: true,
        message: HTTP_MESSAGES.USER_DELETED,
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

