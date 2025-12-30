-- ================================================================
-- VIAJESTORE - SCHEMA COMPLETO EMPRESARIAL
-- ================================================================
-- Módulos 4-7: 3D Printing, Marketing, Community, Loyalty

-- ========== MÓDULO 4: 3D PRINTING ==========

CREATE TABLE IF NOT EXISTS printing_materials (
    id SERIAL PRIMARY KEY,
    
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    
    precio_por_gramo NUMERIC(10,2) NOT NULL,
    precio_por_ml NUMERIC(10,2),
    
    colores_disponibles JSONB,
    
    stock_gramos INTEGER DEFAULT 0,
    
    activo BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS printing_models (
    id SERIAL PRIMARY KEY,
    
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    
    categoria VARCHAR(50),
    
    archivo_stl_path VARCHAR(500) NOT NULL,
    preview_image_url TEXT,
    
    peso_estimado_gramos INTEGER,
    tiempo_impresion_minutos INTEGER,
    
    precio_base INTEGER,
    
    activo BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS printing_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    
    user_id INTEGER REFERENCES users(id),
    
    model_id INTEGER REFERENCES printing_models(id),
    custom_stl_path VARCHAR(500),
    
    material_id INTEGER REFERENCES printing_materials(id),
    color VARCHAR(50),
    color_precio_extra INTEGER DEFAULT 0,
    
    cantidad INTEGER DEFAULT 1,
    
    -- Post-procesamiento
    requiere_lijado BOOLEAN DEFAULT FALSE,
    requiere_pintura BOOLEAN DEFAULT FALSE,
    requiere_ensamblaje BOOLEAN DEFAULT FALSE,
    post_processing_costo INTEGER DEFAULT 0,
    
    -- Cotización
    peso_gramos INTEGER,
    tiempo_impresion_minutos INTEGER,
    costo_material INTEGER,
    costo_tiempo INTEGER,
    costo_total INTEGER,
    
    -- Presupuesto y depósito
    presupuesto_enviado BOOLEAN DEFAULT FALSE,
    presupuesto_aprobado BOOLEAN DEFAULT FALSE,
    presupuesto_aprobado_at TIMESTAMP,
    
    deposito_monto INTEGER,
    deposito_pagado BOOLEAN DEFAULT FALSE,
    deposito_pagado_at TIMESTAMP,
    
    -- Estados
    estado VARCHAR(30) DEFAULT 'cotizando',
    
    -- Preview antes de imprimir
    preview_image_path VARCHAR(500),
    preview_aprobado BOOLEAN DEFAULT FALSE,
    preview_aprobado_at TIMESTAMP,
    
    -- Foto final
    foto_final_path VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_printing_orders_user ON printing_orders(user_id);
CREATE INDEX idx_printing_orders_estado ON printing_orders(estado);

-- ========== MÓDULO 5: MARKETING ==========

CREATE TABLE IF NOT EXISTS email_campaigns (
    id SERIAL PRIMARY KEY,
    
    nombre VARCHAR(255) NOT NULL,
    asunto VARCHAR(255) NOT NULL,
    
    contenido_html TEXT NOT NULL,
    contenido_texto TEXT,
    
    -- Segmentación
    segmento VARCHAR(50) DEFAULT 'all',
    filtros JSONB,
    
    -- A/B Testing
    tiene_variante_b BOOLEAN DEFAULT FALSE,
    variante_b_asunto VARCHAR(255),
    variante_b_contenido TEXT,
    porcentaje_variante_a INTEGER DEFAULT 50,
    
    -- Programación
    programada_para TIMESTAMP,
    enviada_at TIMESTAMP,
    
    estado VARCHAR(30) DEFAULT 'draft',
    
    -- Estadísticas
    total_destinatarios INTEGER DEFAULT 0,
    emails_enviados INTEGER DEFAULT 0,
    emails_abiertos INTEGER DEFAULT 0,
    links_clickeados INTEGER DEFAULT 0,
    emails_rebotados INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_logs (
    id SERIAL PRIMARY KEY,
    
    campaign_id INTEGER REFERENCES email_campaigns(id),
    user_id INTEGER REFERENCES users(id),
    
    email_to VARCHAR(255) NOT NULL,
    variante VARCHAR(10),
    
    estado VARCHAR(30) NOT NULL,
    
    enviado_at TIMESTAMP,
    abierto_at TIMESTAMP,
    clickeado_at TIMESTAMP,
    
    error_mensaje TEXT,
    provider_message_id VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_logs_campaign ON email_logs(campaign_id);
CREATE INDEX idx_email_logs_user ON email_logs(user_id);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id SERIAL PRIMARY KEY,
    
    user_id INTEGER REFERENCES users(id),
    phone VARCHAR(20) NOT NULL,
    
    tipo VARCHAR(30) NOT NULL,
    
    referencia_tipo VARCHAR(30),
    referencia_id INTEGER,
    
    mensaje TEXT NOT NULL,
    
    estado VARCHAR(30) DEFAULT 'queued',
    
    enviado_at TIMESTAMP,
    entregado_at TIMESTAMP,
    leido_at TIMESTAMP,
    
    error_mensaje TEXT,
    provider_message_id VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_user ON whatsapp_messages(user_id);
CREATE INDEX idx_whatsapp_estado ON whatsapp_messages(estado);

CREATE TABLE IF NOT EXISTS birthday_promotions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    
    codigo VARCHAR(20) UNIQUE NOT NULL,
    
    descuento_porcentaje INTEGER DEFAULT 20,
    maximo_descuento INTEGER DEFAULT 10000,
    
    fecha_generacion DATE NOT NULL,
    fecha_expiracion TIMESTAMP NOT NULL, -- 24 horas
    
    usado BOOLEAN DEFAULT FALSE,
    usado_en_order INTEGER REFERENCES orders(id),
    usado_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_birthday_promo_codigo ON birthday_promotions(codigo);
CREATE INDEX idx_birthday_promo_user ON birthday_promotions(user_id);

-- ========== MÓDULO 6: COMMUNITY ==========

CREATE TABLE IF NOT EXISTS community_groups (
    id SERIAL PRIMARY KEY,
    
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    
    tipo VARCHAR(30) DEFAULT 'public',
    tema_preferido VARCHAR(100),
    
    creado_por INTEGER REFERENCES users(id),
    
    autoregulado BOOLEAN DEFAULT TRUE,
    moderadores INTEGER[],
    
    miembros_count INTEGER DEFAULT 0,
    
    activo BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
    group_id INTEGER REFERENCES community_groups(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    rol VARCHAR(20) DEFAULT 'member',
    
    joined_at TIMESTAMP DEFAULT NOW(),
    
    PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS votaciones (
    id SERIAL PRIMARY KEY,
    
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    
    tipo VARCHAR(30) NOT NULL,
    
    opciones JSONB NOT NULL,
    
    multiple_choice BOOLEAN DEFAULT FALSE,
    
    fecha_inicio TIMESTAMP DEFAULT NOW(),
    fecha_fin TIMESTAMP NOT NULL,
    
    anonima BOOLEAN DEFAULT TRUE,
    
    votos_totales INTEGER DEFAULT 0,
    
    activa BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS votos (
    id SERIAL PRIMARY KEY,
    votacion_id INTEGER REFERENCES votaciones(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    
    opciones_seleccionadas INTEGER[],
    ranking INTEGER[],
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(votacion_id, user_id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    
    user_id INTEGER REFERENCES users(id),
    
    reviewable_type VARCHAR(30) NOT NULL,
    reviewable_id INTEGER NOT NULL,
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    
    titulo VARCHAR(255),
    comentario TEXT,
    
    -- Moderación
    estado VARCHAR(30) DEFAULT 'pending',
    moderado_por INTEGER REFERENCES users(id),
    moderado_at TIMESTAMP,
    
    -- Respuesta admin
    respuesta_admin TEXT,
    respondido_por INTEGER REFERENCES users(id),
    respondido_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_reviewable ON reviews(reviewable_type, reviewable_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_estado ON reviews(estado);

-- ========== MÓDULO 7: LOYALTY ==========

CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    
    tipo VARCHAR(30) NOT NULL,
    
    puntos INTEGER NOT NULL,
    
    referencia_tipo VARCHAR(30),
    referencia_id INTEGER,
    
    saldo_anterior INTEGER,
    saldo_nuevo INTEGER,
    
    descripcion TEXT,
    
    expira_en DATE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_loyalty_user ON loyalty_transactions(user_id);

CREATE TABLE IF NOT EXISTS loyalty_rewards (
    id SERIAL PRIMARY KEY,
    
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    
    puntos_requeridos INTEGER NOT NULL,
    
    tipo VARCHAR(30) NOT NULL,
    
    valor INTEGER,
    
    stock_disponible INTEGER,
    
    activo BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Comentarios
COMMENT ON TABLE printing_orders IS 'Órdenes de impresión 3D con cotización y aprobación';
COMMENT ON TABLE email_campaigns IS 'Campañas de email marketing con A/B testing';
COMMENT ON TABLE whatsapp_messages IS 'Mensajes WhatsApp: confirmaciones, recordatorios, promociones';
COMMENT ON TABLE birthday_promotions IS 'Códigos únicos de cumpleaños válidos 24 horas';
COMMENT ON TABLE votaciones IS 'Votaciones anónimas de sabores, horarios, ranking de productos';
COMMENT ON TABLE loyalty_transactions IS 'Historial completo del programa de fidelización';
