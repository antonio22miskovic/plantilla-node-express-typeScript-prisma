# 🚀 Guía de Inicio Rápido - Plantilla Backend Express + TypeScript

Bienvenido a esta plantilla profesional de backend. Esta guía te ayudará a entender la arquitectura y comenzar a trabajar rápidamente.

## 📋 Tabla de Contenidos

1. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
2. [Configuración Inicial](#configuración-inicial)
3. [Crear tu Primera Feature](#crear-tu-primera-feature)
4. [Patrones y Convenciones](#patrones-y-convenciones)
5. [Recursos Adicionales](#recursos-adicionales)

---

## 🏗️ Arquitectura del Proyecto

Este proyecto utiliza **Layered Architecture (Arquitectura en Capas)**:

```
Routes → Controllers → Services → Repositories → Database
```

### Capas y Responsabilidades

| Capa | Responsabilidad | NO debe |
|------|----------------|---------|
| **Routes** | Definir endpoints HTTP | Contener lógica de negocio |
| **Controllers** | Manejar req/res, validar entrada básica | Acceder a BD directamente |
| **Services** | Lógica de negocio, validaciones complejas | Conocer detalles de HTTP |
| **Repositories** | Acceso a datos (queries Prisma) | Contener lógica de negocio |

Ver [architecture.md](./architecture.md) para más detalles.

---

## ⚙️ Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz:

```env
# Base de Datos
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/nombre_bd"

# JWT
JWT_SECRET=tu-clave-secreta-muy-segura-minimo-32-caracteres
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Servidor
PORT=3000
NODE_ENV=development
```

### 3. Crear Base de Datos y Aplicar Migraciones

```bash
# Crear migración inicial
npm run prisma:migrate
# Nombre sugerido: init

# O si prefieres sincronizar sin migraciones (solo desarrollo)
npm run prisma:push
```

### 4. Iniciar Servidor

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

---

## 🎯 Crear tu Primera Feature

Vamos a crear un ejemplo completo: **Productos**

### Paso 1: Definir el Modelo en Prisma

Edita `prisma/schema.prisma`:

```prisma
// ============================================
// MÓDULO: E-COMMERCE
// ============================================

model Product {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(255)
  description String?
  price       Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([name])
}
```

### Paso 2: Crear Migración

```bash
npm run prisma:migrate
# Nombre: create_product_table
```

### Paso 3: Crear Tipos/Modelos

Crea `src/models/Product.model.ts`:

```typescript
export interface CreateProductInput {
  name: string
  description?: string
  price: number
  stock?: number
}

export interface UpdateProductInput {
  name?: string
  description?: string
  price?: number
  stock?: number
}
```

### Paso 4: Crear Repository

Crea `src/repositories/Product.repository.ts`:

```typescript
import { db } from '../config/prisma'
import type { Product, Prisma } from '@prisma/client'
import type { CreateProductInput, UpdateProductInput } from '../models/Product.model'

export class ProductRepository {
  async findAll(): Promise<Product[]> {
    return db.product.findMany()
  }
  
  async findById(id: number): Promise<Product | null> {
    return db.product.findUnique({ where: { id } })
  }
  
  async create(data: CreateProductInput): Promise<Product> {
    return db.product.create({ data })
  }
  
  async update(id: number, data: UpdateProductInput): Promise<Product> {
    return db.product.update({ where: { id }, data })
  }
  
  async delete(id: number): Promise<Product> {
    return db.product.delete({ where: { id } })
  }
}
```

### Paso 5: Crear Service

Crea `src/services/Product.service.ts`:

```typescript
import { ProductRepository } from '../repositories/Product.repository'
import type { CreateProductInput, UpdateProductInput } from '../models/Product.model'
import { HTTP_STATUS } from '../constants'

export class ProductService {
  private productRepository: ProductRepository
  
  constructor() {
    this.productRepository = new ProductRepository()
  }
  
  async getAllProducts() {
    return this.productRepository.findAll()
  }
  
  async getProductById(id: number) {
    const product = await this.productRepository.findById(id)
    if (!product) {
      const error = new Error('Product not found') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.NOT_FOUND
      throw error
    }
    return product
  }
  
  async createProduct(data: CreateProductInput) {
    // Validaciones de negocio aquí
    if (data.price < 0) {
      const error = new Error('Price cannot be negative') as Error & { statusCode?: number }
      error.statusCode = HTTP_STATUS.BAD_REQUEST
      throw error
    }
    
    return this.productRepository.create(data)
  }
  
  async updateProduct(id: number, data: UpdateProductInput) {
    await this.getProductById(id) // Verifica que existe
    return this.productRepository.update(id, data)
  }
  
  async deleteProduct(id: number) {
    await this.getProductById(id) // Verifica que existe
    return this.productRepository.delete(id)
  }
}
```

### Paso 6: Crear Controller

Crea `src/controllers/Product.controller.ts`:

```typescript
import type { Request, Response } from 'express'
import { ProductService } from '../services/Product.service'
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants'
import type { ApiResponse } from '../types'

export class ProductController {
  private productService: ProductService
  
  constructor() {
    this.productService = new ProductService()
  }
  
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const products = await this.productService.getAllProducts()
      const response: ApiResponse<typeof products> = {
        message: HTTP_MESSAGES.SUCCESS,
        data: products,
      }
      res.status(HTTP_STATUS.OK).json(response)
    } catch (error) {
      this.handleError(error, res)
    }
  }
  
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id)
      if (isNaN(id) || id <= 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: 'Invalid product ID',
        })
        return
      }
      
      const product = await this.productService.getProductById(id)
      const response: ApiResponse<typeof product> = {
        message: HTTP_MESSAGES.SUCCESS,
        data: product,
      }
      res.status(HTTP_STATUS.OK).json(response)
    } catch (error) {
      this.handleError(error, res)
    }
  }
  
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, price, stock } = req.body
      const product = await this.productService.createProduct({
        name,
        description,
        price,
        stock,
      })
      const response: ApiResponse<typeof product> = {
        message: 'Product created successfully',
        data: product,
      }
      res.status(HTTP_STATUS.CREATED).json(response)
    } catch (error) {
      this.handleError(error, res)
    }
  }
  
  private handleError(error: unknown, res: Response): void {
    if (error instanceof Error) {
      const statusCode = (error as Error & { statusCode?: number }).statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR
      res.status(statusCode).json({
        message: HTTP_MESSAGES.INTERNAL_ERROR,
        error: error.message,
      })
      return
    }
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: HTTP_MESSAGES.INTERNAL_ERROR,
      error: 'An unknown error occurred',
    })
  }
}
```

### Paso 7: Crear Rutas

Crea `src/routes/products.ts`:

```typescript
import { Router } from 'express'
import { ProductController } from '../controllers/Product.controller'
// import { authenticate } from '../middleware/auth.middleware' // Descomenta si necesitas autenticación

const router = Router()
const productController = new ProductController()

// Rutas públicas
router.get('/', productController.getAll.bind(productController))
router.get('/:id', productController.getById.bind(productController))

// Rutas protegidas (descomenta cuando necesites autenticación)
// router.post('/', authenticate, productController.create.bind(productController))
// router.put('/:id', authenticate, productController.update.bind(productController))
// router.delete('/:id', authenticate, productController.delete.bind(productController))

// Temporalmente públicas para desarrollo
router.post('/', productController.create.bind(productController))
router.put('/:id', productController.update.bind(productController))
router.delete('/:id', productController.delete.bind(productController))

export default router
```

### Paso 8: Registrar Rutas en server.ts

Edita `src/server.ts`:

```typescript
import productRouter from './routes/products'

// ... otros imports

app.use('/api/v1/products', productRouter)
```

### ¡Listo! 🎉

Ahora puedes probar tu API:

```bash
# Obtener todos los productos
GET http://localhost:3000/api/v1/products

# Crear un producto
POST http://localhost:3000/api/v1/products
Content-Type: application/json

{
  "name": "Producto Ejemplo",
  "description": "Descripción del producto",
  "price": 99.99,
  "stock": 10
}
```

---

## 📐 Patrones y Convenciones

### Estructura de Archivos

```
Feature: Product
├── src/models/Product.model.ts          # Tipos y DTOs
├── src/repositories/Product.repository.ts  # Acceso a datos
├── src/services/Product.service.ts     # Lógica de negocio
├── src/controllers/Product.controller.ts  # Controladores HTTP
└── src/routes/products.ts              # Definición de rutas
```

### Nombres de Clases

- `ProductController` (PascalCase)
- `ProductService` (PascalCase)
- `ProductRepository` (PascalCase)

### Estructura de Respuestas

```typescript
{
  message: "Operation completed successfully",
  data: { ... },
  error?: "..."
}
```

---

## 🔐 Autenticación

### Rutas Protegidas

```typescript
import { authenticate } from '../middleware/auth.middleware'

router.post('/protected', authenticate, controller.create)
```

### Obtener Usuario Autenticado

```typescript
const userId = (req as AuthenticatedRequest).user?.id
const userEmail = (req as AuthenticatedRequest).user?.email
```

Ver [auth/api-examples.md](./auth/api-examples.md) para ejemplos completos.

---

## 🗄️ Base de Datos

### Crear Nueva Tabla

1. Agregar modelo en `prisma/schema.prisma`
2. `npm run prisma:migrate`
3. Nombre descriptivo: `create_product_table`

### Modificar Tabla Existente

1. Modificar modelo en `prisma/schema.prisma`
2. `npm run prisma:migrate`
3. Nombre descriptivo: `add_price_to_product`

Ver [prisma/migrations.md](./prisma/migrations.md) para más detalles.

---

## 📚 Recursos Adicionales

- **`.cursorrules`** - Guía para Cursor AI
- **[architecture.md](./architecture.md)** - Documentación completa de arquitectura
- **[prisma/migrations.md](./prisma/migrations.md)** - Guía de migraciones
- **[auth/api-examples.md](./auth/api-examples.md)** - Ejemplos de API de autenticación
- **`README.md`** - Información general del proyecto

---

## 🆘 ¿Necesitas Ayuda?

1. Revisa la documentación en los archivos `.md`
2. Consulta `.cursorrules` para entender los patrones
3. Revisa el código existente como referencia
4. Verifica los ejemplos en [auth/api-examples.md](./auth/api-examples.md)

---

**¡Feliz desarrollo! 🚀**

