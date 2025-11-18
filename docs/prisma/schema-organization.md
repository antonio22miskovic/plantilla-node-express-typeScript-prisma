# 📁 Organización del Schema de Prisma

## ❓ Pregunta Frecuente

> **¿Debo poner todas las tablas en `schema.prisma`?**
> 
> **Respuesta:** SÍ, Prisma solo lee `schema.prisma`. PERO puedes organizarlo de forma muy limpia.

---

## ✅ Solución Recomendada: Organización por Secciones

Aunque todo debe estar en un archivo, puedes organizarlo perfectamente con comentarios y secciones lógicas.

### Estructura Recomendada:

```prisma
// ============================================
// CONFIGURACIÓN
// ============================================
generator client { ... }
datasource db { ... }

// ============================================
// MÓDULO: AUTENTICACIÓN Y USUARIOS
// ============================================

model User { ... }
model Profile { ... }
model RefreshToken { ... }  // Si lo separas en tabla

// ============================================
// MÓDULO: CONTENIDO/BLOG
// ============================================

model Post { ... }
model Comment { ... }
model Category { ... }
model Tag { ... }

// ============================================
// MÓDULO: E-COMMERCE
// ============================================

model Product { ... }
model Order { ... }
model OrderItem { ... }
model Cart { ... }

// ============================================
// MÓDULO: NOTIFICACIONES
// ============================================

model Notification { ... }
model EmailLog { ... }
```

---

## 🎯 Mejores Prácticas de Organización

### 1. **Agrupar por Dominio/Módulo**

```prisma
// ============================================
// AUTHENTICATION MODULE
// ============================================
// Usuarios, autenticación, permisos

model User { ... }
model Role { ... }
model Permission { ... }

// ============================================
// CONTENT MODULE  
// ============================================
// Posts, comentarios, categorías

model Post { ... }
model Comment { ... }
model Category { ... }

// ============================================
// ECOMMERCE MODULE
// ============================================
// Productos, órdenes, carritos

model Product { ... }
model Order { ... }
model OrderItem { ... }
```

### 2. **Ordenar por Dependencias**

```prisma
// Primero las tablas base (sin dependencias)
model User { ... }
model Category { ... }

// Luego las que dependen de las anteriores
model Post {
  authorId Int
  author   User @relation(...)
  
  categoryId Int
  category   Category @relation(...)
}
```

### 3. **Usar Comentarios Descriptivos**

```prisma
// ============================================
// USER MANAGEMENT
// ============================================
// Sistema de gestión de usuarios con autenticación
// y perfiles extendidos

model User {
  // Identificación
  id    Int    @id @default(autoincrement())
  email String @unique
  
  // Autenticación
  password String
  // ... más campos
}
```

### 4. **Mantener Relaciones Cerca**

```prisma
// ============================================
// USER & PROFILE (Relación 1:1)
// ============================================

model User {
  id      Int      @id @default(autoincrement())
  profile Profile?
}

model Profile {
  id     Int  @id @default(autoincrement())
  userId Int  @unique
  user   User @relation(fields: [userId], references: [id])
}
```

---

## 🔧 Alternativa: Múltiples Archivos (Avanzado)

Si realmente necesitas separar en múltiples archivos, hay herramientas que pueden ayudar:

### Opción 1: Usar `prisma-import` (Experimental)

```bash
npm install -D prisma-import
```

**Estructura:**
```
prisma/
├── schema.prisma          # Archivo principal
├── schemas/
│   ├── auth.prisma        # Modelos de autenticación
│   ├── content.prisma     # Modelos de contenido
│   └── ecommerce.prisma  # Modelos de ecommerce
```

**schema.prisma:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// Importar otros schemas
import "./schemas/auth.prisma"
import "./schemas/content.prisma"
import "./schemas/ecommerce.prisma"
```

**⚠️ NOTA:** Esta funcionalidad aún está en desarrollo y puede no funcionar perfectamente.

### Opción 2: Script de Combinación (Custom)

Crear un script que combine múltiples archivos antes de ejecutar Prisma:

**combine-schemas.js:**
```javascript
import fs from 'fs';
import path from 'path';

