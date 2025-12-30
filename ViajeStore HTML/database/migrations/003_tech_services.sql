-- ================================================================
-- VIAJESTORE - SCHEMA COMPLETO EMPRESARIAL
-- ================================================================
-- Módulo 3: TECH SERVICES - Servicios Tecnológicos

-- ========== TABLA: services ==========
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    descripcion_larga TEXT,
    
    -- Categoría
    categoria VARCHAR(50) NOT NULL,
    -- 'web_development' | 'seo' | 'social_media' | 'security'
    
    -- Pricing
    tipo_precio VARCHAR(30) NOT NULL,
    -- 'one_time' | 'monthly' | 'custom_quote'
    
    precio_desde INTEGER,
    precio_base INTEGER,
    
    -- Duración estimada
    duracion_estimada_dias INTEGER,
    
    -- Paquetes
    tiene_paquetes BOOLEAN DEFAULT FALSE,
    
    -- Media
    imagen_url TEXT,
    icono VARCHAR(50),
    
    activo BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_services_categoria ON services(categoria);
CREATE INDEX idx_services_activo ON services(activo);

-- ========== TABLA: service_packages ==========
CREATE TABLE IF NOT EXISTS service_packages (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    
    nombre VARCHAR(100) NOT NULL, -- 'Básico', 'Pro', 'Enterprise'
    descripcion TEXT,
    
    precio INTEGER NOT NULL,
    incluye JSONB,
    
    duracion_dias INTEGER,
    
    activo BOOLEAN DEFAULT TRUE,
    orden INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_packages_service ON service_packages(service_id);

-- ========== TABLA: projects ==========
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    project_number VARCHAR(20) UNIQUE NOT NULL,
    
    user_id INTEGER REFERENCES users(id),
    service_id INTEGER REFERENCES services(id),
    service_package_id INTEGER REFERENCES service_packages(id),
    
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    
    -- Estados
    estado VARCHAR(30) NOT NULL DEFAULT 'cotizando',
    -- 'cotizando' → 'presupuesto_enviado' → 'deposito_recibido' →
    -- 'en_desarrollo' → 'en_revision' → 'entregado' | 'cancelado'
    
    -- Presupuesto
    presupuesto_monto INTEGER,
    presupuesto_aprobado BOOLEAN DEFAULT FALSE,
    presupuesto_enviado_at TIMESTAMP,
    presupuesto_aprobado_at TIMESTAMP,
    
    -- Depósito previo
    requiere_deposito BOOLEAN DEFAULT TRUE,
    deposito_porcentaje INTEGER DEFAULT 50,
    deposito_monto INTEGER,
    deposito_pagado BOOLEAN DEFAULT FALSE,
    deposito_pagado_at TIMESTAMP,
    
    -- Fechas
    fecha_inicio_estimada DATE,
    fecha_entrega_estimada DATE,
    fecha_entrega_real DATE,
    
    -- Asignación
    assigned_to INTEGER REFERENCES users(id),
    
    -- Archivos
    carpeta_proyecto VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_estado ON projects(estado);
CREATE INDEX idx_projects_number ON projects(project_number);
CREATE INDEX idx_projects_assigned ON projects(assigned_to);

-- ========== TABLA: project_milestones ==========
CREATE TABLE IF NOT EXISTS project_milestones (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    
    orden INTEGER NOT NULL,
    
    fecha_estimada DATE,
    fecha_completada DATE,
    
    completado BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_milestones_project ON project_milestones(project_id);

-- ========== TABLA: project_files ==========
CREATE TABLE IF NOT EXISTS project_files (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_archivo VARCHAR(50), -- 'mockup' | 'documento' | 'entregable' | 'foto'
    
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    uploaded_by INTEGER REFERENCES users(id),
    
    descripcion TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_project_files_project ON project_files(project_id);

-- ========== TABLA: appointments ==========
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    appointment_number VARCHAR(20) UNIQUE,
    
    user_id INTEGER REFERENCES users(id),
    project_id INTEGER REFERENCES projects(id),
    service_id INTEGER REFERENCES services(id),
    
    -- Tipo
    tipo VARCHAR(30) NOT NULL, -- 'presencial' | 'domicilio'
    
    -- Fecha y hora
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME,
    duracion_minutos INTEGER DEFAULT 60,
    
    -- Lugar
    direccion TEXT,
    sala_reuniones VARCHAR(100),
    
    -- Estado
    estado VARCHAR(30) DEFAULT 'pendiente',
    -- 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'reprogramada'
    
    -- Recordatorios
    recordatorio_enviado BOOLEAN DEFAULT FALSE,
    recordatorio_enviado_at TIMESTAMP,
    
    -- Notas
    notas_cliente TEXT,
    notas_internas TEXT,
    
    -- Reprogramación
    reprogramada_desde INTEGER REFERENCES appointments(id),
    reprogramada_a INTEGER REFERENCES appointments(id),
    motivo_reprogramacion TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_appointments_user ON appointments(user_id);
CREATE INDEX idx_appointments_fecha ON appointments(fecha, hora_inicio);
CREATE INDEX idx_appointments_estado ON appointments(estado);

-- ========== TABLA: appointment_availability ==========
CREATE TABLE IF NOT EXISTS appointment_availability (
    id SERIAL PRIMARY KEY,
    
    tipo VARCHAR(20) NOT NULL, -- 'specific_date' | 'recurring_weekly'
    
    fecha DATE,
    dia_semana INTEGER, -- 1-7
    
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    
    disponible BOOLEAN DEFAULT FALSE,
    
    razon TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_availability_fecha ON appointment_availability(fecha);
CREATE INDEX idx_availability_dia ON appointment_availability(dia_semana);

-- Comentarios
COMMENT ON TABLE services IS 'Catálogo de servicios tecnológicos (20+ servicios)';
COMMENT ON TABLE projects IS 'Proyectos de servicios tech con gestión completa';
COMMENT ON TABLE appointments IS 'Sistema de agendamiento con recordatorios automáticos';
COMMENT ON COLUMN projects.deposito_porcentaje IS 'Porcentaje de depósito requerido (default 50%)';
COMMENT ON COLUMN appointments.tipo IS 'presencial (oficina) o domicilio (cliente)';
