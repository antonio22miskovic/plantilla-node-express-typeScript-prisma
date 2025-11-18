# 📚 Guía Completa de Migraciones con Prisma

Esta guía explica las mejores prácticas para trabajar con migraciones y esquemas de base de datos usando Prisma.

---

## 🎯 Flujo de Trabajo Recomendado

### **Regla de Oro:**
> **SIEMPRE modifica primero `schema.prisma`, luego crea la migración**

```
1. Modificar schema.prisma
   ↓
2. Crear migración: npm run prisma:migrate
   ↓
3. Prisma genera SQL y lo aplica automáticamente
   ↓
4. Prisma Client se regenera automáticamente
```

---

## 📝 Casos de Uso Comunes

### 1️⃣ **Crear una Nueva Tabla**

#### Paso 1: Agregar el modelo en `schema.prisma`

```prisma
// Ejemplo: Crear tabla de Productos
model Product {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(255)
  description String?
  price       Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relación con User (opcional)
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([name])
}
```

#### Paso 2: Crear y aplicar la migración

```bash
npm run prisma:migrate
# Nombre sugerido: create_product_table
```

**Qué hace Prisma:**
- Genera el archivo SQL en `prisma/migrations/YYYYMMDDHHMMSS_create_product_table/migration.sql`
- Aplica los cambios a la base de datos
- Regenera Prisma Client automáticamente

#### Paso 3: Verificar

```bash
# Ver el estado de las migraciones
npx prisma migrate status

# Ver el schema en Prisma Studio
npm run prisma:studio
```

---

### 2️⃣ **Agregar Campos a una Tabla Existente**

#### Paso 1: Modificar el modelo en `schema.prisma`

```prisma
model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  name    String?
  password String
  
  // NUEVO CAMPO
  phone   String?  // Campo opcional
  
  // ... resto de campos
}
```

#### Paso 2: Crear migración

```bash
npm run prisma:migrate
# Nombre sugerido: add_phone_to_user
```

**Prisma detectará automáticamente:**
- Campo nuevo: `phone`
- Tipo: `String?` (nullable)
- Generará: `ALTER TABLE User ADD COLUMN phone VARCHAR(191)`

---

### 3️⃣ **Modificar un Campo Existente**

#### Ejemplo: Cambiar tipo de dato

**ANTES:**
```prisma
model User {
  age Int?
}
```

**DESPUÉS:**
```prisma
model User {
  age String?  // Cambiar de Int a String
}
```

#### Crear migración:

```bash
npm run prisma:migrate
# Nombre sugerido: change_user_age_to_string
```

**⚠️ ADVERTENCIA:** 
- Si hay datos existentes, Prisma puede fallar
- Puede requerir migración manual de datos
- Considera usar `@map` para renombrar si es necesario

---

### 4️⃣ **Agregar Relaciones**

#### Ejemplo: Relación muchos a muchos

**ANTES:**
```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
}

model Product {
  id   Int    @id @default(autoincrement())
  name String
}
```

**DESPUÉS:**
```prisma
model User {
  id       Int       @id @default(autoincrement())
  email    String    @unique
  products Product[] // Relación muchos a muchos
}

model Product {
  id      Int    @id @default(autoincrement())
  name    String
  users   User[] // Relación muchos a muchos
}
```

**Prisma creará automáticamente:**
- Tabla intermedia `_ProductToUser`
- Claves foráneas necesarias

---

### 5️⃣ **Agregar Índices**

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String
  
  @@index([name])           // Índice simple
  @@index([email, name])    // Índice compuesto
}
```

---

### 6️⃣ **Agregar Constraints**

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique  // Constraint único
  age   Int    @default(18)  // Valor por defecto
}
```

---

## 🔧 Comandos de Migración

### **Migración Normal (Desarrollo y Producción)**
```bash
npm run prisma:migrate
# o
npx prisma migrate dev
```

**Qué hace:**
- Crea archivo SQL en `prisma/migrations/`
- Aplica cambios a la BD
- Regenera Prisma Client