const schemasDir = './prisma/schemas';
const outputFile = './prisma/schema.prisma';

const baseSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

`;

const schemaFiles = fs.readdirSync(schemasDir)
  .filter(file => file.endsWith('.prisma'))
  .sort();

let combinedSchema = baseSchema + '\n';

schemaFiles.forEach(file => {
  const content = fs.readFileSync(
    path.join(schemasDir, file),
    'utf-8'
  );
  combinedSchema += `// ============================================\n`;
  combinedSchema += `// ${file.replace('.prisma', '').toUpperCase()}\n`;
  combinedSchema += `// ============================================\n\n`;
  combinedSchema += content + '\n\n';
});

fs.writeFileSync(outputFile, combinedSchema);
console.log('Schema combined successfully!');
```

**package.json:**
```json
{
  "scripts": {
    "prisma:combine": "node combine-schemas.js",
    "prisma:migrate": "npm run prisma:combine && prisma migrate dev"
  }
}
```

---

## 💡 Recomendación Final

**Para la mayoría de proyectos:**
- ✅ Mantén todo en `schema.prisma`
- ✅ Organiza con comentarios y secciones
- ✅ Agrupa por módulo/dominio
- ✅ Mantén relaciones cerca

**Solo considera múltiples archivos si:**
- Tienes 50+ modelos
- Trabajas en equipo grande
- Necesitas separación estricta por módulos

---

## 📝 Ejemplo de Schema Bien Organizado

```prisma
// ============================================
// CONFIGURACIÓN
// ============================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ============================================
// MÓDULO: AUTENTICACIÓN
// ============================================
// Gestión de usuarios, autenticación y permisos

model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  password String
  role    String   @default("user")
  
  profile Profile?
  posts   Post[]
}

model Profile {
  id     Int  @id @default(autoincrement())
  userId Int  @unique
  user   User @relation(fields: [userId], references: [id])
  bio    String?
}

// ============================================
// MÓDULO: CONTENIDO
// ============================================
// Posts, comentarios y categorías

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  
  comments Comment[]
  tags     Tag[]
}

model Comment {
  id      Int    @id @default(autoincrement())
  content String
  postId  Int
  post    Post   @relation(fields: [postId], references: [id])
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}

// ============================================
// MÓDULO: E-COMMERCE
// ============================================
// Productos, órdenes y carritos

model Product {
  id          Int      @id @default(autoincrement())
  name        String
  price       Decimal  @db.Decimal(10, 2)
  
  orderItems OrderItem[]
}

model Order {
  id         Int         @id @default(autoincrement())
  total      Decimal     @db.Decimal(10, 2)
  items      OrderItem[]
  createdAt  DateTime    @default(now())
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  quantity  Int
  productId Int
  product   Product @relation(fields: [productId], references: [id])
  orderId   Int
  order     Order   @relation(fields: [orderId], references: [id])
}
```

---

## 🎨 Tips de Formato

1. **Espacios entre secciones**
   ```prisma
   // ============================================
   // SECCIÓN
   // ============================================
   ```

2. **Comentarios descriptivos en modelos**
   ```prisma
   model User {
     // Identificación
     id Int @id @default(autoincrement())
     
     // Autenticación
     email String @unique
     password String
   }
   ```

3. **Agrupar campos relacionados**
   ```prisma
   model Post {
     // Identificación
     id Int @id @default(autoincrement())
     
     // Contenido
     title String
     content String?
     
     // Metadatos
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
     
     // Relaciones
     authorId Int
     author User @relation(...)
   }
   ```

---

## 📚 Conclusión

**Respuesta corta:** SÍ, todo debe estar en `schema.prisma`, pero puedes organizarlo muy bien con comentarios y secciones.

**Mejor práctica:** Organiza por módulos/dominios con comentarios claros. Es más simple y funciona perfectamente incluso con muchos modelos.

¿Quieres que reorganice tu `schema.prisma` actual siguiendo estas prácticas?

