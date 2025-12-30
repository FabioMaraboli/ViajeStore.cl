/**
 * ================================================================
 * GOOGLE MAPS REVIEWS API - Vercel Serverless Function
 * ================================================================
 * Endpoint: GET /api/google-reviews
 * 
 * Esta función serverless actúa como proxy seguro para la Google Places API.
 * Las API keys NUNCA se exponen en el frontend.
 */

// Configuración
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const PLACE_ID = process.env.GOOGLE_PLACE_ID;
const CACHE_DURATION = 6 * 60 * 60; // 6 horas en segundos

// Cache simple en memoria (para Vercel, considera usar Vercel KV en producción)
let cachedData = null;
let cacheTimestamp = null;

export default async function handler(req, res) {
    // Solo permitir GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verificar si hay datos en cache válidos
        const now = Date.now();
        if (cachedData && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION * 1000) {
            console.log('✅ Serving from cache');
            return res.status(200).json({
                success: true,
                data: cachedData,
                cached: true,
                cacheExpiry: new Date(cache Timestamp + CACHE_DURATION * 1000).toISOString()
            });
        }

        // Verificar que las variables de entorno existan
        if (!GOOGLE_API_KEY || !PLACE_ID) {
            console.error('❌ Missing environment variables');
            return res.status(500).json({
                success: false,
                error: 'Server configuration error. Please contact administrator.'
            });
        }

        // Llamar a Google Places API
        console.log('📡 Fetching from Google Places API...');
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=rating,user_ratings_total,reviews&key=${GOOGLE_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK') {
            console.error('❌ Google API error:', data.status);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch reviews from Google'
            });
        }

        // Parsear y formatear datos
        const result = data.result;
        const formattedData = {
            rating: result.rating || 0,
            totalReviews: result.user_ratings_total || 0,
            reviews: (result.reviews || []).map(review => ({
                author: review.author_name,
                rating: review.rating,
                text: review.text,
                date: formatRelativeTime(review.time),
                profilePhoto: review.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author_name)}&background=FF6B35&color=fff&size=128`
            }))
        };

        // Guardar en cache
        cachedData = formattedData;
        cacheTimestamp = now;

        // Retornar respuesta
        return res.status(200).json({
            success: true,
            data: formattedData,
            cached: false
        });

    } catch (error) {
        console.error('❌ Error in google-reviews function:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

// Utilidad: Formatear timestamp a texto relativo
function formatRelativeTime(unixTimestamp) {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - unixTimestamp;

    const days = Math.floor(diff / 86400);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    if (weeks === 1) return 'Hace 1 semana';
    if (weeks < 4) return `Hace ${weeks} semanas`;
    if (months === 1) return 'Hace 1 mes';
    return `Hace ${months} meses`;
}
