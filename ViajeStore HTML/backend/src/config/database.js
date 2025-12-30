/**
 * ================================================================
 * VIAJESTORE - CONFIGURACIÓN DE BASE DE DATOS
 * ================================================================
 * Conexión a PostgreSQL usando pg
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuración de conexión
const config = {
    // Opción 1: Connection string (Supabase/Neon/Railway)
    connectionString: process.env.DATABASE_URL,
    
    // Opción 2: Configuración individual
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'viajestore',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    
    // Configuración de pool
    max: 20, // Máximo de conexiones simultáneas
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    
    // SSL para producción (Supabase lo requiere)
    ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false }
        : false
};

// Crear pool de conexiones
const pool = new Pool(config);

// Event handlers
pool.on('connect', () => {
    console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Error inesperado en pool de base de datos:', err);
    process.exit(-1);
});

/**
 * Ejecutar query con manejo de errores
 * @param {string} text - Query SQL
 * @param {Array} params - Parámetros para prepared statement
 * @returns {Promise<Object>}
 */
export async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('📊 Query ejecutado', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('❌ Error en query:', error);
        throw error;
    }
}

/**
 * Obtener cliente del pool para transacciones
 * @returns {Promise<PoolClient>}
 */
export async function getClient() {
    const client = await pool.getClient();
    const query = client.query;
    const release = client.release;
    
    // Wrapper para logging
    client.query = (...args) => {
        client.lastQuery = args;
        return query.apply(client, args);
    };
    
    client.release = () => {
        client.query = query;
        client.release = release;
        return release.apply(client);
    };
    
    return client;
}

/**
 * Verificar conexión a base de datos
 * @returns {Promise<boolean>}
 */
export async function testConnection() {
    try {
        const result = await query('SELECT NOW() as current_time');
        console.log('✅ Base de datos respondiendo:', result.rows[0].current_time);
        return true;
    } catch (error) {
        console.error('❌ No se pudo conectar a la base de datos:', error.message);
        return false;
    }
}

/**
 * Cerrar pool de conexiones (para shutdown graceful)
 */
export async function closePool() {
    await pool.end();
    console.log('🔒 Pool de conexiones cerrado');
}

export default { query, getClient, testConnection, closePool };
