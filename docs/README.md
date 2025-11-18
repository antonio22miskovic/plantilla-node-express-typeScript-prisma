# 📚 Documentación del Proyecto

Bienvenido a la documentación completa de la plantilla backend Express + TypeScript.

## 📖 Índice

### 🚀 Inicio Rápido
- **[Guía de Inicio](./getting-started.md)** - Configuración inicial y primeros pasos

### 🏗️ Arquitectura
- **[Arquitectura del Proyecto](./architecture.md)** - Patrón Controller-Service-Repository y estructura de capas

### 🔧 Prisma ORM
- **[Guía de Migraciones](./prisma/migrations.md)** - Cómo crear, aplicar y gestionar migraciones
- **[Organización del Schema](./prisma/schema-organization.md)** - Mejores prácticas para mantener `schema.prisma` organizado

### 🗄️ Base de Datos
- **[Seed de Base de Datos](./database/seed.md)** - Inicialización de datos por defecto (roles, permisos, admin)

### 🔐 Autenticación
- **[Ejemplos de API](./auth/api-examples.md)** - Ejemplos prácticos de uso de la API de autenticación

### 👥 Roles y Permisos
- **[Sistema RBAC](./roles/permissions.md)** - Guía completa del sistema de roles y permisos

### 📮 API Testing
- **[Colección de Postman](./api/back-end.postman_collection.json)** - Colección completa para probar todas las APIs
- **[Guía de Postman](./api/README.md)** - Cómo usar y mantener la colección

## 🎯 Estructura de Documentación

```
docs/
├── README.md                    # Este archivo (índice)
├── getting-started.md           # Guía de inicio rápido
├── architecture.md              # Arquitectura del proyecto
├── prisma/
│   ├── migrations.md            # Guía de migraciones
│   └── schema-organization.md   # Organización del schema
├── database/
│   └── seed.md                  # Seed de datos iniciales
├── auth/
│   └── api-examples.md          # Ejemplos de API de autenticación
├── api/
│   ├── README.md                # Guía de uso de Postman
│   └── back-end.postman_collection.json
└── roles/
    └── permissions.md           # Sistema de roles y permisos
```

## 💡 Cómo Usar Esta Documentación

1. **Si eres nuevo**: Empieza con [getting-started.md](./getting-started.md)
2. **Para entender la estructura**: Lee [architecture.md](./architecture.md)
3. **Para trabajar con la BD**: Consulta [prisma/migrations.md](./prisma/migrations.md)
4. **Para autenticación**: Revisa [auth/api-examples.md](./auth/api-examples.md)
5. **Para roles**: Consulta [roles/permissions.md](./roles/permissions.md)

## 🔗 Enlaces Rápidos

- [README Principal](../README.md) - Instalación y configuración básica
- [.cursorrules](../.cursorrules) - Guía de patrones para Cursor AI
- [tsconfig.json](../tsconfig.json) - Configuración TypeScript comentada
- [prisma/schema.prisma](../prisma/schema.prisma) - Schema de Prisma comentado

