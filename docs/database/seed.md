# 🌱 Seed de Base de Datos

Este documento explica cómo usar el sistema de seed para inicializar la base de datos con datos por defecto.

## 📋 ¿Qué hace el Seed?

El seed inicializa la base de datos con:

1. **Roles por defecto**:
   - `admin` - Rol de administrador con todos los permisos
   - `user` - Rol de usuario estándar con permisos básicos

2. **Permisos estándar**:
   - Permisos de usuarios (`users.read`, `users.create`, etc.)
   - Permisos de roles (`roles.read`, `roles.create`, etc.)
   - Permisos de administración (`admin.access`)

3. **Usuario administrador inicial**:
   - Email: `admin@example.com` (configurable)
   - Contraseña: `Admin123!@#` (configurable)
   - Rol: `admin`

## 🚀 Uso Básico

### Ejecutar el Seed

```bash
npm run seed
```

Este comando:
- ✅ Crea los roles y permisos si no existen
- ✅ Crea el usuario admin si no existe
- ✅ Es idempotente (puede ejecutarse múltiples veces sin problemas)

## ⚙️ Configuración

### Variables de Entorno

Puedes configurar las credenciales del admin mediante variables de entorno:

```bash
# .env
ADMIN_EMAIL=admin@miempresa.com
ADMIN_PASSWORD=MiPasswordSegura123!
ADMIN_NAME=Administrador Principal
```

Luego ejecuta:

```bash
npm run seed
```

### Valores por Defecto

Si no configuras las variables de entorno, se usarán estos valores:

- **Email**: `admin@example.com`
- **Contraseña**: `Admin123!@#`
- **Nombre**: `Administrator`

⚠️ **IMPORTANTE**: Cambia la contraseña después del primer inicio de sesión!

## 📝 Ejemplo de Salida

```
🚀 Iniciando seed de base de datos...

🔐 Inicializando roles y permisos...
✅ Roles creados: 2
✅ Permisos creados: 12

👥 Roles disponibles:
   - admin: 4 permisos
     Permisos: admin.access, users.manage, roles.manage, permissions.manage
   - user: 1 permisos
     Permisos: users.read

👤 Creando usuario administrador...
✅ Usuario administrador creado exitosamente

📧 Credenciales de acceso:
   Email: admin@example.com
   Contraseña: Admin123!@#

⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión!

✨ Seed completado exitosamente!

📚 Próximos pasos:
   1. Inicia sesión con las credenciales del admin
   2. Cambia la contraseña del admin
   3. Crea usuarios adicionales según necesites
```

## 🔄 Comportamiento Idempotente

El seed está diseñado para ser **idempotente**, lo que significa:

- ✅ Puedes ejecutarlo múltiples veces sin crear duplicados
- ✅ Si los roles ya existen, no los recrea
- ✅ Si el usuario admin ya existe, solo verifica que tenga el rol correcto
- ✅ Si el usuario existe pero no tiene rol admin, se lo asigna

### Ejemplo: Ejecutar dos veces

```bash
# Primera ejecución
npm run seed
# ✅ Crea roles, permisos y usuario admin

# Segunda ejecución
npm run seed
# ⚠️  Usuario admin ya existe: admin@example.com
# ✅ Solo verifica que todo esté correcto
```

## 🛠️ Casos de Uso

### Desarrollo Local

```bash
# Configurar .env con credenciales de desarrollo
ADMIN_EMAIL=dev@localhost
ADMIN_PASSWORD=dev123

# Ejecutar seed
npm run seed
```

### Producción

```bash
# Configurar .env con credenciales seguras
ADMIN_EMAIL=admin@produccion.com
ADMIN_PASSWORD=PasswordMuySegura123!@#

# Ejecutar seed
npm run seed
```

### CI/CD

```bash
# En tu pipeline de CI/CD
export ADMIN_EMAIL=ci@example.com
export ADMIN_PASSWORD=$CI_ADMIN_PASSWORD
npm run seed
```

## 🔐 Seguridad

### Buenas Prácticas

1. **Nunca commitees credenciales**:
   - Usa variables de entorno
   - Agrega `.env` a `.gitignore`

2. **Cambia la contraseña después del primer login**:
   - El seed usa una contraseña por defecto
   - Cámbiala inmediatamente después del primer acceso

3. **Usa contraseñas seguras en producción**:
   - Mínimo 12 caracteres
   - Combina mayúsculas, minúsculas, números y símbolos

4. **Rota las credenciales periódicamente**:
   - Cambia las contraseñas cada 90 días
   - Usa un gestor de contraseñas

## 📚 Archivos Relacionados

- `src/scripts/seed.ts` - Script principal del seed
- `src/services/Role.service.ts` - Lógica de roles y permisos
- `src/repositories/Auth.repository.ts` - Acceso a datos de usuarios

## 🆘 Solución de Problemas

### Error: "Rol admin no encontrado"

**Causa**: Los roles no se crearon correctamente.

**Solución**:
```bash
# Verifica que la migración se haya aplicado
npm run prisma:migrate:status

# Si hay migraciones pendientes, aplícalas
npm run prisma:migrate:deploy
```

### Error: "Usuario admin ya existe"

**Causa**: El usuario admin ya fue creado previamente.

**Solución**: Esto es normal. El seed verifica que el usuario tenga el rol correcto. Si necesitas recrearlo:

```sql
-- Desde Prisma Studio o MySQL
DELETE FROM User WHERE email = 'admin@example.com';
```

Luego ejecuta `npm run seed` nuevamente.

### Error de conexión a la base de datos

**Causa**: La base de datos no está configurada o no está corriendo.

**Solución**:
1. Verifica que MySQL esté corriendo
2. Verifica que `DATABASE_URL` en `.env` sea correcta
3. Asegúrate de que la base de datos exista

## 🔗 Ver También

- [Guía de Migraciones](../prisma/migrations.md) - Cómo crear y aplicar migraciones
- [Sistema de Roles y Permisos](../roles/permissions.md) - Documentación completa de RBAC
- [Ejemplos de API de Autenticación](../auth/api-examples.md) - Cómo usar la API

