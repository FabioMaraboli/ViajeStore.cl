-- ================================================================
-- VIAJESTORE - SCHEMA COMPLETO EMPRESARIAL
-- ================================================================
-- PostgreSQL 14+
-- Módulo 1: CORE - Usuarios y CRM
-- Ejecutar en orden

-- ========== EXTENSIONES ==========
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========== TABLA: users ==========
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    
    -- Identificación
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255), -- NULL si es invitado
    
    -- Tipo de usuario
    user_type VARCHAR(20) NOT NULL DEFAULT 'customer', 
    -- 'customer' | 'business' | 'admin' | 'delivery' | 'tech'
    
    role VARCHAR(20) NOT NULL DEFAULT 'guest',
    -- 'guest' | 'registered' | 'vip' | 'admin'
    
    -- Datos personales
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    birthdate DATE, -- Para promociones de cumpleaños
    
    -- Preferencias
    dietary_preferences JSONB, 
    -- {"vegan": true, "lactose_free": true, "gluten_free": false}
    
    -- Estado
    status VARCHAR(20) DEFAULT 'active',
    -- 'active' | 'inactive' | 'blocked'
    
    -- Tags para segmentación
    tags TEXT[], -- ['vip', 'frequent', 'new', 'inactive_30d']
    
    -- Programa fidelización
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier VARCHAR(20) DEFAULT 'bronze',
    -- 'bronze' | 'silver' | 'gold' | 'platinum'
    
    -- Metadata
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_tags ON users USING GIN(tags);

-- ========== TABLA: business_profiles ==========
CREATE TABLE IF NOT EXISTS business_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    company_name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50) NOT NULL, -- RUT
    industry VARCHAR(100),
    company_size VARCHAR(20), -- 'small' | 'medium' | 'large'
    
    billing_email VARCHAR(255),
    billing_address TEXT,
    
    payment_terms INTEGER DEFAULT 0, -- Días de crédito
    credit_limit INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== TABLA: addresses ==========
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    label VARCHAR(50), -- 'Casa', 'Oficina'
    street_address TEXT NOT NULL,
    comuna VARCHAR(100) NOT NULL,
    city VARCHAR(100) DEFAULT 'Santiago',
    region VARCHAR(100) DEFAULT 'Metropolitana',
    postal_code VARCHAR(20),
    
    coordinates POINT, -- Para cálculo de distancia
    
    is_default BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_addresses_comuna ON addresses(comuna);

-- ========== TABLA: payment_methods ==========
CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    type VARCHAR(20) NOT NULL, -- 'card' | 'mercadopago' | 'transfer'
    
    -- Tarjetas (tokenizadas)
    card_last_four VARCHAR(4),
    card_brand VARCHAR(20),
    card_token VARCHAR(255),
    
    -- MercadoPago
    mp_customer_id VARCHAR(255),
    
    is_default BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Comentarios
COMMENT ON TABLE users IS 'Usuarios del sistema: clientes, empresas, admins, repartidores, técnicos';
COMMENT ON TABLE business_profiles IS 'Perfiles B2B con datos de facturación';
COMMENT ON TABLE addresses IS 'Múltiples direcciones por usuario para delivery';
COMMENT ON TABLE payment_methods IS 'Métodos de pago guardados (tokenizados)';

COMMENT ON COLUMN users.loyalty_points IS 'Puntos acumulados del programa de fidelización';
COMMENT ON COLUMN users.tags IS 'Array de tags para segmentación de marketing';
COMMENT ON COLUMN addresses.coordinates IS 'Coordenadas geográficas (lat, long) para cálculo de delivery';