---

### **Crear Migración SIN Aplicar**
```bash
npm run prisma:migrate:create
# o
npx prisma migrate dev --create-only
```

**Útil cuando:**
- Quieres revisar el SQL antes de aplicarlo
- Necesitas modificar el SQL manualmente
- Trabajas en equipo y quieres revisar cambios

**Luego aplicar manualmente:**
```bash
npx prisma migrate deploy
```

---

### **Aplicar Migraciones Pendientes (Solo Producción)**
```bash
npx prisma migrate deploy
```

**Usa esto en producción**, NO `migrate dev`:
- No crea nuevas migraciones
- Solo aplica migraciones pendientes
- Más seguro para producción

---

### **Sincronizar Schema SIN Migraciones (Solo Desarrollo)**
```bash
npm run prisma:push
# o
npx prisma db push
```

**⚠️ SOLO PARA DESARROLLO:**
- No crea archivos de migración
- Útil para prototipado rápido
- **NO usar en producción**
- No mantiene historial

---

### **Ver Estado de Migraciones**
```bash
npx prisma migrate status
```

Muestra:
- Migraciones aplicadas
- Migraciones pendientes
- Estado de la base de datos

---

### **Resetear Base de Datos (CUIDADO)**
```bash
npx prisma migrate reset
```

**⚠️ ELIMINA TODOS LOS DATOS:**
- Borra toda la base de datos
- Aplica todas las migraciones desde cero
- Ejecuta seeds si los tienes
- Solo para desarrollo

---

## 📋 Mejores Prácticas

### ✅ **DO (Hacer)**

1. **Siempre modifica `schema.prisma` primero**
   ```prisma
   // ✅ CORRECTO
   // 1. Editar schema.prisma
   // 2. npm run prisma:migrate
   ```

2. **Usa nombres descriptivos para migraciones**
   ```bash
   # ✅ BUENOS NOMBRES
   create_product_table
   add_email_verification_to_user
   add_index_to_user_email
   create_order_and_order_items
   
   # ❌ MALOS NOMBRES
   migration1
   update
   changes
   ```

3. **Revisa el SQL generado antes de aplicar**
   ```bash
   # Crear migración sin aplicar
   npx prisma migrate dev --create-only
   
   # Revisar prisma/migrations/.../migration.sql
   # Luego aplicar
   npx prisma migrate deploy
   ```

4. **Haz commits frecuentes**
   ```bash
   git add prisma/schema.prisma
   git add prisma/migrations/
   git commit -m "feat(db): add product table"
   ```

5. **Usa `migrate deploy` en producción**
   ```bash
   # ✅ Producción
   npx prisma migrate deploy
   
   # ❌ NO usar en producción
   npx prisma migrate dev
   ```

---

### ❌ **DON'T (No Hacer)**

1. **NO edites manualmente los archivos SQL de migraciones**
   ```bash
   # ❌ MALO
   # Editar prisma/migrations/.../migration.sql manualmente
   
   # ✅ BUENO
   # Modificar schema.prisma y crear nueva migración
   ```

2. **NO uses `db push` en producción**
   ```bash
   # ❌ Producción
   npx prisma db push
   
   # ✅ Solo desarrollo/prototipado
   ```

3. **NO borres migraciones aplicadas**
   ```bash
   # ❌ MALO
   # Borrar prisma/migrations/... después de aplicar
   
   # ✅ BUENO
   # Mantener historial completo de migraciones
   ```

4. **NO mezcles `migrate dev` y `db push`**
   ```bash
   # ❌ MALO
   # Usar db push en desarrollo y migrate dev después
   
   # ✅ BUENO
   # Usar siempre migrate dev (o solo db push para prototipado)
   ```

---

## 🏗️ Estructura de Migraciones

```
prisma/
├── schema.prisma                    # Schema actual
└── migrations/
    ├── 20241113175049_init/         # Migración inicial
    │   └── migration.sql
    ├── 20241114120000_add_auth_fields/  # Nueva migración
    │   └── migration.sql
    └── migration_lock.toml           # Lock file (no editar)
```

