/**
 * EMAIL CONFIGURATION
 * 
 * Configuración para envío de emails usando Nodemailer
 * 
 * Este archivo contiene la configuración del transporte de email.
 * Soporta múltiples proveedores: SMTP, Gmail, SendGrid, Mailgun, etc.
 * 
 * USO:
 *   import { emailTransporter } from '../config/email.config'
 *   await emailTransporter.sendMail({ ... })
 */

import nodemailer from 'nodemailer'

// ============================================
// CONFIGURACIÓN DE VARIABLES DE ENTORNO
// ============================================

/**
 * Configuración del servidor SMTP
 * 
 * Para Gmail:
 * - HOST: smtp.gmail.com
 * - PORT: 587
 * - Requiere habilitar "Acceso de aplicaciones menos seguras" o usar OAuth2
 * 
 * Para SendGrid:
 * - HOST: smtp.sendgrid.net
 * - PORT: 587
 * - USER: apikey
 * - PASS: tu-api-key-de-sendgrid
 * 
 * Para Mailgun:
 * - HOST: smtp.mailgun.org
 * - PORT: 587
 * - USER: postmaster@tu-dominio.mailgun.org
 * - PASS: tu-password-de-mailgun
 * 
 * Para desarrollo local (Mailtrap, MailHog, etc):
 * - Configura las credenciales según tu servicio de prueba
 */
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true para puerto 465, false para otros
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
}

/**
 * Email del remitente (desde dónde se envían los emails)
 */
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@example.com'
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Sistema'

/**
 * URL base del frontend (para enlaces en emails)
 * 
 * Esta es la URL donde el usuario hará clic para acciones como resetear contraseña.
 * 
 * Ejemplos:
 * - Desarrollo: http://localhost:5173 (Vite), http://localhost:3000 (Next.js)
 * - Producción: https://mi-app.com
 */
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

/**
 * URL base del backend (para referencias de API, CORS, etc.)
 * 
 * Ejemplos:
 * - Desarrollo: http://localhost:3000
 * - Producción: https://api.mi-app.com
 */
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`

// ============================================
// CREAR TRANSPORTER
// ============================================

/**
 * Transporter de Nodemailer configurado con las variables de entorno
 * 
 * En desarrollo, si no hay credenciales configuradas, se crea un transporter
 * de prueba que imprime los emails en consola.
 */
let emailTransporter: nodemailer.Transporter | null = null

if (process.env.NODE_ENV === 'development' && (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass)) {
  // Modo desarrollo sin credenciales: no crear transporter
  // Los emails se manejarán en el servicio imprimiendo en consola
  console.log('⚠️  Modo desarrollo sin SMTP: Los emails se imprimirán en consola (no se enviarán realmente)')
} else {
  // Modo producción o desarrollo con credenciales: usar configuración real
  emailTransporter = nodemailer.createTransport({
    host: SMTP_CONFIG.host,
    port: SMTP_CONFIG.port,
    secure: SMTP_CONFIG.secure,
    auth: SMTP_CONFIG.auth.user && SMTP_CONFIG.auth.pass ? SMTP_CONFIG.auth : undefined,
  })
}

// ============================================
// VERIFICAR CONEXIÓN (opcional)
// ============================================

/**
 * Verifica la conexión con el servidor SMTP
 * Útil para debugging y verificar que la configuración es correcta
 */
export async function verifyEmailConnection(): Promise<boolean> {
  if (!emailTransporter) {
    console.log('⚠️  No hay transporter configurado (modo desarrollo sin SMTP)')
    return false
  }
  
  try {
    await emailTransporter.verify()
    console.log('✅ Conexión SMTP verificada correctamente')
    return true
  } catch (error) {
    console.error('❌ Error al verificar conexión SMTP:', error)
    return false
  }
}

// ============================================
// EXPORTAR CONFIGURACIÓN
// ============================================

export { emailTransporter, FROM_EMAIL, FROM_NAME, FRONTEND_URL, BACKEND_URL }
export type { Transporter } from 'nodemailer'

export const emailConfig = {
  from: `${FROM_NAME} <${FROM_EMAIL}>`,
  frontendUrl: FRONTEND_URL,
  backendUrl: BACKEND_URL,
  smtp: {
    host: SMTP_CONFIG.host,
    port: SMTP_CONFIG.port,
    secure: SMTP_CONFIG.secure,
  },
} as const

