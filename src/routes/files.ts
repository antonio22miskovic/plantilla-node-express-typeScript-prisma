/**
 * FILES ROUTES - Rutas para Manejo de Archivos
 * 
 * Rutas para subir, eliminar y gestionar archivos.
 */

import { Router } from 'express'
import { FileController } from '../controllers/File.controller'
import { uploadSingle, uploadMultiple } from '../middleware/upload.middleware'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()
const fileController = new FileController()

// ============================================
// RUTAS PÚBLICAS
// ============================================

// Obtener información de tipos de archivo permitidos
router.get('/info', fileController.getInfo.bind(fileController))

// ============================================
// RUTAS PROTEGIDAS
// ============================================

// Subir un archivo
router.post(
  '/upload',
  authenticate,
  uploadSingle('file'),
  fileController.upload.bind(fileController)
)

// Subir múltiples archivos
router.post(
  '/upload-multiple',
  authenticate,
  uploadMultiple('files', 10),
  fileController.uploadMultiple.bind(fileController)
)

// Eliminar un archivo
// IMPORTANTE: Esta ruta debe ir al final para no interferir con otras rutas
// Ejemplo: DELETE /api/v1/files/2024/01/15/archivo.jpg
// Usamos un parámetro simple y extraemos la ruta completa desde req.path en el controller
router.delete('/:path', authenticate, fileController.delete.bind(fileController))

export default router

