-- ================================================================
-- VIAJESTORE - SCHEMA COMPLETO EMPRESARIAL
-- ================================================================
-- Módulo 2: DELIVERY - Comida a Domicilio

-- ========== TABLA: products ==========
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    
    sku VARCHAR(50) UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    
    -- Categorización
    categoria VARCHAR(50) NOT NULL, -- 'papas' | 'choclo' | 'combos'
    subcategoria VARCHAR(50),
    
    -- Pricing
    precio_base INTEGER NOT NULL,
    precio_venta INTEGER NOT NULL,
    
    tamaño VARCHAR(50),
    
    -- Inventario
    stock_actual INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER DEFAULT 10,
    stock_maximo INTEGER DEFAULT 1000,
    
    -- Flags
    requiere_preparacion BOOLEAN DEFAULT TRUE,
    permite_personalizacion BOOLEAN DEFAULT TRUE,
    es_combo BOOLEAN DEFAULT FALSE,
    
    -- Media
    imagen_url TEXT,
    imagen_urls JSONB,
    slug VARCHAR(255) UNIQUE,
    
    -- Metadata
    activo BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    orden_display INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_categoria ON products(categoria);
CREATE INDEX idx_products_activo ON products(activo);
CREATE INDEX idx_products_stock ON products(stock_actual);
CREATE INDEX idx_products_sku ON products(sku);

-- ========== TABLA: toppings ==========
CREATE TABLE IF NOT EXISTS toppings (
    id SERIAL PRIMARY KEY,
    
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    
    precio INTEGER NOT NULL,
    
    -- Inventario
    stock_actual INTEGER DEFAULT 9999,
    stock_minimo INTEGER DEFAULT 50,
    
    -- Restricciones
    max_cantidad_por_producto INTEGER DEFAULT 3,
    
    categoria VARCHAR(50), -- 'quesos' | 'salsas' | 'proteinas'
    
    imagen_url TEXT,
    activo BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== TABLA: product_toppings ==========
CREATE TABLE IF NOT EXISTS product_toppings (
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    topping_id INTEGER REFERENCES toppings(id) ON DELETE CASCADE,
    
    recomendado BOOLEAN DEFAULT FALSE,
    
    PRIMARY KEY (product_id, topping_id)
);

-- ========== TABLA: discounts ==========
CREATE TABLE IF NOT EXISTS discounts (
    id SERIAL PRIMARY KEY,
    
    codigo VARCHAR(50) UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    
    tipo VARCHAR(20) NOT NULL, 
    -- 'percentage' | 'fixed_amount' | 'free_shipping'
    
    valor INTEGER NOT NULL,
    
    -- Restricciones
    minimo_compra INTEGER DEFAULT 0,
    maximo_descuento INTEGER,
    
    usos_maximos INTEGER,
    usos_maximos_por_usuario INTEGER DEFAULT 1,
    usos_actuales INTEGER DEFAULT 0,
    
    -- Productos aplicables
    aplica_a VARCHAR(20) DEFAULT 'all',
    product_ids INTEGER[],
    categorias TEXT[],
    
    -- Horarios (promociones por hora)
    horario_inicio TIME,
    horario_fin TIME,
    dias_semana INTEGER[], -- [1,2,3,4,5] = Lun-Vie
    
    -- Vigencia
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    
    activo BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_discounts_codigo ON discounts(codigo);
CREATE INDEX idx_discounts_vigencia ON discounts(fecha_inicio, fecha_fin);
CREATE INDEX idx_discounts_activo ON discounts(activo) WHERE activo = TRUE;

-- ========== TABLA: orders ==========
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Estados del pedido
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    -- 'pendiente' → 'confirmado' → 'preparando' → 'en_camino' → 'entregado' | 'cancelado'
    
    -- Delivery
    delivery_address_id INTEGER REFERENCES addresses(id),
    delivery_address_text TEXT NOT NULL,
    delivery_comuna VARCHAR(100) NOT NULL,
    delivery_phone VARCHAR(20) NOT NULL,
    delivery_notes TEXT,
    
    assigned_to_driver INTEGER REFERENCES users(id),
    
    -- Timing
    estimated_delivery_time TIMESTAMP,
    confirmed_at TIMESTAMP,
    prepared_at TIMESTAMP,
    out_for_delivery_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    -- Montos
    subtotal INTEGER NOT NULL,
    descuento INTEGER DEFAULT 0,
    costo_envio INTEGER DEFAULT 2000,
    total INTEGER NOT NULL,
    
    -- Descuento aplicado
    discount_id INTEGER REFERENCES discounts(id),
    discount_code VARCHAR(50),
    
    -- Pago
    metodo_pago VARCHAR(30) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_transaction_id VARCHAR(255),
    paid_at TIMESTAMP,
    
    -- Metadata
    notas_cliente TEXT,
    notas_internas TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_estado ON orders(estado);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_driver ON orders(assigned_to_driver);

-- ========== TABLA: order_items ==========
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    
    -- Snapshot del producto
    product_nombre VARCHAR(255) NOT NULL,
    product_precio INTEGER NOT NULL,
    
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    
    -- Toppings seleccionados
    toppings JSONB,
    
    subtotal INTEGER NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ========== TABLA: stock_movements ==========
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    
    product_id INTEGER REFERENCES products(id),
    topping_id INTEGER REFERENCES toppings(id),
    
    tipo VARCHAR(30) NOT NULL,
    -- 'compra' | 'venta' | 'ajuste' | 'merma' | 'devolucion'
    
    cantidad INTEGER NOT NULL,
    stock_anterior INTEGER NOT NULL,
    stock_nuevo INTEGER NOT NULL,
    
    referencia_tipo VARCHAR(30),
    referencia_id INTEGER,
    
    notas TEXT,
    realizado_por INTEGER REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_movements_product ON stock_movements(product_id);
CREATE INDEX idx_movements_topping ON stock_movements(topping_id);
CREATE INDEX idx_movements_created ON stock_movements(created_at DESC);

-- Comentarios
COMMENT ON TABLE products IS 'Catálogo de productos: papas, choclos, combos (100+ productos)';
COMMENT ON TABLE orders IS 'Órdenes de delivery (estimado: 300/semana)';
COMMENT ON TABLE stock_movements IS 'Auditoría completa de todos los movimientos de inventario';
COMMENT ON COLUMN orders.estado IS 'Flujo: pendiente → confirmado → preparando → en_camino → entregado';
COMMENT ON COLUMN discounts.horario_inicio IS 'Permite promociones por horario (happy hour, almuerzo, cena)';
