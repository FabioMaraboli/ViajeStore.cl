/**
 * ================================================================
 * CONTROLADOR: PRODUCTS
 * ================================================================
 * Maneja las peticiones HTTP relacionadas con productos
 */

import Product from '../models/Product.js';

export class ProductsController {
    /**
     * GET /api/products
     * Listar todos los productos
     */
    static async index(req, res, next) {
        try {
            const { tipo, activo } = req.query;

            const filters = {};
            if (tipo) filters.tipo = tipo;
            if (activo !== undefined) filters.activo = activo === 'true';

            const products = await Product.findAll(filters);

            res.json({
                success: true,
                count: products.length,
                data: products
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/products/:id
     * Obtener un producto específico
     */
    static async show(req, res, next) {
        try {
            const { id } = req.params;
            const product = await Product.findById(id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: 'Producto no encontrado'
                });
            }

            res.json({
                success: true,
                data: product
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/products/:id/stock
     * Consultar stock disponible
     */
    static async getStock(req, res, next) {
        try {
            const { id } = req.params;
            const stock = await Product.getStock(id);

            res.json({
                success: true,
                product_id: parseInt(id),
                stock,
                available: stock > 0
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/products
     * Crear nuevo producto (Admin only)
     */
    static async create(req, res, next) {
        try {
            const { nombre, descripcion, precio, tamaño, tipo, stock, imagen_url } = req.body;

            // Validación básica
            if (!nombre || !precio || !tipo) {
                return res.status(400).json({
                    success: false,
                    error: 'Faltan campos requeridos: nombre, precio, tipo'
                });
            }

            const product = await Product.create({
                nombre,
                descripcion,
                precio,
                tamaño,
                tipo,
                stock: stock || 0,
                imagen_url
            });

            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: product
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/products/:id
     * Actualizar producto (Admin only)
     */
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const updates = req.body;

            const product = await Product.update(id, updates);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: 'Producto no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Producto actualizado exitosamente',
                data: product
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/products/:id
     * Eliminar producto (Admin only - soft delete)
     */
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await Product.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Producto no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Producto eliminado exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/products/alerts/low-stock
     * Obtener productos con stock bajo (Admin only)
     */
    static async lowStock(req, res, next) {
        try {
            const threshold = parseInt(req.query.threshold) || 10;
            const products = await Product.getLowStock(threshold);

            res.json({
                success: true,
                threshold,
                count: products.length,
                data: products
            });
        } catch (error) {
            next(error);
        }
    }
}

export default ProductsController;
