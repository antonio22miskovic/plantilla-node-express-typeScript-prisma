/**
 * STORAGE CONFIGURATION
 * 
 * Configuración del sistema de storage.
 * Permite cambiar fácilmente entre storage providers (local, S3, etc.)
 * 
 * USO:
 *   import { storageProvider } from '../config/storage.config'
 *   const file = await storageProvider.save(buffer, 'archivo.jpg', 'image/jpeg')
 */

import { LocalStorageProvider } from '../storage/providers/LocalStorage.provider'
import { S3StorageProvider } from '../storage/providers/S3Storage.provider'
import type { IStorageProvider } from '../storage/interfaces/Storage.interface'

// ============================================
// CONFIGURACIÓN DE VARIABLES DE ENTORNO
// ============================================

/**
 * Tipo de storage a usar
 * - 'local': Filesystem local (desarrollo)
 * - 's3': AWS S3 (producción)
 */
const STORAGE_TYPE = (process.env.STORAGE_TYPE || 'local') as 'local' | 's3'

/**
 * Configuración de storage local
 */
const LOCAL_STORAGE_CONFIG = {
  basePath: process.env.STORAGE_LOCAL_PATH || './uploads',
  baseUrl: process.env.STORAGE_LOCAL_URL || '/uploads',
}

/**
 * Configuración de S3 (solo si STORAGE_TYPE === 's3')
 */
const S3_STORAGE_CONFIG = {
  bucket: process.env.AWS_S3_BUCKET || '',
  region: process.env.AWS_REGION || 'us-east-1',
  baseUrl: process.env.AWS_S3_BASE_URL || '',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
}

// ============================================
// CREAR PROVIDER SEGÚN CONFIGURACIÓN
// ============================================

let storageProvider: IStorageProvider

if (STORAGE_TYPE === 's3') {
  if (!S3_STORAGE_CONFIG.bucket) {
    console.warn('⚠️  STORAGE_TYPE=s3 pero AWS_S3_BUCKET no está configurado. Usando storage local.')
    storageProvider = new LocalStorageProvider(LOCAL_STORAGE_CONFIG)
  } else {
    storageProvider = new S3StorageProvider(S3_STORAGE_CONFIG)
  }
} else {
  // Por defecto: storage local
  storageProvider = new LocalStorageProvider(LOCAL_STORAGE_CONFIG)
  console.log(`📁 Storage configurado: Local (${LOCAL_STORAGE_CONFIG.basePath})`)
}

// ============================================
// EXPORTAR PROVIDER
// ============================================

export { storageProvider }
export { STORAGE_TYPE, LOCAL_STORAGE_CONFIG, S3_STORAGE_CONFIG }

