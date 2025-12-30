/* 
 * ================================================================
 * VIAJESTORE - REVIEWS JAVASCRIPT
 * ================================================================
 * Maneja la carga y visualización de reseñas de Google Maps e Instagram
 */

// ================== CONFIGURACIÓN ==================
const REVIEWS_CONFIG = {
    // Endpoints de las serverless functions (cambiar a producción después)
    endpoints: {
        google: '/api/google-reviews',
        instagram: '/api/instagram-posts'
    },
    // Cache en localStorage (opcional, para reducir llamadas)
    cacheEnabled: true,
    cacheDuration: 6 * 60 * 60 * 1000, // 6 horas en milisegundos
};

// ================== DATOS DE EJEMPLO (MOCK) ==================
// Estos datos se usan mientras no tengas las APIs configuradas
const MOCK_DATA = {
    google: {
        rating: 4.8,
        totalReviews: 347,
        reviews: [
            {
                author: "María González",
                rating: 5,
                text: "¡Excelentes papas fritas! El servicio es rápido y la calidad insuperable. Pedí el combo familiar y quedamos todos encantados. Totalmente recomendado.",
                date: "Hace 2 semanas",
                profilePhoto: "https://ui-avatars.com/api/?name=Maria+Gonzalez&background=FF6B35&color=fff&size=128"
            },
            {
                author: "Carlos Fernández",
                rating: 5,
                text: "La mejor opción para papas fritas personalizadas en Santiago. Los ingredientes extra son de calidad y el precio es justo. ¡Volveré pronto!",
                date: "Hace 1 mes",
                profilePhoto: "https://ui-avatars.com/api/?name=Carlos+Fernandez&background=00A896&color=fff&size=128"
            },
            {
                author: "Andrea López",
                rating: 4,
                text: "Muy buenas papas, me encantó poder personalizarlas. Solo sugiero agregar más opciones de salsas. El delivery fue puntual.",
                date: "Hace 3 semanas",
                profilePhoto: "https://ui-avatars.com/api/?name=Andrea+Lopez&background=FF6B35&color=fff&size=128"
            },
            {
                author: "Roberto Muñoz",
                rating: 5,
                text: "Sorprendentemente buenas! La opción de agregar queso cheddar y bacon hace toda la diferencia. Súper recomendadas.",
                date: "Hace 1 semana",
                profilePhoto: "https://ui-avatars.com/api/?name=Roberto+Munoz&background=00A896&color=fff&size=128"
            },
            {
                author: "Valentina Silva",
                rating: 5,
                text: "Perfectas para compartir en familia. Los choclos también están deliciosos. Excelente atención al cliente.",
                date: "Hace 2 días",
                profilePhoto: "https://ui-avatars.com/api/?name=Valentina+Silva&background=FF6B35&color=fff&size=128"
            },
            {
                author: "Diego Ramírez",
                rating: 4,
                text: "Buena relación calidad-precio. Las papas llegaron calientes y crocantes. Definitivamente volveré a pedir.",
                date: "Hace 4 días",
                profilePhoto: "https://ui-avatars.com/api/?name=Diego+Ramirez&background=00A896&color=fff&size=128"
            }
        ]
    },
    instagram: {
        account: {
            username: "viajestore.cl",
            followers: 12453
        },
        posts: [
            {
                id: "1",
                image: "https://images.unsplash.com/photo-1573821663912-6df460f9c684?w=600&q=80",
                caption: "🍟 Nuevo sabor: Papas con tocino y queso cheddar! Pruébalas hoy 🔥 #ViajeStore #PapasFritas",
                likes: 234,
                comments: 12,
                timestamp: "2025-01-18T15:30:00Z"
            },
            {
                id: "2",
                image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&q=80",
                caption: "¿Quién dijo que las papas fritas no pueden ser gourmet? 🌟 Personaliza las tuyas ahora",
                likes: 189,
                comments: 8,
                timestamp: "2025-01-15T12:00:00Z"
            },
            {
                id: "3",
                image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&q=80",
                caption: "Combo familiar perfecto para el fin de semana 👨‍👩‍👧‍👦 Pedidos por WhatsApp",
                likes: 302,
                comments: 15,
                timestamp: "2025-01-12T18:45:00Z"
            },
            {
                id: "4",
                image: "https://images.unsplash.com/photo-1627662168223-7df99068099a?w=600&q=80",
                caption: "Choclos frescos del día 🌽 ¡También puedes personalizarlos! #Delivery #Santiago",
                likes: 156,
                comments: 6,
                timestamp: "2025-01-10T14:20:00Z"
            },
            {
                id: "5",
                image: "https://images.unsplash.com/photo-1585238341710-401af4cbb62c?w=600&q=80",
                caption: "Gracias por sus 300+ pedidos este mes! 🙏 Ustedes hacen posible esto ❤️",
                likes: 421,
                comments: 32,
                timestamp: "2025-01-08T10:15:00Z"
            }
        ]
    }
};