**Cada migración contiene:**
- `migration.sql`: SQL generado por Prisma
- Nombre con timestamp: `YYYYMMDDHHMMSS_nombre_descriptivo`

---

## 🔄 Flujo Completo de Ejemplo

### Escenario: Agregar tabla de Comentarios

#### 1. Modificar `schema.prisma`
```prisma
model Comment {
  id        Int      @id @default(autoincrement())
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relaciones
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  postId    Int
  post      Post     @relation(fields: [postId], references: [id])
  
  @@index([userId])
  @@index([postId])
}
```

#### 2. Actualizar modelos relacionados
```prisma
model User {
  // ... campos existentes
  comments Comment[]  // Agregar relación
}

model Post {
  // ... campos existentes
  comments Comment[]  // Agregar relación
}
```

#### 3. Crear migración
```bash
npm run prisma:migrate
# Nombre: create_comment_table
```

#### 4. Verificar
```bash
# Ver estado
npx prisma migrate status

# Ver en Prisma Studio
npm run prisma:studio
```

---

## 🚨 Resolución de Problemas

### Error: "Migration failed to apply"

**Causa común:** Cambios incompatibles con datos existentes

**Solución:**
```bash
# 1. Ver el error específico
npx prisma migrate status

# 2. Si es necesario, hacer migración manual
npx prisma migrate dev --create-only
# Editar el SQL generado
npx prisma migrate deploy
```

### Error: "Database schema is not in sync"

**Solución:**
```bash
# Resetear y aplicar todas las migraciones
npx prisma migrate reset

# O sincronizar manualmente
npx prisma db push
```

### Error: "Migration X is already applied"

**Solución:**
```bash
# Marcar migración como aplicada sin ejecutarla
npx prisma migrate resolve --applied <migration_name>

# O marcar como resuelta si hubo error
npx prisma migrate resolve --rolled-back <migration_name>
```

---

## 📚 Comandos de Referencia Rápida

```bash
# Desarrollo
npm run prisma:migrate              # Crear y aplicar migración
npm run prisma:migrate:create       # Solo crear migración (sin aplicar)
npm run prisma:push                 # Sincronizar sin migraciones (solo dev)
npm run prisma:generate             # Regenerar Prisma Client
npm run prisma:studio               # Abrir Prisma Studio

# Producción
npx prisma migrate deploy           # Aplicar migraciones pendientes
npx prisma migrate status           # Ver estado de migraciones

# Utilidades
npx prisma migrate reset            # Resetear BD (solo dev)
npx prisma migrate resolve          # Resolver problemas de migración
```

---

## 💡 Tips Adicionales

1. **Usa seeds para datos iniciales**
   ```prisma
   // prisma/seed.ts
   import { PrismaClient } from '@prisma/client'
   const prisma = new PrismaClient()
   
   async function main() {
     // Datos iniciales
   }
   ```

2. **Revisa el SQL antes de aplicar en producción**
   ```bash
   npx prisma migrate dev --create-only
   # Revisar SQL
   npx prisma migrate deploy
   ```

3. **Mantén el schema.prisma limpio y bien comentado**
   ```prisma
   // ✅ BUENO
   model User {
     // ID único del usuario
     id Int @id @default(autoincrement())
   }
   ```

4. **Usa migraciones para cambios de esquema, no para datos**
   - Migraciones: cambios de estructura (tablas, columnas, índices)
   - Seeds/Scripts: datos iniciales o de prueba

---

## 🎓 Resumen

**Flujo estándar:**
1. Modificar `schema.prisma`
2. `npm run prisma:migrate` (con nombre descriptivo)
3. Verificar cambios
4. Commit de cambios

**Para producción:**
- Usa `npx prisma migrate deploy`
- Nunca uses `db push`
- Revisa SQL antes de aplicar

**Para desarrollo rápido:**
- `db push` está bien para prototipado
- Luego crea migraciones formales

¿Necesitas ayuda con alguna migración específica?

