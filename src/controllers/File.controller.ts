/**
 * FILE CONTROLLER - Controlador para Manejo de Archivos
 * 
 * Este controller maneja las peticiones HTTP relacionadas con archivos:
 * - Subir archivos
 * - Eliminar archivos
 * - Obtener información de archivos
 * 
 * USO:
 *   import { FileController } from '../controllers/File.controller'
 *   const fileController = new FileController()
 *   router.post('/upload', uploadSingle('file'), fileController.upload.bind(fileController))
 */

import type { Request, Response } from 'express'
import { FileService } from '../services/File.service'
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants'
import type { ApiResponse } from '../types'
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZES } from '../utils/file.util'

// Extender Request para incluir archivos de multer
interface MulterRequest extends Omit<Request, 'file' | 'files'> {
  file?: {
    fieldname: string
    originalname: string
    encoding: string
    mimetype: string
    size: number
    buffer: Buffer
  }
  files?: Array<{
    fieldname: string
    originalname: string
    encoding: string
    mimetype: string
    size: number
    buffer: Buffer
  }>
}


export class FileController {
  private fileService: FileService

  constructor() {
    this.fileService = new FileService()
  }

  /**
   * POST /api/v1/files/upload
   * Sube un archivo
   */
  async upload(req: MulterRequest, res: Response): Promise<void> {
    try {
      const file = req.file

      if (!file) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: 'No se proporcionó ningún archivo',
        })
        return
      }

      // Opciones de configuración desde query params
      const options: {
        folder?: string
        useDatePath: boolean
        prefix?: string
        allowedMimeTypes?: string[]
        maxSize?: number
      } = {
        useDatePath: req.query.useDatePath === 'true',
      }
      
      if (req.query.folder) options.folder = req.query.folder as string
      if (req.query.prefix) options.prefix = req.query.prefix as string
      if (req.query.allowedTypes) {
        options.allowedMimeTypes = (req.query.allowedTypes as string).split(',')
      }
      if (req.query.maxSize) {
        options.maxSize = parseInt(req.query.maxSize as string)
      }

      // Subir archivo
      const result = await this.fileService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        options
      )

      if (!result.success) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: result.error,
        })
        return
      }

      if (!result.file) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: HTTP_MESSAGES.INTERNAL_ERROR,
          error: 'Error al procesar el archivo',
        })
        return
      }

      const response: ApiResponse<typeof result.file> = {
        success: true,
        message: 'Archivo subido exitosamente',
        data: result.file,
      }

      res.status(HTTP_STATUS.OK).json(response)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : HTTP_MESSAGES.INTERNAL_ERROR
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: HTTP_MESSAGES.INTERNAL_ERROR,
        error: errorMessage,
      })
    }
  }

  /**
   * POST /api/v1/files/upload-multiple
   * Sube múltiples archivos
   */
  async uploadMultiple(req: MulterRequest, res: Response): Promise<void> {
    try {
      const files = req.files || []

      if (!files || files.length === 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: 'No se proporcionaron archivos',
        })
        return
      }

      // Opciones de configuración
      const options: {
        folder?: string
        useDatePath: boolean
        prefix?: string
      } = {
        useDatePath: req.query.useDatePath === 'true',
      }
      
      if (req.query.folder) options.folder = req.query.folder as string
      if (req.query.prefix) options.prefix = req.query.prefix as string

      // Subir todos los archivos
      const uploadPromises = files.map((file) =>
        this.fileService.uploadFile(file.buffer, file.originalname, file.mimetype, options)
      )

      const results = await Promise.all(uploadPromises)

      // Separar exitosos y fallidos
      const successful = results.filter((r) => r.success)
      const failed = results.filter((r) => !r.success)

      const response: ApiResponse<{
        successful: Array<typeof successful[0]['file']>
        failed: Array<{ originalName: string; error: string }>
      }> = {
        success: failed.length === 0,
        message:
          failed.length === 0
            ? `Todos los archivos (${successful.length}) se subieron exitosamente`
            : `${successful.length} archivos subidos, ${failed.length} fallaron`,
        data: {
          successful: successful.map((r) => r.file!).filter(Boolean),
          failed: failed.map((r) => {
            const fileIndex = results.indexOf(r)
            return {
              originalName: files[fileIndex]?.originalname || 'desconocido',
              error: r.error || 'Error desconocido',
            }
          }),
        },
      }

      res.status(failed.length === 0 ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST).json(response)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : HTTP_MESSAGES.INTERNAL_ERROR
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: HTTP_MESSAGES.INTERNAL_ERROR,
        error: errorMessage,
      })
    }
  }

  /**
   * DELETE /api/v1/files/:path
   * Elimina un archivo
   * Para rutas con múltiples segmentos, extraemos desde req.path
   * Ejemplo: DELETE /api/v1/files/2024/01/15/archivo.jpg
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      // Intentar obtener desde req.params.path primero (para rutas simples)
      let filePath = req.params.path as string | undefined
      
      // Si no está en params o parece ser solo un segmento, extraer desde req.path
      // req.path será algo como "/api/v1/files/2024/01/15/archivo.jpg"
      if (!filePath || !filePath.includes('/')) {
        const fullPath = req.path
        const basePath = '/api/v1/files/'
        if (fullPath.startsWith(basePath)) {
          filePath = fullPath.slice(basePath.length)
        } else if (fullPath.startsWith('/api/v1/files')) {
          filePath = fullPath.slice('/api/v1/files'.length + 1)
        }
      }

      if (!filePath) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: 'Ruta del archivo no proporcionada',
        })
        return
      }

      const deleted = await this.fileService.deleteFile(filePath)

      if (!deleted) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: HTTP_MESSAGES.NOT_FOUND,
          error: 'Archivo no encontrado o no se pudo eliminar',
        })
        return
      }

      const response: ApiResponse = {
        success: true,
        message: 'Archivo eliminado exitosamente',
      }

      res.status(HTTP_STATUS.OK).json(response)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : HTTP_MESSAGES.INTERNAL_ERROR
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: HTTP_MESSAGES.INTERNAL_ERROR,
        error: errorMessage,
      })
    }
  }

  /**
   * GET /api/v1/files/info
   * Obtiene información sobre tipos de archivo permitidos
   */
  async getInfo(_req: Request, res: Response): Promise<void> {
    const response: ApiResponse<{
      allowedTypes: {
        images: string[]
        documents: string[]
        archives: string[]
      }
      maxSizes: {
        image: string
        document: string
        archive: string
        default: string
      }
    }> = {
      success: true,
      message: 'Información de archivos permitidos',
      data: {
        allowedTypes: {
          images: ALLOWED_MIME_TYPES.IMAGES,
          documents: ALLOWED_MIME_TYPES.DOCUMENTS,
          archives: ALLOWED_MIME_TYPES.ARCHIVES,
        },
        maxSizes: {
          image: `${MAX_FILE_SIZES.IMAGE / 1024 / 1024} MB`,
          document: `${MAX_FILE_SIZES.DOCUMENT / 1024 / 1024} MB`,
          archive: `${MAX_FILE_SIZES.ARCHIVE / 1024 / 1024} MB`,
          default: `${MAX_FILE_SIZES.DEFAULT / 1024 / 1024} MB`,
        },
      },
    }

    res.status(HTTP_STATUS.OK).json(response)
  }
}

