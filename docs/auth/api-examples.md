# 🔐 Guía de Uso de la API de Autenticación

Esta guía muestra cómo usar todas las funcionalidades de autenticación implementadas.

## 📋 Requisitos Previos

1. **Variables de entorno** (`.env`):
```env
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/nombre_bd"
JWT_SECRET=tu-clave-secreta-muy-segura-minimo-32-caracteres
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

2. **Migración de base de datos**:
```bash
npm run prisma:migrate
# Nombre sugerido: add_auth_fields
```

3. **Servidor corriendo**:
```bash
npm run dev
```

---

## 1️⃣ REGISTRO DE USUARIO

### Endpoint
```
POST /api/v1/auth/register
```

### Request Body
```json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123!",
  "name": "Juan Pérez"  // Opcional
}
```

### Requisitos de Contraseña
- Mínimo 8 caracteres
- Al menos una letra mayúscula
- Al menos una letra minúscula
- Al menos un número
- Al menos un carácter especial (!@#$%^&*(),.?":{}|<>)

### Ejemplo con cURL
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "MiPassword123!",
    "name": "Juan Pérez"
  }'
```

### Ejemplo con JavaScript (fetch)
```javascript
const response = await fetch('http://localhost:3000/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'usuario@ejemplo.com',
    password: 'MiPassword123!',
    name: 'Juan Pérez'
  })
});

const data = await response.json();
console.log(data);
```

### Respuesta Exitosa (201 Created)
```json
{
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@ejemplo.com",
      "name": "Juan Pérez",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Errores Posibles

**400 Bad Request** - Email o contraseña faltante:
```json
{
  "message": "Internal server error",
  "error": "Email and password are required"
}
```

**400 Bad Request** - Contraseña débil:
```json
{
  "message": "Internal server error",
  "error": "Password must contain at least one uppercase letter"
}
```

**409 Conflict** - Email ya existe:
```json
{
  "message": "Internal server error",
  "error": "User with this email already exists"
}
```

---

## 2️⃣ INICIO DE SESIÓN (LOGIN)

### Endpoint
```
POST /api/v1/auth/login
```

### Request Body
```json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123!"
}
```

### Ejemplo con cURL
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "MiPassword123!"
  }'
```

### Respuesta Exitosa (200 OK)
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@ejemplo.com",
      "name": "Juan Pérez",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Errores Posibles

**401 Unauthorized** - Credenciales incorrectas:
```json
{
  "message": "Internal server error",
  "error": "Invalid email or password"
}
```

**403 Forbidden** - Cuenta desactivada:
```json
{
  "message": "Internal server error",
  "error": "Account is deactivated"
}
```

---

## 3️⃣ RECUPERACIÓN DE CONTRASEÑA

### Paso 1: Solicitar Reset de Contraseña

#### Endpoint
```
POST /api/v1/auth/forgot-password
```

#### Request Body
```json
{
  "email": "usuario@ejemplo.com"
}
```

#### Ejemplo con cURL
```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com"
  }'
```

#### Respuesta Exitosa (200 OK)
```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Nota de Seguridad**: Por seguridad, siempre se retorna el mismo mensaje, incluso si el email no existe. Esto previene la enumeración de emails.

#### Token Generado
En desarrollo, el token se imprime en la consola del servidor:
```
Password reset token for usuario@ejemplo.com: abc123def456...
```

**En producción**, este token debería enviarse por email. El token expira en 1 hora.

---

### Paso 2: Resetear Contraseña con Token

#### Endpoint
```
POST /api/v1/auth/reset-password
```

#### Request Body
```json
{
  "token": "abc123def456...",
  "password": "NuevaPassword123!"
}
```

#### Ejemplo con cURL
```bash
curl -X POST http://localhost:3000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456...",
    "password": "NuevaPassword123!"
  }'
