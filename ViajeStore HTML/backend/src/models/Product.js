/**
 * ================================================================
 * MODELO: PRODUCT
 * ================================================================
 * Maneja todas las operaciones relacionadas con productos
 */

import { query } from '../config/database.js';

export class Product {
    /**
     * Obtener todos los productos activos
     * @param {Object} filters - Filtros opcionales {tipo, activo}
     * @returns {Promise<Array>}
     */
    static async findAll(filters = {}) {
        let sql = 'SELECT * FROM products WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        // Filtrar por tipo si se especifica
        if (filters.tipo) {
            sql += ` AND tipo = $${paramIndex}`;
            params.push(filters.tipo);
            paramIndex++;
        }

        // Filtrar por estado activo (por defecto solo activos)
        const activo = filters.activo !== undefined ? filters.activo : true;
        sql += ` AND activo = $${paramIndex}`;
        params.push(activo);

        sql += ' ORDER BY tipo, precio ASC';

        const result = await query(sql, params);
        return result.rows;
    }

    /**
     * Obtener producto por ID
     * @param {number} id - ID del producto
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        const sql = 'SELECT * FROM products WHERE id = $1';
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Verificar stock disponible
     * @param {number} id - ID del producto
     * @returns {Promise<number>} Stock disponible
     */
    static async getStock(id) {
        const sql = 'SELECT stock FROM products WHERE id = $1';
        const result = await query(sql, [id]);
        return result.rows[0]?.stock || 0;
    }

    /**
     * Crear nuevo producto
     * @param {Object} data - Datos del producto
     * @returns {Promise<Object>}
     */
    static async create(data) {
        const sql = `
            INSERT INTO products (nombre, descripcion, precio, tamaño, tipo, stock, imagen_url, activo)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const params = [
            data.nombre,
            data.descripcion || null,
            data.precio,
            data.tamaño || null,
            data.tipo,
            data.stock || 0,
            data.imagen_url || null,
            data.activo !== undefined ? data.activo : true
        ];

        const result = await query(sql, params);
        return result.rows[0];
    }

    /**
     * Actualizar producto
     * @param {number} id - ID del producto
     * @param {Object} data - Datos a actualizar
     * @returns {Promise<Object|null>}
     */
    static async update(id, data) {
        const fields = [];
        const params = [];
        let paramIndex = 1;

        // Construir query dinámica solo con campos presentes
        if (data.nombre !== undefined) {
            fields.push(`nombre = $${paramIndex}`);
            params.push(data.nombre);
            paramIndex++;
        }
        if (data.descripcion !== undefined) {
            fields.push(`descripcion = $${paramIndex}`);
            params.push(data.descripcion);
            paramIndex++;
        }
        if (data.precio !== undefined) {
            fields.push(`precio = $${paramIndex}`);
            params.push(data.precio);
            paramIndex++;
        }
        if (data.tamaño !== undefined) {
            fields.push(`tamaño = $${paramIndex}`);
            params.push(data.tamaño);
            paramIndex++;
        }
        if (data.tipo !== undefined) {
            fields.push(`tipo = $${paramIndex}`);
            params.push(data.tipo);
            paramIndex++;
        }
        if (data.stock !== undefined) {
            fields.push(`stock = $${paramIndex}`);
            params.push(data.stock);
            paramIndex++;
        }
        if (data.imagen_url !== undefined) {
            fields.push(`imagen_url = $${paramIndex}`);
            params.push(data.imagen_url);
            paramIndex++;
        }
        if (data.activo !== undefined) {
            fields.push(`activo = $${paramIndex}`);
            params.push(data.activo);
            paramIndex++;
        }

        if (fields.length === 0) {
            return null; // No hay nada que actualizar
        }

        params.push(id); // ID al final
        const sql = `
            UPDATE products 
            SET ${fields.join(', ')} 
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await query(sql, params);
        return result.rows[0] || null;
    }

    /**
     * Reducir stock (al realizar venta)
     * @param {number} id - ID del producto
     * @param {number} cantidad - Cantidad a reducir
     * @returns {Promise<boolean>}
     */
    static async reduceStock(id, cantidad) {
        // Verificar stock suficiente primero
        const currentStock = await this.getStock(id);
        if (currentStock < cantidad) {
            throw new Error(`Stock insuficiente. Disponible: ${currentStock}, Requerido: ${cantidad}`);
        }

        const sql = `
            UPDATE products 
            SET stock = stock - $1 
            WHERE id = $2 AND stock >= $1
            RETURNING stock
        `;

        const result = await query(sql, [cantidad, id]);
        return result.rowCount > 0;
    }

    /**
     * Aumentar stock (al recibir inventario)
     * @param {number} id - ID del producto
     * @param {number} cantidad - Cantidad a añadir
     * @returns {Promise<boolean>}
     */
    static async increaseStock(id, cantidad) {
        const sql = `
            UPDATE products 
            SET stock = stock + $1 
            WHERE id = $2
            RETURNING stock
        `;

        const result = await query(sql, [cantidad, id]);
        return result.rowCount > 0;
    }

    /**
     * Eliminar producto (soft delete - marca como inactivo)
     * @param {number} id - ID del producto
     * @returns {Promise<boolean>}
     */
    static async delete(id) {
        const sql = 'UPDATE products SET activo = false WHERE id = $1';
        const result = await query(sql, [id]);
        return result.rowCount > 0;
    }

    /**
     * Obtener productos con stock bajo
     * @param {number} threshold - Umbral de stock bajo (default: 10)
     * @returns {Promise<Array>}
     */
    static async getLowStock(threshold = 10) {
        const sql = `
            SELECT * FROM products 
            WHERE stock < $1 AND stock > 0 AND activo = true
            ORDER BY stock ASC
        `;
        const result = await query(sql, [threshold]);
        return result.rows;
    }
}

export default Product;
