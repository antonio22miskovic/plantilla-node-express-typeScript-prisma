/**
 * AUTH REPOSITORY - Capa de Acceso a Datos para Autenticación
 * 
 * Este repository maneja todas las operaciones de base de datos
 * relacionadas con autenticación.
 * 
 * RESPONSABILIDADES:
 * - Buscar usuarios por email
 * - Actualizar tokens de refresco
 * - Manejar tokens de recuperación de contraseña
 * - Actualizar contraseñas
 * 
 * USO:
 *   import { AuthRepository } from '../repositories/Auth.repository'
 *   const authRepo = new AuthRepository()
 */

import { db } from '../config/prisma'
import type { User } from '@prisma/client'

export class AuthRepository {
  /**
   * Encuentra un usuario por email (para login)
   */
  async findByEmail(email: string): Promise<User | null> {
    return db.user.findUnique({
      where: { email },
    })
  }
  
  /**
   * Encuentra un usuario por email incluyendo contraseña
   * (solo para verificación de login)
   */
  async findByEmailWithPassword(email: string) {
    return db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        isActive: true,
        refreshToken: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }
  
  /**
   * Crea un nuevo usuario
   */
  async create(data: {
    email: string
    password: string
    name?: string
    roleId?: number // ID del rol (por defecto será "user")
  }): Promise<User> {
    return db.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        roleId: data.roleId || 2, // Por defecto rol "user" (ID 2)
      },
      include: {
        role: true,
      },
    })
  }
  
  /**
   * Actualiza el refresh token de un usuario
   */
  async updateRefreshToken(userId: number, refreshToken: string | null): Promise<User> {
    return db.user.update({
      where: { id: userId },
      data: { refreshToken },
    })
  }
  
  /**
   * Actualiza el token de recuperación de contraseña y su expiración
   */
  async updatePasswordResetToken(
    userId: number,
    token: string | null,
    expiresAt: Date | null
  ): Promise<User> {
    return db.user.update({
      where: { id: userId },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expiresAt,
      },
    })
  }
  
  /**
   * Encuentra un usuario por token de recuperación de contraseña
   */
  async findByPasswordResetToken(token: string): Promise<User | null> {
    return db.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(), // Token no expirado
        },
      },
    })
  }
  
  /**
   * Actualiza la contraseña de un usuario
   */
  async updatePassword(userId: number, hashedPassword: string): Promise<User> {
    return db.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    })
  }
  
  /**
   * Verifica si un email ya existe
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true },
    })
    return user !== null
  }
  
  /**
   * Encuentra un usuario por ID (para verificación de tokens)
   */
  async findById(id: number) {
    return db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        isActive: true,
        refreshToken: true,
      },
    })
  }
}

