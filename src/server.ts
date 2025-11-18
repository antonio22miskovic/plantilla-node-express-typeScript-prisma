/**
 * SERVER - Punto de Entrada de la Aplicación
 * 
 * Este archivo configura y arranca el servidor Express.
 * Aquí se configuran todos los middlewares globales y rutas.
 */

import express from 'express'
import authRouter from './routes/auth'
import userRouter from './routes/users'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'

// Crear instancia de Express
const app = express()

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// Parsear JSON en el body de las peticiones
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
})
