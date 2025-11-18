# 🏗️ Arquitectura del Proyecto

Este documento explica la arquitectura y estructura del proyecto backend.

## 📐 Patrón Arquitectónico

Este proyecto utiliza **Layered Architecture (Arquitectura en Capas)**, también conocida como **Controller-Service-Repository Pattern**.

### ¿Por qué este patrón?

- ✅ **Separación clara de responsabilidades**: Cada capa tiene un propósito específico
- ✅ **Fácil de testear**: Cada capa se puede mockear independientemente
- ✅ **Escalable**: Fácil agregar nuevas features sin afectar otras partes
- ✅ **Mantenible**: Cambios aislados por capa
- ✅ **Estándar de la industria**: Patrón ampliamente usado y reconocido

## 📁 Estructura de Carpetas

```
src/
├── config/           # Configuraciones (Prisma, JWT, env, etc)
├── controllers/      # Controladores HTTP (reciben req/res, llaman services)
├── services/         # Lógica de negocio (reglas de negocio, orquestación)
├── repositories/     # Acceso a datos (queries Prisma, abstracción de BD)
├── models/           # Tipos TypeScript, DTOs, interfaces, tipos Prisma
├── routes/           # Definición de rutas (solo routing, sin lógica)
├── middleware/       # Middlewares (auth, validators, error handling, logging)
├── utils/            # Helpers y utilidades (formatters, validators, etc)
├── types/            # Tipos globales de TypeScript (extensions, global types)
├── constants/       # Constantes (mensajes, códigos de error, etc)
└── server.ts        # Punto de entrada de la aplicación
```

## 🔄 Flujo de Datos

```
HTTP Request
    ↓
Routes (definición de endpoints)
    ↓
Middleware (autenticación, validación, etc)
    ↓
Controller (extrae datos de req, valida entrada básica)
    ↓
Service (lógica de negocio, validaciones complejas)
    ↓
Repository (acceso a base de datos)
    ↓
Prisma Client (ORM)
    ↓
Base de Datos (MySQL)
    ↓
[Respuesta en sentido inverso]
    ↓
HTTP Response
```

## 📚 Descripción de Capas

### 1. **Routes** (`src/routes/`)
- **Responsabilidad**: Definir endpoints HTTP y conectar con controllers
- **NO debe**: Contener lógica de negocio
- **Ejemplo**: `router.get('/users', controller.getAll)`

### 2. **Controllers** (`src/controllers/`)
- **Responsabilidad**: 
  - Recibir peticiones HTTP (req/res)
  - Extraer datos de `req` (body, params, query)
  - Llamar a los Services apropiados
  - Formatear respuestas HTTP
- **NO debe**: 
  - Contener lógica de negocio
  - Acceder directamente a la base de datos
- **Ejemplo**: `async getAll(req, res) { const users = await userService.getAll(); res.json(users) }`

### 3. **Services** (`src/services/`)
- **Responsabilidad**:
  - Implementar reglas de negocio
  - Validar datos de entrada
  - Orquestar operaciones entre repositories
  - Transformar datos entre capas
- **NO debe**:
  - Conocer detalles de HTTP (req/res)
  - Acceder directamente a la base de datos
- **Ejemplo**: `async createUser(data) { validateEmail(data.email); return userRepository.create(data) }`

### 4. **Repositories** (`src/repositories/`)
- **Responsabilidad**:
  - Ejecutar queries de Prisma
  - Manejar relaciones entre modelos
  - Abstraer la complejidad de la base de datos
- **NO debe**:
  - Contener lógica de negocio
  - Validar datos (eso es responsabilidad del Service)
- **Ejemplo**: `async findAll() { return db.user.findMany() }`

### 5. **Models** (`src/models/`)
- **Responsabilidad**: Definir tipos TypeScript, DTOs, interfaces
- **Ejemplo**: `interface CreateUserInput { email: string; name?: string }`

### 6. **Middleware** (`src/middleware/`)
- **Responsabilidad**: Procesar peticiones antes de llegar a los controllers
- **Ejemplos**:
  - Autenticación JWT
  - Validación de datos
  - Manejo de errores
  - Logging

### 7. **Utils** (`src/utils/`)
- **Responsabilidad**: Funciones auxiliares reutilizables
- **Ejemplos**: Validadores, formatters, helpers

### 8. **Constants** (`src/constants/`)
- **Responsabilidad**: Constantes reutilizables
- **Ejemplos**: Mensajes HTTP, códigos de error, configuraciones

### 9. **Types** (`src/types/`)
- **Responsabilidad**: Tipos globales de TypeScript
- **Ejemplos**: `ApiResponse`, `AuthenticatedRequest`, DTOs globales

### 10. **Config** (`src/config/`)
- **Responsabilidad**: Configuraciones de la aplicación
- **Ejemplos**: Prisma client, JWT config, variables de entorno

## 🔐 Autenticación JWT

El proyecto está preparado para JWT con:

- **Configuración**: `src/config/jwt.config.ts`
- **Middleware**: `src/middleware/auth.middleware.ts`
- **Uso**: Agrega `authenticate` middleware a las rutas protegidas

```typescript
import { authenticate } from '../middleware/auth.middleware'
router.post('/protected', authenticate, controller.create)
```

## 📝 Convenciones de Código

### Nombres de Archivos
- **Controllers**: `*.controller.ts` (ej: `User.controller.ts`)
- **Services**: `*.service.ts` (ej: `User.service.ts`)
- **Repositories**: `*.repository.ts` (ej: `User.repository.ts`)
- **Models**: `*.model.ts` (ej: `User.model.ts`)

### Nombres de Clases
- **Controllers**: `UserController`
- **Services**: `UserService`
- **Repositories**: `UserRepository`

### Estructura de Respuestas API
```typescript
{
  message: "Operation completed successfully",
  data: { ... },
  error?: "..."
}
```

## 🧪 Testing (Futuro)

Cada capa se puede testear independientemente:

- **Controllers**: Mockear Services
- **Services**: Mockear Repositories
- **Repositories**: Mockear Prisma Client

## 🚀 Agregar una Nueva Feature

Para agregar una nueva feature (ej: Posts):

1. **Model**: Crear `src/models/Post.model.ts` con tipos
2. **Repository**: Crear `src/repositories/Post.repository.ts` con queries
3. **Service**: Crear `src/services/Post.service.ts` con lógica de negocio
4. **Controller**: Crear `src/controllers/Post.controller.ts` con handlers HTTP
5. **Routes**: Crear `src/routes/posts.ts` y agregar a `server.ts`

## 📖 Recursos

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

