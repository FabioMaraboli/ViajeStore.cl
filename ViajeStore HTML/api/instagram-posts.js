/**
 * ================================================================
 * INSTAGRAM POSTS API - Vercel Serverless Function
 * ================================================================
 * Endpoint: GET /api/instagram-posts
 * 
 * Esta función serverless actúa como proxy seguro para Instagram Graph API.
 * El Access Token NUNCA se expone en el frontend.
 */

// Configuración
const INSTAGRAM_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID;
const CACHE_DURATION = 12 * 60 * 60; // 12 horas en segundos

// Cache simple en memoria
let cachedData = null;
let cacheTimestamp = null;

export default async function handler(req, res) {
    // Solo permitir GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verificar cache
        const now = Date.now();
        if (cachedData && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION * 1000) {
            console.log('✅ Serving Instagram from cache');
            return res.status(200).json({
                success: true,
                data: cachedData,
                cached: true,
                cacheExpiry: new Date(cacheTimestamp + CACHE_DURATION * 1000).toISOString()
            });
        }

        // Verificar variables de entorno
        if (!INSTAGRAM_TOKEN || !INSTAGRAM_ACCOUNT_ID) {
            console.error('❌ Missing Instagram environment variables');
            return res.status(500).json({
                success: false,
                error: 'Server configuration error. Please contact administrator.'
            });
        }

        // Llamar a Instagram Graph API
        console.log('📡 Fetching from Instagram Graph API...');

        // Endpoint para obtener posts
        const postsUrl = `https://graph.instagram.com/${INSTAGRAM_ACCOUNT_ID}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=5&access_token=${INSTAGRAM_TOKEN}`;

        // Endpoint para información de la cuenta
        const accountUrl = `https://graph.instagram.com/${INSTAGRAM_ACCOUNT_ID}?fields=username,followers_count,media_count&access_token=${INSTAGRAM_TOKEN}`;

        // Llamadas paralelas
        const [postsResponse, accountResponse] = await Promise.all([
            fetch(postsUrl),
            fetch(accountUrl)
        ]);

        const postsData = await postsResponse.json();
        const accountData = await accountResponse.json();

        // Verificar errores
        if (postsData.error || accountData.error) {
            console.error('❌ Instagram API error:', postsData.error || accountData.error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch Instagram data'
            });
        }

        // Formatear datos
        const formattedData = {
            account: {
                username: accountData.username || 'viajestore.cl',
                followers: accountData.followers_count || 0,
                mediaCount: accountData.media_count || 0
            },
            posts: (postsData.data || [])
                .filter(post => post.media_type === 'IMAGE' || post.media_type === 'CAROUSEL_ALBUM')
                .map(post => ({
                    id: post.id,
                    image: post.media_url,
                    caption: post.caption || '',
                    likes: post.like_count || 0,
                    comments: post.comments_count || 0,
                    timestamp: post.timestamp,
                    permalink: post.permalink
                }))
        };

        // Guardar en cache
        cachedData = formattedData;
        cacheTimestamp = now;

        // Retornar
        return res.status(200).json({
            success: true,
            data: formattedData,
            cached: false
        });

    } catch (error) {
        console.error('❌ Error in instagram-posts function:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
