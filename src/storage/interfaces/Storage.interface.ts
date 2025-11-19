/**
 * STORAGE INTERFACE - Abstracción para Storage Providers
 * 
 * Esta interfaz define el contrato que deben cumplir todos los
 * proveedores de storage (local, S3, Azure, etc.)
 * 
 * Permite cambiar fácilmente entre diferentes proveedores sin
 * modificar el código que los usa.
 */

export interface UploadedFile {
  filename: string
  originalName: string
  mimetype: string
  size: number
  path: string // Ruta relativa o URL del archivo
  url?: string // URL completa (para cloud storage)
}

export interface StorageConfig {
  maxFileSize?: number // Tamaño máximo en bytes
  allowedMimeTypes?: string[] // Tipos MIME permitidos
  destination?: string // Carpeta destino
}

export interface IStorageProvider {
  /**
   * Guarda un archivo en el storage
   * 
   * @param file - Buffer o stream del archivo
   * @param filename - Nombre del archivo a guardar
   * @param mimetype - Tipo MIME del archivo
   * @param folder - Carpeta donde guardar (opcional)
   * @returns Información del archivo guardado
   */
  save(
    file: Buffer | NodeJS.ReadableStream,
    filename: string,
    mimetype: string,
    folder?: string
  ): Promise<UploadedFile>

  /**
   * Elimina un archivo del storage
   * 
   * @param path - Ruta del archivo a eliminar
   * @returns true si se eliminó correctamente
   */
  delete(path: string): Promise<boolean>

  /**
   * Obtiene la URL pública de un archivo
   * 
   * @param path - Ruta del archivo
   * @returns URL pública del archivo
   */
  getUrl(path: string): string

  /**
   * Verifica si un archivo existe
   * 
   * @param path - Ruta del archivo
   * @returns true si el archivo existe
   */
  exists(path: string): Promise<boolean>

  /**
   * Obtiene un archivo del storage
   * 
   * @param path - Ruta del archivo
   * @returns Buffer del archivo o null si no existe
   */
  get(path: string): Promise<Buffer | null>
}