```

#### Respuesta Exitosa (200 OK)
```json
{
  "message": "Password has been reset successfully"
}
```

#### Errores Posibles

**400 Bad Request** - Token inválido o expirado:
```json
{
  "message": "Internal server error",
  "error": "Invalid or expired reset token"
}
```

**400 Bad Request** - Contraseña débil:
```json
{
  "message": "Internal server error",
  "error": "Password must contain at least one uppercase letter"
}
```

---

## 4️⃣ REFRESCAR TOKEN

### Endpoint
```
POST /api/v1/auth/refresh
```

### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Ejemplo con cURL
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### Respuesta Exitosa (200 OK)
```json
{
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 5️⃣ OBTENER USUARIO ACTUAL

### Endpoint
```
GET /api/v1/auth/me
```

### Headers Requeridos
```
Authorization: Bearer <accessToken>
```

### Ejemplo con cURL
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Respuesta Exitosa (200 OK)
```json
{
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "role": "user"
  }
}
```

---

## 6️⃣ CAMBIAR CONTRASEÑA

### Endpoint
```
POST /api/v1/auth/change-password
```

### Headers Requeridos
```
Authorization: Bearer <accessToken>
```

### Request Body
```json
{
  "currentPassword": "MiPassword123!",
  "newPassword": "NuevaPassword456!"
}
```

### Ejemplo con cURL
```bash
curl -X POST http://localhost:3000/api/v1/auth/change-password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "MiPassword123!",
    "newPassword": "NuevaPassword456!"
  }'
```

### Respuesta Exitosa (200 OK)
```json
{
  "message": "Password has been changed successfully"
}
```

---

## 7️⃣ CERRAR SESIÓN (LOGOUT)

### Endpoint
```
POST /api/v1/auth/logout
```

### Headers Requeridos
```
Authorization: Bearer <accessToken>
```

### Ejemplo con cURL
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Respuesta Exitosa (200 OK)
```json
{
  "message": "Logged out successfully"
}
```

---

## 🔄 Flujo Completo de Ejemplo

### 1. Registrar usuario
```bash
POST /api/v1/auth/register
→ Guarda accessToken y refreshToken
```

### 2. Usar accessToken para rutas protegidas
```bash
GET /api/v1/auth/me
Headers: Authorization: Bearer <accessToken>
```

### 3. Cuando el accessToken expire (15 min)
```bash
POST /api/v1/auth/refresh
Body: { "refreshToken": "..." }
→ Obtiene nuevo accessToken y refreshToken
```

### 4. Si olvidas la contraseña
```bash
# Paso 1: Solicitar reset
POST /api/v1/auth/forgot-password
Body: { "email": "..." }
→ Obtener token de la consola del servidor

# Paso 2: Resetear contraseña
POST /api/v1/auth/reset-password
Body: { "token": "...", "password": "..." }
```

### 5. Cambiar contraseña (usuario autenticado)
```bash
POST /api/v1/auth/change-password
Headers: Authorization: Bearer <accessToken>
Body: { "currentPassword": "...", "newPassword": "..." }
```

---

## 📝 Notas Importantes

1. **Access Token**: Expira en 15 minutos (configurable)
2. **Refresh Token**: Expira en 7 días (configurable)
3. **Token de Reset**: Expira en 1 hora
4. **Seguridad**: Las contraseñas nunca se almacenan en texto plano, siempre hasheadas con Argon2
5. **Logout**: Invalida el refresh token, forzando re-autenticación
6. **Reset Password**: También invalida todos los refresh tokens existentes

---

## 🧪 Testing Rápido

### Script de prueba completo (bash)
```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api/v1/auth"

# 1. Registrar
echo "1. Registrando usuario..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","name":"Test User"}')
echo $REGISTER_RESPONSE | jq .

# Extraer tokens
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.accessToken')
REFRESH_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.refreshToken')

# 2. Obtener usuario actual
echo -e "\n2. Obteniendo usuario actual..."
curl -s -X GET $BASE_URL/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .

# 3. Solicitar reset de contraseña
echo -e "\n3. Solicitando reset de contraseña..."
curl -s -X POST $BASE_URL/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}' | jq .

# 4. Logout
echo -e "\n4. Cerrando sesión..."
curl -s -X POST $BASE_URL/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
```

---

¿Necesitas ayuda con algo más específico de la autenticación?

