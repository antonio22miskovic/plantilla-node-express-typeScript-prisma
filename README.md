# 🚀 Plantilla Backend Express + TypeScript + Prisma + MySQL

Plantilla profesional y escalable para proyectos backend con Node.js, Express, TypeScript, Prisma y MySQL.

## ✨ Características

- ✅ **Arquitectura en Capas** (Controller-Service-Repository Pattern)
- ✅ **TypeScript** con configuración estricta
- ✅ **Prisma ORM** con MySQL
- ✅ **JWT** preparado para autenticación
- ✅ **Servicio de Email** con Nodemailer (SMTP configurable)
- ✅ **Sistema de Storage** flexible (Local/S3) para archivos
- ✅ **Sistema de Logging** con Winston (logs por día)
- ✅ **Manejo centralizado de errores**
- ✅ **Estructura modular y escalable**
- ✅ **Código completamente comentado**
- ✅ **Listo para producción**

## 📐 Arquitectura

Este proyecto utiliza **Layered Architecture** con separación clara de responsabilidades:

```
Routes → Controllers → Services → Repositories → Database
```

Ver [docs/architecture.md](./docs/architecture.md) para más detalles.

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con la siguiente configuración:

```env
# Base de Datos
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/nombre_base_datos"

# JWT - Autenticación
JWT_SECRET=tu-clave-secreta-muy-segura-minimo-32-caracteres-cambiar-en-produccion
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Servidor
PORT=3000
NODE_ENV=development

# Seed - Datos iniciales (Opcional)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!@#
ADMIN_NAME=Administrator

# Email - Envío de correos (Opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
EMAIL_FROM=noreply@example.com
EMAIL_FROM_NAME=Sistema
# URL del frontend (donde el usuario hará clic en los emails)
# Ejemplos: http://localhost:5173 (Vite), http://localhost:3000 (Next.js), https://mi-app.com
FRONTEND_URL=http://localhost:5173
# URL del backend (opcional, se construye automáticamente si no se define)
# Ejemplos: http://localhost:3000, https://api.mi-app.com
BACKEND_URL=http://localhost:3000
```

**Ejemplo completo:**
```env
DATABASE_URL="mysql://root:password@localhost:3306/mi_proyecto"
JWT_SECRET=mi-clave-secreta-super-segura-de-al-menos-32-caracteres-123456789
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=mi-email@gmail.com
SMTP_PASS=mi-app-password
EMAIL_FROM=noreply@miempresa.com
EMAIL_FROM_NAME=Mi Empresa
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```

**⚠️ IMPORTANTE:**
- Genera una clave JWT segura con: `openssl rand -base64 32`
- En producción, usa valores seguros y únicos para `JWT_SECRET`
- Para Gmail, necesitas crear una "Contraseña de aplicación" (no uses tu contraseña normal)
- El archivo `.env` NO debe subirse al repositorio (ya está en `.gitignore`)

### 3. Generar Prisma Client

```bash
npm run prisma:generate
```

> **Nota:** Este comando se ejecuta automáticamente después de `npm install` gracias al script `postinstall`.

### 4. Crear la base de datos y aplicar migraciones

```bash
# Opción 1: Crear migraciones (recomendado para producción)
npm run prisma:migrate

# Opción 2: Sincronizar schema sin migraciones (útil para desarrollo)
npm run prisma:push
```

### 5. Inicializar datos por defecto (roles, permisos y usuario admin)

```bash
npm run seed
```

> **Nota:** Esto crea los roles `admin` y `user`, sus permisos, y un usuario administrador inicial.
> Ver [docs/database/seed.md](./docs/database/seed.md) para más detalles.

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 📋 Scripts Disponibles

- `npm run dev` - Inicia el servidor en modo desarrollo con hot-reload
- `npm run prisma:generate` - Genera el cliente de Prisma
- `npm run prisma:migrate` - Crea y aplica migraciones de base de datos
- `npm run prisma:push` - Sincroniza el schema sin crear migraciones
- `npm run prisma:studio` - Abre Prisma Studio (interfaz visual para la BD)
- `npm run seed` - Inicializa datos por defecto (roles, permisos, usuario admin)

## 📁 Estructura del Proyecto

```
.
├── prisma/
│   └── schema.prisma          # Schema de Prisma (modelos de BD) - COMPLETAMENTE COMENTADO
├── src/
│   ├── config/                # Configuraciones
│   │   ├── prisma.ts          # Cliente Prisma (singleton)
│   │   └── jwt.config.ts      # Configuración JWT
│   ├── controllers/           # Controladores HTTP
│   │   ├── Auth.controller.ts # Controller de autenticación
│   │   └── User.controller.ts # Controller de usuarios (ejemplo)
│   ├── services/              # Lógica de negocio
│   │   ├── Auth.service.ts    # Service de autenticación
│   │   └── User.service.ts    # Service de usuarios (ejemplo)
│   ├── repositories/          # Acceso a datos
│   │   ├── Auth.repository.ts # Repository de autenticación
│   │   └── User.repository.ts # Repository de usuarios (ejemplo)
│   ├── models/                # Tipos y DTOs
│   │   ├── Auth.model.ts      # Tipos de autenticación
│   │   └── User.model.ts      # Tipos del modelo User
│   ├── routes/                # Definición de rutas
│   │   ├── auth.ts            # Rutas de autenticación
│   │   └── users.ts           # Rutas de usuarios (ejemplo)
│   ├── middleware/            # Middlewares
│   │   ├── auth.middleware.ts # Autenticación JWT
│   │   └── error.middleware.ts # Manejo de errores
│   ├── utils/                 # Utilidades y helpers
│   │   ├── index.ts           # Funciones auxiliares
│   │   └── password.util.ts   # Utilidades de contraseñas (Argon2)
│   ├── types/                 # Tipos globales TypeScript
│   │   └── index.ts           # Tipos compartidos
│   ├── constants/             # Constantes
│   │   └── index.ts           # Mensajes, códigos, etc
│   └── server.ts              # Punto de entrada
├── .env                       # Variables de entorno (no versionado)
├── .gitignore
├── package.json
├── tsconfig.json              # Configuración TypeScript - COMPLETAMENTE COMENTADO
├── docs/                      # Documentación completa
│   ├── README.md              # Índice de documentación
│   ├── getting-started.md     # Guía de inicio rápido
│   ├── architecture.md        # Arquitectura del proyecto
│   ├── prisma/                # Documentación de Prisma
│   │   ├── migrations.md      # Guía de migraciones
│   │   └── schema-organization.md
│   ├── auth/                  # Documentación de autenticación
│   │   └── api-examples.md    # Ejemplos de API
│   └── roles/                 # Documentación de roles
│       └── permissions.md     # Sistema RBAC
└── README.md                  # Este archivo
```

