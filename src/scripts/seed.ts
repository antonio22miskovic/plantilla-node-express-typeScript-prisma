/**
 * SEED SCRIPT - Inicialización de Datos Base
 * 
 * Este script inicializa la base de datos con:
 * - Roles por defecto (admin, user)
 * - Permisos estándar
 * - Usuario administrador inicial
 * 
 * USO:
 *   npm run seed
 *   o
 *   tsx src/scripts/seed.ts
 * 
 * NOTA: Este script es idempotente, puede ejecutarse múltiples veces
 * sin crear duplicados.
 */

import { RoleService } from '../services/Role.service'
import { AuthRepository } from '../repositories/Auth.repository'
import { hashPassword } from '../utils/password.util'
import { db } from '../config/prisma'
import { ROLE_NAMES } from '../models/Role.model'

// ============================================
// CONFIGURACIÓN
// ============================================

/**
 * Credenciales del usuario administrador inicial
 * 
 * IMPORTANTE: Cambia estas credenciales después de la primera ejecución
 * o configúralas mediante variables de entorno.
 */
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!@#'
const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrator'

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Inicializa roles y permisos
 */
async function seedRolesAndPermissions(): Promise<void> {
  console.log('🔐 Inicializando roles y permisos...')
  
  const roleService = new RoleService()
  await roleService.initializeDefaultRolesAndPermissions()
  
  // Mostrar resumen
  const roles = await roleService.getAllRoles()
  const permissions = await roleService.getAllPermissions()
  
  console.log(`✅ Roles creados: ${roles.length}`)
  console.log(`✅ Permisos creados: ${permissions.length}`)
  
  console.log('\n👥 Roles disponibles:')
  for (const role of roles) {
    const roleWithPerms = await roleService.getRoleByIdWithPermissions(role.id)
    const permNames = roleWithPerms?.permissions.map((rp) => rp.permission.name) || []
    console.log(`   - ${role.name}: ${permNames.length} permisos`)
    if (permNames.length > 0 && permNames.length <= 5) {
      console.log(`     Permisos: ${permNames.join(', ')}`)
    }
  }
  
  return { roles, permissions }
}

/**
 * Crea el usuario administrador inicial
 */
async function seedAdminUser(roles: any[]): Promise<void> {
  console.log('\n👤 Creando usuario administrador...')
  
  const authRepository = new AuthRepository()
  
  // Buscar el rol admin
  const adminRole = roles.find((r) => r.name === ROLE_NAMES.ADMIN)
  if (!adminRole) {
    throw new Error('Rol admin no encontrado. Asegúrate de que los roles se hayan creado correctamente.')
  }
  
  // Verificar si el usuario admin ya existe
  const existingAdmin = await authRepository.findByEmail(ADMIN_EMAIL)
  
  if (existingAdmin) {
    console.log(`⚠️  Usuario admin ya existe: ${ADMIN_EMAIL}`)
    console.log('   Si deseas recrearlo, elimínalo primero desde la base de datos.')
    
    // Verificar si tiene el rol admin
    const userWithRole = await db.user.findUnique({
      where: { id: existingAdmin.id },
      include: { role: true },
    })
    
    if (userWithRole?.role?.name !== ROLE_NAMES.ADMIN) {
      console.log('   Actualizando rol a admin...')
      await db.user.update({
        where: { id: existingAdmin.id },
        data: { roleId: adminRole.id },
      })
      console.log('✅ Rol actualizado a admin')
    } else {
      console.log('   El usuario ya tiene el rol admin asignado.')
    }
    
    return
  }
  
  // Hash de la contraseña
  const hashedPassword = await hashPassword(ADMIN_PASSWORD)
  
  // Crear usuario admin
  const adminUser = await authRepository.create({
    email: ADMIN_EMAIL,
    password: hashedPassword,
    name: ADMIN_NAME,
    roleId: adminRole.id,
  })
  
  console.log('✅ Usuario administrador creado exitosamente')
  console.log(`\n📧 Credenciales de acceso:`)
  console.log(`   Email: ${ADMIN_EMAIL}`)
  console.log(`   Contraseña: ${ADMIN_PASSWORD}`)
  console.log(`\n⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión!`)
}

/**
 * Función principal del seeder
 */
async function main(): Promise<void> {
  console.log('🚀 Iniciando seed de base de datos...\n')
  
  try {
    // 1. Inicializar roles y permisos
    const { roles } = await seedRolesAndPermissions()
    
    // 2. Crear usuario administrador
    await seedAdminUser(roles)
    
    console.log('\n✨ Seed completado exitosamente!')
    console.log('\n📚 Próximos pasos:')
    console.log('   1. Inicia sesión con las credenciales del admin')
    console.log('   2. Cambia la contraseña del admin')
    console.log('   3. Crea usuarios adicionales según necesites')
    
  } catch (error) {
    console.error('\n❌ Error durante el seed:', error)
    
    if (error instanceof Error) {
      console.error('   Mensaje:', error.message)
      if (error.stack) {
        console.error('   Stack:', error.stack)
      }
    }
    
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar el seeder
main()