// ================== STATE ==================
let currentTab = 'google';
let googleData = null;
let instagramData = null;

// ================== INICIALIZACIÓN ==================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Reviews module loaded');

    // Configurar event listeners para tabs
    setupTabs();

    // Cargar datos de Google por defecto
    loadGoogleReviews();
});

// ================== TABS NAVIGATION ==================
function setupTabs() {
    const tabs = document.querySelectorAll('#reviewTabs .nav-link');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Actualizar estado
    currentTab = tabName;

    // Actualizar UI de tabs
    const tabs = document.querySelectorAll('#reviewTabs .nav-link');
    tabs.forEach(t => {
        if (t.dataset.tab === tabName) {
            t.classList.add('active');
        } else {
            t.classList.remove('active');
        }
    });

    // Actualizar CTAs
    const googleCta = document.getElementById('google-cta');
    const instagramCta = document.getElementById('instagram-cta');

    if (tabName === 'google') {
        googleCta.classList.remove('d-none');
        instagramCta.classList.add('d-none');
        loadGoogleReviews();
    } else {
        googleCta.classList.add('d-none');
        instagramCta.classList.remove('d-none');
        loadInstagramPosts();
    }
}

// ================== GOOGLE REVIEWS ==================
async function loadGoogleReviews() {
    console.log('📊 Loading Google reviews...');

    const container = document.getElementById('reviews-container');
    const summary = document.getElementById('ratings-summary');
    const errorDiv = document.getElementById('reviews-error');

    // Mostrar loading
    showLoadingState(container);
    summary.style.display = 'block';
    errorDiv.classList.add('d-none');

    try {
        // Intentar cargar desde API primero
        // Si falla, usar datos mock
        let data;

        try {
            const response = await fetch(REVIEWS_CONFIG.endpoints.google);
            if (response.ok) {
                const json = await response.json();
                data = json.data;
                console.log('✅ Loaded from API');
            } else {
                throw new Error('API not available');
            }
        } catch (apiError) {
            console.warn('⚠️ API not available, using mock data');
            data = MOCK_DATA.google;
        }

        googleData = data;

        // Renderizar ratings summary
        renderRatingsSummary(data.rating, data.totalReviews);

        // Renderizar reviews
        renderGoogleReviews(data.reviews);

    } catch (error) {
        console.error('❌ Error loading reviews:', error);
        showError(container, errorDiv);
        summary.style.display = 'none';
    }
}

function renderRatingsSummary(rating, total) {
    const summary = document.getElementById('ratings-summary');
    const stars = generateStars(rating);

    summary.innerHTML = `
        <div class="rating-number">${rating.toFixed(1)}</div>
        <div class="stars">${stars}</div>
        <div class="total-reviews">${total.toLocaleString()} reseñas en Google Maps</div>
    `;
}

