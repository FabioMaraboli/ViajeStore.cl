-- ================================================================
-- VIAJESTORE - TRIGGERS Y FUNCIONES
-- ================================================================
-- Automatización de procesos de negocio

-- ========== FUNCIÓN: Auto-actualizar updated_at ==========
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_printing_orders_updated_at BEFORE UPDATE ON printing_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========== FUNCIÓN: Auto-generar números de orden ==========
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS project_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS appointment_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS printing_order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number = 'ORD-' || 
            TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
            LPAD(nextval('order_number_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

CREATE OR REPLACE FUNCTION generate_project_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.project_number IS NULL OR NEW.project_number = '' THEN
        NEW.project_number = 'PROJ-' || 
            TO_CHAR(NOW(), 'YYYY') || '-' ||
            LPAD(nextval('project_number_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_project_number BEFORE INSERT ON projects
    FOR EACH ROW EXECUTE FUNCTION generate_project_number();

CREATE OR REPLACE FUNCTION generate_appointment_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.appointment_number IS NULL OR NEW.appointment_number = '' THEN
        NEW.appointment_number = 'APT-' || 
            TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
            LPAD(nextval('appointment_number_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_appointment_number BEFORE INSERT ON appointments
    FOR EACH ROW EXECUTE FUNCTION generate_appointment_number();

-- ========== FUNCIÓN: Actualizar stock automáticamente ==========
CREATE OR REPLACE FUNCTION update_stock_on_order()
RETURNS TRIGGER AS $$
DECLARE
    v_stock_anterior INTEGER;
    v_stock_nuevo INTEGER;
BEGIN
    -- Obtener stock anterior
    SELECT stock_actual INTO v_stock_anterior
    FROM products
    WHERE id = NEW.product_id;
    
    -- Reducir stock del producto
    UPDATE products
    SET stock_actual = stock_actual - NEW.cantidad
    WHERE id = NEW.product_id;
    
    -- Obtener stock nuevo
    SELECT stock_actual INTO v_stock_nuevo
    FROM products
    WHERE id = NEW.product_id;
    
    -- Registrar movimiento de stock
    INSERT INTO stock_movements (
        product_id, 
        tipo, 
        cantidad, 
        stock_anterior,
        stock_nuevo,
        referencia_tipo, 
        referencia_id
    ) VALUES (
        NEW.product_id, 
        'venta', 
        -NEW.cantidad,
        v_stock_anterior,
        v_stock_nuevo,
        'order',
        NEW.order_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reduce_stock_on_order AFTER INSERT ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_stock_on_order();

-- ========== FUNCIÓN: Actualizar puntos de fidelización ==========
CREATE OR REPLACE FUNCTION update_loyalty_points_on_order()
RETURNS TRIGGER AS $$
DECLARE
    v_puntos_ganados INTEGER;
    v_saldo_anterior INTEGER;
BEGIN
    -- Solo si la orden está pagada
    IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
        -- Calcular puntos (1 punto por cada $1000 gastados)
        v_puntos_ganados = FLOOR(NEW.total / 1000);
        
        -- Obtener saldo anterior
        SELECT loyalty_points INTO v_saldo_anterior
        FROM users
        WHERE id = NEW.user_id;
        
        -- Actualizar puntos del usuario
        UPDATE users
        SET loyalty_points = loyalty_points + v_puntos_ganados
        WHERE id = NEW.user_id;
        
        -- Registrar transacción
        INSERT INTO loyalty_transactions (
            user_id,
            tipo,
            puntos,
            referencia_tipo,
            referencia_id,
            saldo_anterior,
            saldo_nuevo,
            descripcion
        ) VALUES (
            NEW.user_id,
            'earned_purchase',
            v_puntos_ganados,
            'order',
            NEW.id,
            v_saldo_anterior,
            v_saldo_anterior + v_puntos_ganados,
            'Puntos ganados por orden #' || NEW.order_number
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_loyalty_points AFTER UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_loyalty_points_on_order();

-- ========== FUNCIÓN: Generar código de cumpleaños automático ==========
CREATE OR REPLACE FUNCTION generate_birthday_promo()
RETURNS void AS $$
DECLARE
    v_user RECORD;
    v_codigo VARCHAR(20);
BEGIN
    -- Buscar usuarios que cumplen años hoy
    FOR v_user IN 
        SELECT id, first_name, email
        FROM users
        WHERE EXTRACT(MONTH FROM birthdate) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(DAY FROM birthdate) = EXTRACT(DAY FROM CURRENT_DATE)
        AND status = 'active'
    LOOP
        -- Generar código único
        v_codigo = 'BDAY-' || v_user.id || '-' || TO_CHAR(NOW(), 'YYYYMMDD');
        
        -- Crear promoción de cumpleaños
        INSERT INTO birthday_promotions (
            user_id,
            codigo,
            descuento_porcentaje,
            maximo_descuento,
            fecha_generacion,
            fecha_expiracion
        ) VALUES (
            v_user.id,
            v_codigo,
            20,
            10000,
            CURRENT_DATE,
            NOW() + INTERVAL '24 hours'
        )
        ON CONFLICT DO NOTHING;
        
        -- TODO: Enviar email/WhatsApp con el código
        -- (implementar en backend con cron job diario)
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ========== FUNCIÓN: Actualizar contador de miembros en grupos ==========
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_groups
        SET miembros_count = miembros_count + 1
        WHERE id = NEW.group_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_groups
        SET miembros_count = miembros_count - 1
        WHERE id = OLD.group_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_group_count_insert AFTER INSERT ON group_members
    FOR EACH ROW EXECUTE FUNCTION update_group_member_count();

CREATE TRIGGER update_group_count_delete AFTER DELETE ON group_members
    FOR EACH ROW EXECUTE FUNCTION update_group_member_count();

-- ========== FUNCIÓN: Actualizar votos totales ==========
CREATE OR REPLACE FUNCTION update_votacion_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE votaciones
        SET votos_totales = votos_totales + 1
        WHERE id = NEW.votacion_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_votos_count AFTER INSERT ON votos
    FOR EACH ROW EXECUTE FUNCTION update_votacion_count();

-- ========== VISTAS ÚTILES ==========

-- Vista: Stock bajo
CREATE OR REPLACE VIEW v_low_stock AS
SELECT 
    p.id,
    p.sku,
    p.nombre,
    p.categoria,
    p.stock_actual,
    p.stock_minimo,
    (p.stock_minimo - p.stock_actual) as deficit
FROM products p
WHERE p.stock_actual < p.stock_minimo
AND p.activo = TRUE
ORDER BY p.stock_actual ASC;

-- Vista: Órdenes activas
CREATE OR REPLACE VIEW v_active_orders AS
SELECT 
    o.id,
    o.order_number,
    o.estado,
    o.total,
    o.delivery_comuna,
    o.created_at,
    u.first_name || ' ' || COALESCE(u.last_name, '') as cliente,
    u.phone
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
WHERE o.estado NOT IN ('entregado', 'cancelado')
ORDER BY o.created_at DESC;

-- Vista: Proyectos activos
CREATE OR REPLACE VIEW v_active_projects AS
SELECT 
    p.id,
    p.project_number,
    p.nombre,
    p.estado,
    p.presupuesto_monto,
    p.deposito_pagado,
    s.nombre as servicio,
    u.first_name || ' ' || COALESCE(u.last_name, '') as cliente,
    tech.first_name || ' ' || COALESCE(tech.last_name, '') as tecnico
FROM projects p
LEFT JOIN services s ON p.service_id = s.id
LEFT JOIN users u ON p.user_id = u.id
LEFT JOIN users tech ON p.assigned_to = tech.id
WHERE p.estado NOT IN ('entregado', 'cancelado')
ORDER BY p.created_at DESC;

-- Comentarios
COMMENT ON FUNCTION generate_order_number() IS 'Auto-genera números únicos para órdenes en formato ORD-YYYYMMDD-NNN';
COMMENT ON FUNCTION update_stock_on_order() IS 'Reduce stock automáticamente al crear order_item y registra en stock_movements';
COMMENT ON FUNCTION update_loyalty_points_on_order() IS 'Asigna puntos de fidelización cuando una orden es pagada (1 punto por cada $1000)';
COMMENT ON FUNCTION generate_birthday_promo() IS 'Genera códigos de cumpleaños automáticamente (ejecutar con cron job diario)';
COMMENT ON VIEW v_low_stock IS 'Productos con stock por debajo del mínimo (alertas de inventario)';
