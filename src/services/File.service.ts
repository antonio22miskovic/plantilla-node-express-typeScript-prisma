/**
 * FILE SERVICE - Servicio de Manejo de Archivos
 * 
 * Este service maneja la lógica de negocio relacionada con archivos:
 * - Validación de archivos
 * - Guardado y eliminación
 * - Generación de nombres únicos
 * - Organización por carpetas
 * 
 * USO:
 *   import { FileService } from '../services/File.service'
 *   const fileService = new FileService()
 *   const result = await fileService.uploadFile(buffer, 'imagen.jpg', 'image/jpeg')
 */

import { storageProvider } from '../config/storage.config'
import {
  generateUniqueFilename,
  generateDateBasedPath,
  isValidMimeType,
  isValidFileSize,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZES,
} from '../utils/file.util'
import type { UploadedFile } from '../storage/interfaces/Storage.interface'

export interface FileUploadOptions {
  folder?: string // Carpeta donde guardar (opcional)
  useDatePath?: boolean // Organizar por fecha (YYYY/MM/DD)
  allowedMimeTypes?: string[] // Tipos MIME permitidos
  maxSize?: number // Tamaño máximo en bytes
  prefix?: string // Prefijo para el nombre del archivo
}

export interface FileUploadResult {
  success: boolean
  file?: UploadedFile
  error?: string
}

export class FileService {
  /**
   * Sube un archivo al storage
   * 
   * @param file - Buffer del archivo
   * @param originalName - Nombre original del archivo
   * @param mimetype - Tipo MIME del archivo
   * @param options - Opciones de configuración
   * @returns Resultado de la operación
   */
  async uploadFile(
    file: Buffer,
    originalName: string,
    mimetype: string,
    options: FileUploadOptions = {}
  ): Promise<FileUploadResult> {
    try {
      // Validar tipo MIME
      const allowedTypes = options.allowedMimeTypes || [
        ...ALLOWED_MIME_TYPES.IMAGES,
        ...ALLOWED_MIME_TYPES.DOCUMENTS,
      ]
      
      if (!isValidMimeType(mimetype, allowedTypes)) {
        return {
          success: false,
          error: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`,
        }
      }

      // Validar tamaño
      const maxSize = options.maxSize || MAX_FILE_SIZES.DEFAULT
      if (!isValidFileSize(file.length, maxSize)) {
        return {
          success: false,
          error: `El archivo excede el tamaño máximo permitido (${maxSize / 1024 / 1024} MB)`,
        }
      }

      // Generar nombre único
      const filename = generateUniqueFilename(originalName, options.prefix)

      // Determinar carpeta destino
      let folder = options.folder
      if (options.useDatePath) {
        const datePath = generateDateBasedPath(filename)
        folder = folder ? `${folder}/${datePath}` : datePath
      }

      // Guardar archivo
      const uploadedFile = await storageProvider.save(file, filename, mimetype, folder)

      return {
        success: true,
        file: uploadedFile,
      }
    } catch (error) {
      console.error('Error al subir archivo:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al subir archivo',
      }
    }
  }

  /**
   * Elimina un archivo del storage
   * 
   * @param filePath - Ruta del archivo a eliminar
   * @returns true si se eliminó correctamente
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      return await storageProvider.delete(filePath)
    } catch (error) {
      console.error(`Error al eliminar archivo ${filePath}:`, error)
      return false
    }
  }

  /**
   * Obtiene la URL pública de un archivo
   * 
   * @param filePath - Ruta del archivo
   * @returns URL pública
   */
  getFileUrl(filePath: string): string {
    return storageProvider.getUrl(filePath)
  }

  /**
   * Verifica si un archivo existe
   * 
   * @param filePath - Ruta del archivo
   * @returns true si existe
   */
  async fileExists(filePath: string): Promise<boolean> {
    return await storageProvider.exists(filePath)
  }

  /**
   * Obtiene un archivo del storage
   * 
   * @param filePath - Ruta del archivo
   * @returns Buffer del archivo o null si no existe
   */
  async getFile(filePath: string): Promise<Buffer | null> {
    return await storageProvider.get(filePath)
  }
}

