/**
 * FILE UTILITIES - Utilidades para Manejo de Archivos
 * 
 * Funciones auxiliares para validación, generación de nombres,
 * y manipulación de archivos.
 */

import { randomUUID } from 'crypto'
import path from 'path'

/**
 * Tipos MIME comunes permitidos por defecto
 */
export const ALLOWED_MIME_TYPES = {
  // Imágenes
  IMAGES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ] as string[],
  // Documentos
  DOCUMENTS: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/plain',
  ] as string[],
  // Archivos comprimidos
  ARCHIVES: [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
  ] as string[],
}

/**
 * Tamaños máximos por tipo de archivo (en bytes)
 */
export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5 MB
  DOCUMENT: 10 * 1024 * 1024, // 10 MB
  ARCHIVE: 50 * 1024 * 1024, // 50 MB
  DEFAULT: 10 * 1024 * 1024, // 10 MB
} as const

/**
 * Genera un nombre único para un archivo
 * 
 * @param originalName - Nombre original del archivo
 * @param prefix - Prefijo opcional (ej: 'avatar', 'document')
 * @returns Nombre único con extensión original
 */
export function generateUniqueFilename(originalName: string, prefix?: string): string {
  const ext = path.extname(originalName)
  const baseName = path.basename(originalName, ext)
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_')
  const uuid = randomUUID()
  const prefixPart = prefix ? `${prefix}_` : ''
  
  return `${prefixPart}${sanitizedBaseName}_${uuid}${ext}`
}

/**
 * Genera una ruta organizada por fecha (YYYY/MM/DD)
 * 
 * @param filename - Nombre del archivo
 * @returns Ruta con estructura de fecha
 */
export function generateDateBasedPath(filename: string): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  
  return `${year}/${month}/${day}/${filename}`
}

/**
 * Valida el tipo MIME de un archivo
 * 
 * @param mimetype - Tipo MIME a validar
 * @param allowedTypes - Array de tipos MIME permitidos
 * @returns true si el tipo es válido
 */
export function isValidMimeType(mimetype: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(mimetype)
}

/**
 * Valida el tamaño de un archivo
 * 
 * @param size - Tamaño en bytes
 * @param maxSize - Tamaño máximo permitido en bytes
 * @returns true si el tamaño es válido
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize
}

/**
 * Obtiene la extensión de un archivo desde su nombre
 * 
 * @param filename - Nombre del archivo
 * @returns Extensión (sin el punto)
 */
export function getFileExtension(filename: string): string {
  return path.extname(filename).slice(1).toLowerCase()
}

/**
 * Formatea el tamaño de un archivo a formato legible
 * 
 * @param bytes - Tamaño en bytes
 * @returns String formateado (ej: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Sanitiza el nombre de un archivo removiendo caracteres peligrosos
 * 
 * @param filename - Nombre del archivo a sanitizar
 * @returns Nombre sanitizado
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
}

