# 🚀 ViajeStore Backend - Guía de Inicio Rápido

Backend API para ViajeStore con PostgreSQL, Express, y gestión de inventario.

## 📋 Pre-requisitos

- **Node.js** 18+ instalado
- **PostgreSQL** 14+ instalado localmente O cuenta en Supabase (gratis)
- **Git** (opcional)

---

## 🔧 Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar base de datos

#### Opción A: PostgreSQL Local

```bash
# Crear base de datos
psql -U postgres
CREATE DATABASE viajestore;
\q
```

#### Opción B: Supabase (Recomendado - Gratis)

1. Ir a [supabase.com](https://supabase.com)
2. Crear proyecto nuevo
3. Copiar "Connection string" desde Settings > Database

### 3. Configurar variables de entorno

```bash
# Copiar template
cp .env.example .env

# Editar .env y completar:
# - DATABASE_URL (si usas Supabase)
# - O DB_HOST, DB_USER, DB_PASSWORD (si usas PostgreSQL local)
```

### 4. Crear tablas (Migración)

```bash
# Conectar a tu base de datos y ejecutar:
psql -U postgres -d viajestore < ../database/schema.sql

# O si usas Supabase:
# 1. Ir al SQL Editor en Supabase dashboard
# 2. Copiar contenido de database/schema.sql
# 3. Ejecutar
```

### 5. Cargar datos iniciales (Seed)

```bash
psql -U postgres -d viajestore < ../database/seed.sql

# O en Supabase SQL Editor, ejecutar database/seed.sql
```

---

## ▶️ Ejecutar Servidor

### Desarrollo (con auto-reload)

```bash
npm run dev
```

### Producción

```bash
npm start
```

El servidor estará corriendo en: **http://localhost:3001**

---

## 🧪 Probar API

### Health Check

```bash
curl http://localhost:3001/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "database": "connected",
  "uptime": 1.234
}
```

### Listar Productos

```bash
curl http://localhost:3001/api/products
```

```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "id": 1,
      "nombre": "Papas Pequeñas",
      "precio": 3500,
      "stock": 50,
      ...
    }
  ]
}
```

### Ver Stock de un Producto

```bash
curl http://localhost:3001/api/products/1/stock
```

```json
{
  "success": true,
  "product_id": 1,
  "stock": 50,
  "available": true
}
```

---

## 📚 Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check del servidor |
| GET | `/api/products` | Listar todos los productos |
| GET | `/api/products/:id` | Ver detalle de producto |
| GET | `/api/products/:id/stock` | Consultar stock |
| POST | `/api/products` | Crear producto (admin) |
| PUT | `/api/products/:id` | Actualizar producto (admin) |
| DELETE | `/api/products/:id` | Eliminar producto (admin) |

---

## 🔐 Seguridad

- Las rutas POST/PUT/DELETE requieren autenticación (próximamente)
- CORS configurado para dominios permitidos
- Prepared statements para prevenir SQL injection
- Helmet.js para headers HTTP seguros

---

## 🐛 Troubleshooting

### Error: "No se pudo conectar a la base de datos"

- Verifica que PostgreSQL esté corriendo: `pg_isready`
- Verifica credenciales en `.env`
- Si usas Supabase, verifica que el connection string esté correcto

### Error: "MODULE_NOT_FOUND"

```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
```

### El servidor no inicia

```bash
# Verificar puerto disponible
lsof -i :3001

# O cambiar puerto en .env:
PORT=3002
```

---

## 📖 Próximos Pasos

1. ✅ Backend funcionando con productos
2. ⏳ Conectar frontend a API (reemplazar datos hardcodeados)
3. ⏳ Implementar Orders API
4. ⏳ Reducción automática de stock al comprar
5. ⏳ Panel de administración

---

**¿Problemas?** Revisa los logs del servidor. Todos los errores se muestran en consola con detalles.