## 🔧 Solución de Problemas

### Error: "@prisma/client did not initialize yet"

Si ves este error, ejecuta:

```bash
npm run prisma:generate
```

### Error: "Missing required environment variable: DATABASE_URL"

Asegúrate de tener un archivo `.env` con la variable `DATABASE_URL` configurada correctamente.

### Error al conectar con la base de datos

1. Verifica que MySQL esté corriendo
2. Verifica que la URL de conexión en `.env` sea correcta
3. Asegúrate de que la base de datos exista (o créala manualmente)

## 🔐 Autenticación JWT

El proyecto incluye configuración completa para JWT:

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno** (`.env`):
   ```env
   JWT_SECRET=tu-clave-secreta-muy-segura
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   ```

3. **Usar en rutas**:
   ```typescript
   import { authenticate } from '../middleware/auth.middleware'
   router.post('/protected', authenticate, controller.create)
   ```

Ver `src/config/jwt.config.ts` y `src/middleware/auth.middleware.ts` para más detalles.

## 📧 Servicio de Email

El proyecto incluye un servicio de email usando Nodemailer:

1. **Configurar variables de entorno** (`.env`):
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=tu-app-password
   EMAIL_FROM=noreply@example.com
   EMAIL_FROM_NAME=Sistema
   FRONTEND_URL=http://localhost:5173
   BACKEND_URL=http://localhost:3000
   ```

2. **Usar el servicio**:
   ```typescript
   import { EmailService } from '../services/Email.service'
   const emailService = new EmailService()
   await emailService.sendPasswordResetEmail(email, token)
   ```

**Nota:** En desarrollo sin SMTP configurado, los emails se imprimen en consola. Ver `src/config/email.config.ts` y `src/services/Email.service.ts` para más detalles.

## 📝 Sistema de Logging

El proyecto incluye un sistema completo de logging usando Winston:

1. **Configurar variables de entorno** (`.env`):
   ```env
   LOG_LEVEL=info
   LOG_DIR=./logs
   ```

2. **Archivos de log generados**:
   - `error-YYYY-MM-DD.log` - Solo errores críticos
   - `combined-YYYY-MM-DD.log` - Todos los logs
   - `exceptions-YYYY-MM-DD.log` - Excepciones no capturadas
   - `rejections-YYYY-MM-DD.log` - Promesas rechazadas

3. **Usar el logger**:
   ```typescript
   import { logger } from '../config/logger.config'
   import { logError, logInfo } from '../utils/logger.util'
   
   logger.error('Error crítico', { error })
   logError(error, { userId: 123, action: 'createUser' })
   logInfo('Operación completada', { userId: 123 })
   ```

**Características:**
- Logs organizados por día (un archivo por día)
- Rotación automática de archivos
- Compresión de archivos antiguos
- Retención configurable (30 días por defecto)
- Diferentes niveles: error, warn, info, debug

Ver `src/config/logger.config.ts` y `src/utils/logger.util.ts` para más detalles.

## 📚 Documentación

### 📖 Guías Principales

- **[Guía de Inicio Rápido](./docs/getting-started.md)** ⭐ - Empieza aquí
- **[Arquitectura del Proyecto](./docs/architecture.md)** - Documentación completa de la arquitectura

### 🔧 Prisma

- **[Guía de Migraciones](./docs/prisma/migrations.md)** - Cómo crear y gestionar migraciones
- **[Organización del Schema](./docs/prisma/schema-organization.md)** - Mejores prácticas para organizar `schema.prisma`

### 🗄️ Base de Datos

- **[Seed de Base de Datos](./docs/database/seed.md)** - Inicialización de datos por defecto

### 🔐 Autenticación

- **[Ejemplos de API](./docs/auth/api-examples.md)** - Ejemplos de uso de la API de autenticación

### 👥 Roles y Permisos

- **[Sistema de Roles y Permisos](./docs/roles/permissions.md)** - Guía completa del sistema RBAC

### ⚙️ Configuración

- **[.cursorrules](./.cursorrules)** - Guía para Cursor AI (patrones y arquitectura)
- **[tsconfig.json](./tsconfig.json)** - Configuración TypeScript comentada
- **[prisma/schema.prisma](./prisma/schema.prisma)** - Schema de Prisma comentado

### 📮 API Testing

- **[Colección de Postman](./docs/api/back-end.postman_collection.json)** - Colección completa para probar todas las APIs
- **[Guía de Postman](./docs/api/README.md)** - Cómo usar la colección de Postman

## 🔗 Recursos

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de Express](https://expressjs.com/)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs/)
- [JWT.io](https://jwt.io/) - Información sobre JWT

