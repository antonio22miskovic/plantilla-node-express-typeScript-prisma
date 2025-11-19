/**
 * UPLOAD MIDDLEWARE - Middleware para Manejo de Archivos
 * 
 * Middleware para procesar archivos subidos mediante multipart/form-data.
 * Usa multer para parsear los archivos.
 * 
 * USO:
 *   import { uploadSingle, uploadMultiple } from '../middleware/upload.middleware'
 *   router.post('/upload', uploadSingle('file'), controller.upload)
 */

import multer from 'multer'
import { MAX_FILE_SIZES, ALLOWED_MIME_TYPES } from '../utils/file.util'

/**
 * Configuración de multer para almacenar en memoria
 * (los archivos se procesan como Buffer en el controller)
 */
const storage = multer.memoryStorage()

/**
 * Filtro para validar tipos de archivo
 */
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Tipos permitidos por defecto (imágenes y documentos)
  const allowedTypes = [
    ...ALLOWED_MIME_TYPES.IMAGES,
    ...ALLOWED_MIME_TYPES.DOCUMENTS,
  ]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`))
  }
}

/**
 * Configuración base de multer
 */
const multerConfig: multer.Options = {
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZES.DEFAULT, // 10 MB por defecto
    files: 10, // Máximo 10 archivos por request
  },
}

/**
 * Middleware para subir un solo archivo
 * 
 * @param fieldName - Nombre del campo en el formulario (por defecto: 'file')
 */
export const uploadSingle = (fieldName = 'file') => {
  return multer(multerConfig).single(fieldName)
}

/**
 * Middleware para subir múltiples archivos
 * 
 * @param fieldName - Nombre del campo en el formulario (por defecto: 'files')
 * @param maxCount - Número máximo de archivos (por defecto: 10)
 */
export const uploadMultiple = (fieldName = 'files', maxCount = 10) => {
  return multer({
    ...multerConfig,
    limits: {
      ...multerConfig.limits,
      files: maxCount,
    },
  }).array(fieldName, maxCount)
}

/**
 * Middleware para subir archivos con campos específicos
 * 
 * @param fields - Array de objetos con name y maxCount
 */
export const uploadFields = (fields: Array<{ name: string; maxCount?: number }>) => {
  return multer(multerConfig).fields(fields)
}

/**
 * Middleware personalizado con opciones específicas
 * 
 * @param options - Opciones de configuración
 */
export const uploadCustom = (options: {
  fieldName?: string
  maxSize?: number
  allowedMimeTypes?: string[]
  maxFiles?: number
}) => {
  const customFileFilter = (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const allowedTypes = options.allowedMimeTypes || [
      ...ALLOWED_MIME_TYPES.IMAGES,
      ...ALLOWED_MIME_TYPES.DOCUMENTS,
    ]

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`))
    }
  }

  return multer({
    storage,
    fileFilter: customFileFilter,
    limits: {
      fileSize: options.maxSize || MAX_FILE_SIZES.DEFAULT,
      files: options.maxFiles || 10,
    },
  }).single(options.fieldName || 'file')
}

