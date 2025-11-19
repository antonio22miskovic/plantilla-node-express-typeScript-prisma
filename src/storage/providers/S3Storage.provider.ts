/**
 * S3 STORAGE PROVIDER - Almacenamiento en AWS S3
 * 
 * Implementación de storage usando AWS S3.
 * Ideal para producción y aplicaciones que necesitan escalabilidad.
 * 
 * VENTAJAS:
 * - Escalable infinitamente
 * - Redundancia automática
 * - CDN integrado (CloudFront)
 * - Ideal para múltiples servidores
 * - Backups automáticos
 * 
 * DESVENTAJAS:
 * - Requiere configuración de AWS
 * - Costos según uso
 * - Más complejo de configurar
 * 
 * INSTALACIÓN:
 *   npm install @aws-sdk/client-s3
 * 
 * CONFIGURACIÓN (.env):
 *   AWS_ACCESS_KEY_ID=tu-access-key
 *   AWS_SECRET_ACCESS_KEY=tu-secret-key
 *   AWS_REGION=us-east-1
 *   AWS_S3_BUCKET=mi-bucket
 *   AWS_S3_BASE_URL=https://mi-bucket.s3.amazonaws.com
 * 
 * USO:
 *   import { S3StorageProvider } from '../providers/S3Storage.provider'
 *   const storage = new S3StorageProvider({ bucket: 'mi-bucket' })
 */

import type { IStorageProvider, UploadedFile } from '../interfaces/Storage.interface'

export interface S3StorageConfig {
  bucket: string
  region?: string
  baseUrl?: string
  accessKeyId?: string
  secretAccessKey?: string
}

/**
 * S3 Storage Provider
 * 
 * NOTA: Esta es una implementación preparada para futuro uso.
 * Para usarla, instala @aws-sdk/client-s3 y descomenta el código.
 */
export class S3StorageProvider implements IStorageProvider {
  private bucket: string
  private region: string
  private baseUrl: string

  constructor(config: S3StorageConfig) {
    this.bucket = config.bucket
    this.region = config.region || 'us-east-1'
    this.baseUrl = config.baseUrl || `https://${config.bucket}.s3.${this.region}.amazonaws.com`
    
    // TODO: Inicializar cliente S3 cuando se instale @aws-sdk/client-s3
    // import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
    // this.s3Client = new S3Client({
    //   region: this.region,
    //   credentials: {
    //     accessKeyId: config.accessKeyId || process.env.AWS_ACCESS_KEY_ID!,
    //     secretAccessKey: config.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY!,
    //   },
    // })
  }

  async save(
    file: Buffer | NodeJS.ReadableStream,
    filename: string,
    mimetype: string,
    folder?: string
  ): Promise<UploadedFile> {
    // TODO: Implementar cuando se instale @aws-sdk/client-s3
    throw new Error('S3StorageProvider no está implementado. Instala @aws-sdk/client-s3 y descomenta el código.')
    
    // const key = folder ? `${folder}/${filename}` : filename
    // const command = new PutObjectCommand({
    //   Bucket: this.bucket,
    //   Key: key,
    //   Body: file,
    //   ContentType: mimetype,
    // })
    // await this.s3Client.send(command)
    // 
    // return {
    //   filename,
    //   originalName: filename,
    //   mimetype,
    //   size: Buffer.isBuffer(file) ? file.length : 0,
    //   path: key,
    //   url: this.getUrl(key),
    // }
  }

  async delete(filePath: string): Promise<boolean> {
    // TODO: Implementar cuando se instale @aws-sdk/client-s3
    throw new Error('S3StorageProvider no está implementado.')
  }

  getUrl(filePath: string): string {
    const normalizedPath = filePath.replace(/\\/g, '/')
    const urlPath = normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath
    return `${this.baseUrl}/${urlPath}`
  }

  async exists(filePath: string): Promise<boolean> {
    // TODO: Implementar cuando se instale @aws-sdk/client-s3
    throw new Error('S3StorageProvider no está implementado.')
  }

  async get(filePath: string): Promise<Buffer | null> {
    // TODO: Implementar cuando se instale @aws-sdk/client-s3
    throw new Error('S3StorageProvider no está implementado.')
  }
}