function renderGoogleReviews(reviews) {
    const container = document.getElementById('reviews-container');

    if (!reviews || reviews.length === 0) {
        container.innerHTML = `
            <div class="reviews-empty col-span-full">
                <div class="reviews-empty-icon">📝</div>
                <div class="reviews-empty-text">No hay reseñas disponibles</div>
                <div class="reviews-empty-subtext">Sé el primero en dejarnos una reseña</div>
            </div>
        `;
        return;
    }

    container.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <img src="${review.profilePhoto}" alt="${review.author}" class="review-avatar">
                <div class="review-author-info">
                    <h4 class="review-author">${review.author}</h4>
                    <div class="review-date">${review.date}</div>
                </div>
            </div>
            <div class="review-rating">
                ${generateStars(review.rating)}
            </div>
            <p class="review-text">${review.text}</p>
        </div>
    `).join('');
}

// ================== INSTAGRAM POSTS ==================
async function loadInstagramPosts() {
    console.log('📸 Loading Instagram posts...');

    const container = document.getElementById('reviews-container');
    const summary = document.getElementById('ratings-summary');
    const errorDiv = document.getElementById('reviews-error');

    // Ocultar ratings summary (solo para Google)
    summary.style.display = 'none';

    // Mostrar loading
    showLoadingState(container);
    errorDiv.classList.add('d-none');

    try {
        let data;

        try {
            const response = await fetch(REVIEWS_CONFIG.endpoints.instagram);
            if (response.ok) {
                const json = await response.json();
                data = json.data;
                console.log('✅ Loaded Instagram from API');
            } else {
                throw new Error('API not available');
            }
        } catch (apiError) {
            console.warn('⚠️ Instagram API not available, using mock data');
            data = MOCK_DATA.instagram;
        }

        instagramData = data;

        // Renderizar posts
        renderInstagramPosts(data.posts);

    } catch (error) {
        console.error('❌ Error loading Instagram:', error);
        showError(container, errorDiv);
    }
}

function renderInstagramPosts(posts) {
    const container = document.getElementById('reviews-container');

    if (!posts || posts.length === 0) {
        container.innerHTML = `
            <div class="reviews-empty col-span-full">
                <div class="reviews-empty-icon">📸</div>
                <div class="reviews-empty-text">No hay posts disponibles</div>
                <div class="reviews-empty-subtext">Síguenos en Instagram para ver nuestro contenido</div>
            </div>
        `;
        return;
    }

    container.innerHTML = posts.map(post => {
        const date = new Date(post.timestamp);
        const dateStr = formatInstagramDate(date);

        return `
            <div class="instagram-card">
                <div class="instagram-image-wrapper">
                    <img src="${post.image}" alt="Instagram post" class="instagram-image" loading="lazy">
                </div>
                <div class="instagram-content">
                    <p class="instagram-caption">${post.caption}</p>
                    <div class="instagram-stats">
                        <div class="instagram-stat">
                            <span class="instagram-stat-icon">❤️</span>
                            <span>${post.likes.toLocaleString()}</span>
                        </div>
                        <div class="instagram-stat">
                            <span class="instagram-stat-icon">💬</span>
                            <span>${post.comments.toLocaleString()}</span>
                        </div>
                        <div class="instagram-stat">
                            <span class="instagram-stat-icon">📅</span>
                            <span>${dateStr}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ================== UTILIDADES ==================
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;

    let html = '';
    for (let i = 0; i < fullStars; i++) {
        html += '<span class="star">⭐</span>';
    }
    for (let i = 0; i < emptyStars; i++) {
        html += '<span class="star empty">☆</span>';
    }

    return html;
}

function formatInstagramDate(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
}

function showLoadingState(container) {
    container.innerHTML = `
        <div class="review-skeleton"></div>
        <div class="review-skeleton"></div>
        <div class="review-skeleton"></div>
        <div class="review-skeleton"></div>
        <div class="review-skeleton"></div>
        <div class="review-skeleton"></div>
    `;
}

function showError(container, errorDiv) {
    container.innerHTML = '';
    errorDiv.classList.remove('d-none');
}

// ================== SCROLL TO REVIEWS ==================
// Función global para que el navbar pueda llamarla
window.scrollToReviews = function () {
    const reviewsSection = document.getElementById('reviews');
    if (reviewsSection) {
        reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};
