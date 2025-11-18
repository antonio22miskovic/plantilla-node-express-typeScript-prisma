/**
 * INIT ROLES SCRIPT
 * 
 * Script para inicializar roles y permisos por defecto en la base de datos.
 * 
 * Este script debe ejecutarse una vez después de crear las migraciones
 * para poblar la base de datos con los roles y permisos iniciales.
 * 
 * USO:
 *   npm run init:roles
 *   o
 *   tsx src/scripts/init-roles.ts
 */

import { RoleService } from '../services/Role.service'
import { db } from '../config/prisma'

async function main() {
  console.log('🚀 Inicializando roles y permisos...')
  
  try {
    const roleService = new RoleService()
    
    // Inicializar roles y permisos por defecto
    await roleService.initializeDefaultRolesAndPermissions()
    
    console.log('✅ Roles y permisos inicializados correctamente')
    
    // Mostrar resumen
    const roles = await roleService.getAllRoles()
    const permissions = await roleService.getAllPermissions()
    
    console.log('\n📊 Resumen:')
    console.log(`   Roles creados: ${roles.length}`)
    console.log(`   Permisos creados: ${permissions.length}`)
    
    console.log('\n👥 Roles:')
    for (const role of roles) {
      const roleWithPerms = await roleService.getRoleByIdWithPermissions(role.id)
      const permNames = roleWithPerms?.permissions.map((rp) => rp.permission.name) || []
      console.log(`   - ${role.name}: ${permNames.length} permisos`)
    }
    
    console.log('\n🔐 Permisos disponibles:')
    for (const permission of permissions) {
      console.log(`   - ${permission.name}`)
    }
    
  } catch (error) {
    console.error('❌ Error al inicializar roles y permisos:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

main()

