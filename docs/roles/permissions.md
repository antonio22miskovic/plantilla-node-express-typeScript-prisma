# 🔐 Sistema de Roles y Permisos

Este proyecto incluye un sistema completo de roles y permisos sin necesidad de librerías externas. Es ligero, flexible y fácil de usar.

## 📋 Estructura

### Modelos de Base de Datos

- **Role**: Roles del sistema (admin, user, etc)
- **Permission**: Permisos específicos (users.create, posts.delete, etc)
- **RolePermission**: Tabla intermedia (muchos a muchos)
- **User**: Relacionado con Role (muchos usuarios → un rol)

## 🎯 Roles por Defecto

### 1. **admin**
- Acceso completo al sistema
- Todos los permisos de usuarios
- Gestión de roles y permisos

### 2. **user** (por defecto)
- Permisos básicos de lectura
- Solo puede leer su propio perfil

## 🔑 Permisos Estándar

Los permisos siguen el formato: `recurso.accion`

### Usuarios
- `users.read` - Leer usuarios
- `users.create` - Crear usuarios
- `users.update` - Actualizar usuarios
- `users.delete` - Eliminar usuarios
- `users.manage` - Todos los permisos de usuarios

### Roles y Permisos
- `roles.read` - Leer roles
- `roles.create` - Crear roles
- `roles.update` - Actualizar roles
- `roles.delete` - Eliminar roles
- `roles.manage` - Gestión completa de roles
- `permissions.read` - Leer permisos
- `permissions.manage` - Gestión completa de permisos

### Administración
- `admin.access` - Acceso completo al sistema

## 🚀 Configuración Inicial

### Paso 1: Crear Migración

```bash
npm run prisma:migrate
# Nombre: add_roles_and_permissions
```

### Paso 2: Inicializar Roles y Permisos

```bash
npm run init:roles
```

Este script:
- Crea los permisos estándar
- Crea los roles admin y user
- Asigna permisos a cada rol

## 💻 Uso en el Código

### Proteger Rutas con Permisos

```typescript
import { authenticate } from '../middleware/auth.middleware'
import { requirePermission } from '../middleware/permissions.middleware'
import { PERMISSIONS } from '../models/Role.model'

// Requiere un permiso específico
router.post('/users', 
  authenticate, 
  requirePermission(PERMISSIONS.USERS_CREATE), 
  controller.create
)

// Requiere cualquiera de los permisos
router.get('/users',
  authenticate,
  requireAnyPermission([PERMISSIONS.USERS_READ, PERMISSIONS.ADMIN_ACCESS]),
  controller.getAll
)

// Requiere todos los permisos
router.delete('/users/:id',
  authenticate,
  requireAllPermissions([PERMISSIONS.USERS_DELETE, PERMISSIONS.ADMIN_ACCESS]),
  controller.delete
)
```

### Verificar Permisos en Services

```typescript
import { RoleService } from '../services/Role.service'

const roleService = new RoleService()

// Verificar si un usuario tiene un permiso
const hasPermission = await roleService.userHasPermission(userId, 'users.create')

if (!hasPermission) {
  throw new Error('Permission denied')
}
```

### Verificar Rol en Controllers

```typescript
const user = (req as AuthenticatedRequest).user

if (user?.role === 'admin') {
  // Acción solo para admin
}
```

## 📝 Agregar Nuevos Permisos

### 1. Agregar a Role.model.ts

```typescript
export const PERMISSIONS = {
  // ... permisos existentes
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_DELETE: 'products.delete',
} as const
```

### 2. Asignar a Roles

```typescript
// En Role.service.ts o mediante API
await roleService.updateRole(adminRoleId, {
  permissionIds: [
    ...existingPermissionIds,
    productsCreatePermissionId,
    productsDeletePermissionId,
  ]
})
```

## 🎨 Ejemplos de Uso

### Ejemplo 1: Ruta Solo para Admin

```typescript
import { authenticate } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/permissions.middleware'

router.get('/admin/dashboard',
  authenticate,
  requireRole('admin'),
  controller.getDashboard
)
```

### Ejemplo 2: Ruta con Permiso Específico

```typescript
import { requirePermission } from '../middleware/permissions.middleware'
import { PERMISSIONS } from '../models/Role.model'

router.post('/products',
  authenticate,
  requirePermission(PERMISSIONS.PRODUCTS_CREATE),
  controller.createProduct
)
```

### Ejemplo 3: Verificar Permiso en Service

```typescript
async deleteProduct(userId: number, productId: number) {
  const hasPermission = await roleService.userHasPermission(
    userId, 
    PERMISSIONS.PRODUCTS_DELETE
  )
  
  if (!hasPermission) {
    const error = new Error('Permission denied') as Error & { statusCode?: number }
    error.statusCode = HTTP_STATUS.FORBIDDEN
    throw error
  }
  
  // Continuar con la eliminación...
}
```

## 🔄 Flujo de Verificación

```
Request → authenticate → requirePermission → Controller → Service
```

1. **authenticate**: Verifica token JWT y carga usuario
2. **requirePermission**: Verifica que el usuario tenga el permiso
3. **Controller**: Procesa la petición
4. **Service**: Ejecuta lógica de negocio

## 📚 Middlewares Disponibles

### `authenticate`
Verifica que el usuario esté autenticado.

### `requirePermission(permission)`
Requiere un permiso específico.

### `requireAnyPermission(permissions[])`
Requiere al menos uno de los permisos.

### `requireAllPermissions(permissions[])`
Requiere todos los permisos especificados.

### `requireRole(roleName)`
Requiere un rol específico.

## 🛠️ Gestión de Roles y Permisos

### Crear un Nuevo Rol

```typescript
const roleService = new RoleService()

await roleService.createRole({
  name: 'moderator',
  description: 'Moderator role',
  permissionIds: [permission1Id, permission2Id],
})
```

### Asignar Permisos a un Rol

```typescript
await roleService.updateRole(roleId, {
  permissionIds: [permission1Id, permission2Id, permission3Id],
})
```

### Cambiar Rol de un Usuario

```typescript
await db.user.update({
  where: { id: userId },
  data: { roleId: newRoleId },
})
```

## ⚠️ Notas Importantes

1. **Roles del Sistema**: Los roles "admin" y "user" no se pueden eliminar
2. **Permisos**: Se pueden crear y asignar dinámicamente
3. **Performance**: Los permisos se verifican en cada request, considera cachear si es necesario
4. **Seguridad**: Siempre verifica permisos en el backend, nunca confíes solo en el frontend

## 🎓 Ventajas de Este Sistema

✅ **Sin dependencias externas** - Todo está en tu código
✅ **Flexible** - Fácil agregar nuevos permisos y roles
✅ **Type-safe** - TypeScript te ayuda a evitar errores
✅ **Escalable** - Funciona bien incluso con muchos roles/permisos
✅ **Ligero** - No añade overhead innecesario

## 📖 Ver También

- `src/middleware/permissions.middleware.ts` - Middlewares de permisos
- `src/services/Role.service.ts` - Lógica de roles y permisos
- `src/models/Role.model.ts` - Tipos y constantes

