# 📮 Documentación de API - Postman Collection

Esta carpeta contiene la colección de Postman para probar todas las APIs del proyecto.

## 📥 Importar la Colección

1. Abre Postman
2. Click en **Import**
3. Selecciona el archivo `back-end.postman_collection.json`
4. La colección se importará con todas las rutas configuradas

## 🔧 Configurar Variables de Entorno

Después de importar la colección, configura las variables:

1. Click en la colección → **Variables**
2. Configura las siguientes variables:
   - `base_url`: `http://localhost:3000` (o tu URL de desarrollo)
   - `access_token`: Se actualiza automáticamente después del login
   - `refresh_token`: Se actualiza automáticamente después del login

### Variables de Entorno en Postman

También puedes crear un Environment en Postman:

1. Click en **Environments** → **Create Environment**
2. Nombre: `Development`
3. Agrega las variables:
   - `base_url`: `http://localhost:3000`
   - `access_token`: (vacío inicialmente)
   - `refresh_token`: (vacío inicialmente)
4. Selecciona este environment antes de hacer las peticiones

## 🚀 Uso Rápido

### 1. Verificar que el servidor esté corriendo

```
GET /health
```

### 2. Registrar un nuevo usuario

```
POST /api/v1/auth/register
Body: {
  "email": "user@example.com",
  "password": "Password123!@#",
  "name": "Usuario de Prueba"
}
```

Los tokens se guardan automáticamente en las variables después del registro.

### 3. Iniciar sesión

```
POST /api/v1/auth/login
Body: {
  "email": "admin@example.com",
  "password": "Admin123!@#"
}
```

Los tokens se guardan automáticamente en las variables después del login.

### 4. Usar rutas protegidas

Las rutas protegidas usan automáticamente el `access_token` guardado en las variables.

## 📋 Endpoints Disponibles

### Health Check
- `GET /health` - Verifica el estado del servidor

### Autenticación
- `POST /api/v1/auth/register` - Registro de usuarios
- `POST /api/v1/auth/login` - Inicio de sesión
- `POST /api/v1/auth/refresh` - Refrescar access token
- `GET /api/v1/auth/me` - Obtener usuario actual (requiere auth)
- `POST /api/v1/auth/change-password` - Cambiar contraseña (requiere auth)
- `POST /api/v1/auth/forgot-password` - Solicitar recuperación de contraseña
- `POST /api/v1/auth/reset-password` - Resetear contraseña con token
- `POST /api/v1/auth/logout` - Cerrar sesión (requiere auth)

### Usuarios
- `GET /api/v1/users` - Listar usuarios (con paginación y filtros)
- `GET /api/v1/users/:id` - Obtener usuario por ID
- `POST /api/v1/users` - Crear usuario (debería estar protegida)
- `PUT /api/v1/users/:id` - Actualizar usuario (debería estar protegida)
- `DELETE /api/v1/users/:id` - Eliminar usuario (debería estar protegida)

## 🔄 Actualizar la Colección

Cuando agregues nuevas APIs al proyecto:

1. Abre la colección en Postman
2. Agrega la nueva request en la carpeta correspondiente
3. Configura:
   - Método HTTP (GET, POST, PUT, DELETE)
   - URL con `{{base_url}}`
   - Headers si es necesario (Authorization para rutas protegidas)
   - Body si es necesario
   - Tests para guardar tokens automáticamente (si aplica)
4. Exporta la colección actualizada
5. Reemplaza el archivo `back-end.postman_collection.json`

## 📝 Notas

- Los tokens se actualizan automáticamente después de login/register/refresh
- Las rutas protegidas usan automáticamente el `access_token` de las variables
- En desarrollo, algunas rutas están públicas pero deberían protegerse en producción
- Ver `docs/auth/api-examples.md` para ejemplos detallados de cada endpoint

## 🔗 Ver También

- [Ejemplos de API de Autenticación](../auth/api-examples.md) - Ejemplos detallados
- [README Principal](../../README.md) - Configuración del proyecto
- [Guía de Inicio Rápido](../getting-started.md) - Primeros pasos

