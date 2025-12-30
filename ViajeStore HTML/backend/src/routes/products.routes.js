/**
 * ================================================================
 * RUTAS: PRODUCTS
 * ================================================================
 * Define los endpoints relacionados con productos
 */

import express from 'express';
import ProductsController from '../controllers/ProductsController.js';

const router = express.Router();

// ========== RUTAS PÚBLICAS ==========

/**
 * @route   GET /api/products
 * @desc    Listar todos los productos
 * @query   tipo - Filtrar por tipo (papas|choclo|combos)
 * @query   activo - Filtrar por estado (true|false)
 * @access  Public
 */
router.get('/', ProductsController.index);

/**
 * @route   GET /api/products/:id
 * @desc    Obtener detalle de un producto
 * @access  Public
 */
router.get('/:id', ProductsController.show);

/**
 * @route   GET /api/products/:id/stock
 * @desc    Consultar stock disponible de un producto
 * @access  Public
 */
router.get('/:id/stock', ProductsController.getStock);

// ========== RUTAS ADMIN (TODO: Agregar middleware de autenticación) ==========

/**
 * @route   POST /api/products
 * @desc    Crear nuevo producto
 * @access  Admin
 */
router.post('/', ProductsController.create);

/**
 * @route   PUT /api/products/:id
 * @desc    Actualizar producto existente
 * @access  Admin
 */
router.put('/:id', ProductsController.update);

/**
 * @route   DELETE /api/products/:id
 * @desc    Eliminar producto (soft delete)
 * @access  Admin
 */
router.delete('/:id', ProductsController.delete);

/**
 * @route   GET /api/products/alerts/low-stock
 * @desc    Obtener productos con stock bajo
 * @access  Admin
 */
router.get('/alerts/low-stock', ProductsController.lowStock);

export default router;
