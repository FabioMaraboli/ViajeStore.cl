/**
 * ================================================================
 * VIAJESTORE - SERVIDOR EXPRESS
 * ================================================================
 * Punto de entrada de la aplicación backend
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import productsRoutes from './routes/products.routes.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ========== MIDDLEWARES GLOBALES ==========

// Seguridad: Headers HTTP seguros
app.use(helmet());

// CORS: Permitir peticiones desde frontend
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging de requests (simple)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ========== RUTAS ==========

// Health check
app.get('/health', async (req, res) => {
    const dbOk = await testConnection();
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: dbOk ? 'connected' : 'disconnected',
        uptime: process.uptime()
    });
});

// API Routes
app.get('/api', (req, res) => {
    res.json({
        message: 'ViajeStore API v1.0',
        endpoints: {
            products: '/api/products',
            orders: '/api/orders',
            inventory: '/api/inventory',
            auth: '/api/auth'
        }
    });
});

// Products API
app.use('/api/products', productsRoutes);

// ========== MANEJADOR DE ERRORES ==========

// 404 - Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.path
    });
});

// Error handler global
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ========== INICIO DEL SERVIDOR ==========

async function startServer() {
    try {
        // Verificar conexión a base de datos
        console.log('🔍 Verificando conexión a base de datos...');
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.error('⚠️ No se pudo conectar a la base de datos.');
            console.error('💡 Asegúrate de que PostgreSQL esté corriendo y las credenciales en .env sean correctas.');
            process.exit(1);
        }

        // Iniciar servidor HTTP
        app.listen(PORT, () => {
            console.log('═══════════════════════════════════════');
            console.log(`🚀 ViajeStore Backend corriendo`);
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(`💾 Base de datos: Conectada`);
            console.log('═══════════════════════════════════════');
        });

    } catch (error) {
        console.error('❌ Error al iniciar servidor:', error);
        process.exit(1);
    }
}

// Manejo de shutdown graceful
process.on('SIGTERM', () => {
    console.log('📴 SIGTERM recibido, cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});

// Iniciar
startServer();

export default app;
