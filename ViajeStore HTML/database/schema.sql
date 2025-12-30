-- ================================================================
-- VIAJESTORE - SCHEMA DE BASE DE DATOS
-- ================================================================
-- PostgreSQL 14+
-- Ejecutar en orden para crear todas las tablas

-- Tabla: Productos
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio INTEGER NOT NULL CHECK (precio >= 0),
    tamaño VARCHAR(50),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('papas', 'choclo', 'combos', 'bebida', 'postre', 'topping')),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    imagen_url TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_products_tipo ON products(tipo);
CREATE INDEX idx_products_activo ON products(activo);

-- Tabla: Toppings (ingredientes extra)
CREATE TABLE IF NOT EXISTS toppings (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio INTEGER NOT NULL CHECK (precio >= 0),
    stock INTEGER DEFAULT 9999, -- Ilimitado por defecto
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: Usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    comuna VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- Tabla: Órdenes
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    total INTEGER NOT NULL CHECK (total >= 0),
    subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
    envio INTEGER DEFAULT 2000,
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'preparando', 'enviado', 'entregado', 'cancelado')),
    direccion_envio TEXT NOT NULL,
    comuna VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    notas TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_estado ON orders(estado);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Tabla: Detalle de Órdenes
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario INTEGER NOT NULL CHECK (precio_unitario >= 0),
    toppings JSONB, -- [{id: 1, nombre: "Queso", precio: 500, qty: 2}]
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Tabla: Movimientos de Stock (Auditoría)
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL, -- Positivo = entrada, Negativo = salida
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('compra', 'venta', 'ajuste', 'merma', 'devolucion')),
    referencia_id INTEGER, -- ID de orden si es venta
    notas TEXT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at DESC);

-- Función: Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentarios en tablas
COMMENT ON TABLE products IS 'Catálogo de productos disponibles para venta';
COMMENT ON TABLE orders IS 'Registro de todas las órdenes de compra';
COMMENT ON TABLE order_items IS 'Detalle de productos en cada orden';
COMMENT ON TABLE stock_movements IS 'Auditoría de todos los movimientos de inventario';

COMMENT ON COLUMN products.stock IS 'Cantidad disponible en inventario. Al llegar a 0, no se puede vender';
COMMENT ON COLUMN orders.estado IS 'Estado actual de la orden: pendiente → preparando → enviado → entregado';
COMMENT ON COLUMN stock_movements.cantidad IS 'Cantidad movida. Negativo = salida (venta), Positivo = entrada (compra/ajuste)';
