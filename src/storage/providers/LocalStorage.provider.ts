/**
 * LOCAL STORAGE PROVIDER - Almacenamiento en Filesystem Local
 * 
 * Implementación de storage usando el filesystem del servidor.
 * Ideal para desarrollo y aplicaciones pequeñas/medianas.
 * 
 * VENTAJAS:
 * - Simple y rápido de configurar
 * - Sin costos adicionales
 * - Control total sobre los archivos
 * 
 * DESVENTAJAS:
 * - No escalable (limitado al disco del servidor)
 * - No hay redundancia automática
 * - Requiere backups manuales
 * - No es ideal para múltiples servidores
 * 
 * USO:
 *   import { LocalStorageProvider } from '../providers/LocalStorage.provider'
 *   const storage = new LocalStorageProvider({ basePath: './uploads' })
 */

import { promises as fs } from 'fs'
import path from 'path'
import type { IStorageProvider, UploadedFile } from '../interfaces/Storage.interface'

export interface LocalStorageConfig {
  basePath?: string // Carpeta base donde guardar archivos
  baseUrl?: string // URL base para acceder a los archivos
}

export class LocalStorageProvider implements IStorageProvider {
  private basePath: string
  private baseUrl: string

  constructor(config: LocalStorageConfig = {}) {
    // Carpeta base: ./uploads por defecto (relativa a la raíz del proyecto)
    this.basePath = config.basePath || path.join(process.cwd(), 'uploads')
    this.baseUrl = config.baseUrl || '/uploads'
    
    // Crear carpeta base si no existe
    this.ensureDirectoryExists(this.basePath)
  }

  /**
   * Asegura que el directorio existe, si no lo crea
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath)
    } catch {
      await fs.mkdir(dirPath, { recursive: true })
    }
  }

  /**
   * Genera la ruta completa del archivo
   */
  private getFullPath(filename: string, folder?: string): string {
    if (folder) {
      const folderPath = path.join(this.basePath, folder)
      this.ensureDirectoryExists(folderPath)
      return path.join(folderPath, filename)
    }
    return path.join(this.basePath, filename)
  }

  /**
   * Genera la ruta relativa del archivo
   */
  private getRelativePath(filename: string, folder?: string): string {
    if (folder) {
      return path.join(folder, filename).replace(/\\/g, '/')
    }
    return filename
  }

  async save(
    file: Buffer | NodeJS.ReadableStream,
    filename: string,
    mimetype: string,
    folder?: string
  ): Promise<UploadedFile> {
    const fullPath = this.getFullPath(filename, folder)
    const relativePath = this.getRelativePath(filename, folder)

    // Asegurar que el directorio existe
    await this.ensureDirectoryExists(path.dirname(fullPath))

    // Convertir stream a buffer si es necesario
    let buffer: Buffer
    if (Buffer.isBuffer(file)) {
      buffer = file
    } else {
      const chunks: Buffer[] = []
      for await (const chunk of file) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
      }
      buffer = Buffer.concat(chunks)
    }

    // Guardar archivo
    await fs.writeFile(fullPath, buffer)

    // Obtener tamaño del archivo
    const stats = await fs.stat(fullPath)

    return {
      filename,
      originalName: filename,
      mimetype,
      size: stats.size,
      path: relativePath,
      url: this.getUrl(relativePath),
    }
  }

  async delete(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.basePath, filePath)
      await fs.unlink(fullPath)
      return true
    } catch (error) {
      console.error(`Error al eliminar archivo ${filePath}:`, error)
      return false
    }
  }

  getUrl(filePath: string): string {
    // Normalizar separadores de ruta para URLs
    const normalizedPath = filePath.replace(/\\/g, '/')
    // Asegurar que la URL empiece con /
    const urlPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
    return `${this.baseUrl}${urlPath}`
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.basePath, filePath)
      await fs.access(fullPath)
      return true
    } catch {
      return false
    }
  }

  async get(filePath: string): Promise<Buffer | null> {
    try {
      const fullPath = path.join(this.basePath, filePath)
      return await fs.readFile(fullPath)
    } catch (error) {
      console.error(`Error al leer archivo ${filePath}:`, error)
      return null
    }
  }
}

