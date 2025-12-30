-- ================================================================
-- VIAJESTORE - DATOS INICIALES (SEED)
-- ================================================================
-- Inserta productos del catálogo actual en la base de datos

-- Limpiar datos existentes (solo para desarrollo)
-- TRUNCATE products, toppings RESTART IDENTITY CASCADE;

-- ========== PRODUCTOS: PAPAS ==========
INSERT INTO products (nombre, descripcion, precio, tamaño, tipo, stock, imagen_url) VALUES
('Papas Pequeñas', 'Porción individual perfecta para un snack', 3500, 'pequeño', 'papas', 50, 'https://images.unsplash.com/photo-1573080496987-a221b069695d?w=400&q=80'),
('Papas Medianas', 'Porción ideal para compartir', 5500, 'mediano', 'papas', 75, 'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=500&q=80'),
('Papas Grandes', 'Porción familiar abundante', 7500, 'grande', 'papas', 60, 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&q=80');

-- ========== PRODUCTOS: CHOCLO ==========
INSERT INTO products (nombre, descripcion, precio, tamaño, tipo, stock, imagen_url) VALUES
('Choclo Pequeño', 'Choclo fresco con mantequilla', 2500, 'pequeño', 'choclo', 40, 'https://images.unsplash.com/photo-1551462147-37590e00e3d4?w=400&q=80'),
('Choclo Mediano', 'Choclo desgranado con queso', 3500, 'mediano', 'choclo', 45, 'https://images.unsplash.com/photo-1583176293818-9cbb51a8ab0e?w=500&q=80'),
('Choclo Grande', 'Porción abundante de choclo', 4500, 'grande', 'choclo', 35, 'https://images.unsplash.com/photo-1627662168223-7df99068099a?w=600&q=80');

-- ========== COMBOS ==========
INSERT INTO products (nombre, descripcion, precio, tamaño, tipo, stock, imagen_url) VALUES
('Combo Solo Papas', 'Papas Medianas + Bebida', 6500, 'mediano', 'combos', 30, 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=500&q=80'),
('Combo Pareja Papas', '2 Papas Medianas + 2 Bebidas', 9500, 'grande', 'combos', 25, 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&q=80'),
('Combo Solo Choclo', 'Choclo Mediano + Bebida', 4500, 'mediano', 'combos', 20, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&q=80'),
('Combo Mixto Pequeño', '1 Papas Pequeñas + 1 Choclo Pequeño + 1 Bebida', 6000, 'pequeño', 'combos', 28, 'https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=500&q=80'),
('Combo Mixto', '1 Papas Medianas + 1 Choclo Mediano + 2 Bebidas', 10500, 'grande', 'combos', 22, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80'),
('Combo Familiar', '2 Papas Grandes + 2 Choclos Grandes + 4 Bebidas', 18000, 'familiar', 'combos', 15, 'https://images.unsplash.com/photo-1544025162-d76690b67f61?w=600&q=80');

-- ========== TOPPINGS (Ingredientes Extra) ==========
INSERT INTO toppings (nombre, precio, stock) VALUES
('Queso Cheddar', 500, 9999),
('Queso Mozzarella', 500, 9999),
('Salsa Mayo', 300, 9999),
('Salsa BBQ', 300, 9999),
('Pollo Desmenuzado', 800, 150),
('Bacon', 800, 120),
('Carne Molida', 800, 100),
('Cebolla Caramelizada', 200, 9999),
('Cilantro', 200, 9999),
('Jalapeño', 200, 9999),
('Sal de Mar', 100, 9999),
('Merkén', 100, 9999);

-- ========== USUARIO ADMINISTRADOR INICIAL ==========
-- Password: admin123 (hasheado con bcrypt)
-- IMPORTANTE: Cambiar password en producción
INSERT INTO users (email, nombre, telefono, password_hash, role) VALUES
('admin@viajestore.cl', 'Administrador', '+56912345678', '$2a$10$rQZ9vXxYxYxYxYxYxYxYxO', 'admin');

-- Comentario: En producción, generar hash real con:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('tu_password_seguro', 10);

-- ========== VERIFICACIÓN ==========
-- Mostrar resumen de datos insertados
SELECT 
    tipo,
    COUNT(*) as total_productos,
    SUM(stock) as stock_total
FROM products 
GROUP BY tipo 
ORDER BY tipo;

SELECT COUNT(*) as total_toppings FROM toppings;
SELECT COUNT(*) as total_usuarios FROM users;
