/**
 * SERVER - Punto de Entrada de la Aplicación
 * 
 * Este archivo configura y arranca el servidor Express.
 * Aquí se configuran todos los middlewares globales y rutas.
 */

import express from 'express'
import path from 'path'
import authRouter from './routes/auth'
import userRouter from './routes/users'
import fileRouter from './routes/files'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'
import { requestLogger } from './middleware/request-logger.middleware'
import { logAppStart, logAppShutdown } from './utils/logger.util'
import './config/logger.config' // Inicializar logger

// Crear instancia de Express
const app = express()

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// Parsear JSON en el body de las peticiones
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Middleware de logging de requests (debe ir después de los parsers pero antes de las rutas)
app.use(requestLogger)

// Servir archivos estáticos desde la carpeta uploads
const uploadsPath = process.env.STORAGE_LOCAL_PATH || path.join(process.cwd(), 'uploads')
app.use('/uploads', express.static(uploadsPath))

// ============================================
// RUTAS
// ============================================

// Ruta de salud (health check)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Rutas de la API
app.use('/api/v1/auth', authRouter)  // Rutas de autenticación
app.use('/api/v1/users', userRouter) // Rutas de usuarios
app.use('/api/v1/files', fileRouter) // Rutas de archivos

// ============================================
// MANEJO DE ERRORES
// ============================================

// Manejar rutas no encontradas (404)
app.use(notFoundHandler)

// Manejo centralizado de errores (debe ser el último middleware)
app.use(errorHandler)

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = parseInt(process.env.PORT || '3000', 10)

const server = app.listen(PORT, () => {
  const environment = process.env.NODE_ENV || 'development'
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`📝 Environment: ${environment}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
  
  // Registrar inicio en logs
  logAppStart(PORT, environment)
})

// Manejar cierre graceful del servidor
const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} recibido. Cerrando servidor...`)
  logAppShutdown(signal)
  
  server.close(() => {
    console.log('Servidor cerrado correctamente')
    process.exit(0)
  })
  
  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    console.error('Forzando cierre del servidor...')
    process.exit(1)
  }, 10000)
}

// Escuchar señales de cierre
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
