/*
 * ================================================================
 * VIAJESTORE - LÓGICA DE APLICACIÓN PRINCIPAL
 * ================================================================
 */

// ---------------- DATOS (BASE DE DATOS SIMULADA) ----------------
// Productos del catálogo
const productos = [
    // Papas Solas
    { id: 1, nombre: "Papas Pequeñas", tamaño: "pequeño", tipo: "papas", precio: 3500, imagen: "https://images.unsplash.com/photo-1573080496987-a221b069695d?w=400&q=80" },
    { id: 2, nombre: "Papas Medianas", tamaño: "mediano", tipo: "papas", precio: 5500, imagen: "https://images.unsplash.com/photo-1630384060421-a4323ceca0ad?w=500&q=80" },
    { id: 3, nombre: "Papas Grandes", tamaño: "grande", tipo: "papas", precio: 7500, imagen: "https://images.unsplash.com/photo-1585109649139-3668018951a3?w=600&q=80" },

    // Choclos (NUEVO)
    { id: 20, nombre: "Vaso de Choclo Pequeño", tamaño: "pequeño", tipo: "choclo", precio: 3000, imagen: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500&q=80" }, // Corn generic
    { id: 21, nombre: "Vaso de Choclo Mediano", tamaño: "mediano", tipo: "choclo", precio: 4500, imagen: "https://images.unsplash.com/photo-1623334037606-85d3bc41e8b6?w=600&q=80" }, // Corn cup
    { id: 22, nombre: "Vaso de Choclo Grande", tamaño: "grande", tipo: "choclo", precio: 6000, imagen: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80" }, // Big corn dish

    // Combos
    { id: 4, nombre: "Combo Solo Papas", tamaño: "mediano", tipo: "combos", precio: 6500, descripcion: "Papas Medianas + Bebida", imagen: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=500&q=80" },
    { id: 5, nombre: "Combo Pareja Papas", tamaño: "grande", tipo: "combos", precio: 9500, descripcion: "2 Papas Medianas + 2 Bebidas", imagen: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&q=80" },

    // Nuevos Combos
    { id: 30, nombre: "Combo Solo Choclo", tamaño: "mediano", tipo: "combos", precio: 5500, descripcion: "Choclo Mediano + Bebida", imagen: "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=500&q=80" },
    { id: 31, nombre: "Combo Mixto", tamaño: "grande", tipo: "combos", precio: 10500, descripcion: "1 Papas Medianas + 1 Choclo Mediano + 2 Bebidas", imagen: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80" },
    { id: 32, nombre: "Combo Familiar", tamaño: "familiar", tipo: "combos", precio: 18000, descripcion: "2 Papas Grandes + 2 Choclos Grandes + 4 Bebidas", imagen: "https://images.unsplash.com/photo-1544025162-d76690b67f61?w=600&q=80" }
];

// Productos de Acompañamiento (Bebidas y Postres)
const accompaniments = [
    { id: 101, nombre: "Bebida 350ml", tipo: "bebida", precio: 1500, imagen: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400" },
    { id: 102, nombre: "Jugo Natural", tipo: "bebida", precio: 2000, imagen: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400" },
    { id: 103, nombre: "Helado Artesanal", tipo: "postre", precio: 2500, imagen: "https://images.unsplash.com/photo-1560008581-09826d1de69e?w=400" },
    { id: 104, nombre: "Brownie con Helado", tipo: "postre", precio: 3000, imagen: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400" },
    { id: 105, nombre: "Galletas Chips (x3)", tipo: "postre", precio: 1200, imagen: "https://images.unsplash.com/photo-1499636138143-bd630f5cf446?w=400" }
];

// Opciones de personalización
const toppingsOptions = [
    { id: 1, nombre: "Queso Cheddar", precio: 500 },
    { id: 2, nombre: "Queso Mozzarella", precio: 500 },
    { id: 3, nombre: "Salsa Mayo", precio: 300 },
    { id: 4, nombre: "Salsa BBQ", precio: 300 },
    { id: 5, nombre: "Pollo Desmenuzado", precio: 800 },
    { id: 6, nombre: "Bacon", precio: 800 },
    { id: 7, nombre: "Carne Molida", precio: 800 },
    { id: 8, nombre: "Cebolla Caramelizada", precio: 200 },
    { id: 9, nombre: "Cilantro", precio: 200 },
    { id: 10, nombre: "Jalapeño", precio: 200 },
    { id: 11, nombre: "Sal de Mar", precio: 100 },
    { id: 12, nombre: "Merkén", precio: 100 }
];

// ---------------- ESTADO DE LA APLICACIÓN ----------------
// Cargamos el carrito desde LocalStorage si existe para persistencia
let carrito = JSON.parse(localStorage.getItem('viajestore_cart')) || [];
let currentProduct = null; // Producto seleccionado actualmente para editar
const SHIPPING_COST = 2000;

// ---------------- INICIALIZACIÓN ----------------
// Se ejecuta cuando el HTML termina de cargar
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();       // Dibuja catálogo inicial
    renderAccompaniments(); // Dibuja bebidas y postres
    refreshCartDisplay(); // Actualiza badge y contenido del carrito
    setupBookingDate();   // Configura el datepicker del modal de agenda
    initScrollAnimations(); // Inicia animaciones de scroll
    initCarouselLogic(); // Inicia lógica de carrusel (nav + auto scroll)
});

// ---------------- LÓGICA DE CARRUSEL (NAV + AUTO LOOP) ----------------
function initCarouselLogic() {
    const container = document.getElementById('products-carousel');
    const btnPrev = document.querySelector('.carousel-btn-prev');
    const btnNext = document.querySelector('.carousel-btn-next');

    if (!container) return;

    // Configuración scroll
    const scrollAmount = 350; // Aproximado al ancho de tarjeta + gap
    let autoScrollInterval;

    // Navegación Manual
    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            resetAutoScroll();
        });
    }
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            scrollNext();
            resetAutoScroll();
        });
    }

    // Función para ir al siguiente (con loop)
    function scrollNext() {
        // Tolerancia de 10px para detectar final
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
            container.scrollTo({ left: 0, behavior: 'smooth' }); // Loop al inicio
        } else {
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }

    // Auto Scroll Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startAutoScroll();
            } else {
                stopAutoScroll();
            }
        });
    }, { threshold: 0.2 });

    observer.observe(document.querySelector('#catalog') || container);

    function startAutoScroll() {
        stopAutoScroll(); // Prevenir múltiples intervalos
        autoScrollInterval = setInterval(() => {
            // Solo scrollear si el usuario NO está interactuando (hover)
            if (!container.matches(':hover')) {
                scrollNext();
            }
        }, 3000);
    }

    function stopAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
    }

    // Reiniciar timer al interactuar manualmente
    function resetAutoScroll() {
        stopAutoScroll();
        startAutoScroll();
    }
}

// ---------------- ANIMACIONES SCROLL ----------------
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Solo animar una vez
            }
        });
    }, observerOptions);

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));
}

// ---------------- UTILIDADES ----------------
// Formatea números a formato moneda CLP (separador de miles)
function formatPrice(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// ---------------- LÓGICA DE VIDEO SCROLLY-TELLING ----------------
const scrollVideoSection = document.getElementById('scrolly-video');
const scrollVideo = document.getElementById('scrollVideo');
const heroOverlay = document.getElementById('hero-overlay');

if (scrollVideoSection && scrollVideo) {
    scrollVideo.pause();
    let isScrolling = false;

    // SMOOTH SCROLL VARIABLES
    let targetTime = 0;
    let currentTime = 0;
    const smoothFactor = 0.15; // Ajustar para más/menos suavidad (0.1 = muy suave, 0.3 = más rápido)

    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(animationLoop);
            isScrolling = true;
        }
        handleNavAndTopBtn(); // Navbar inteligente y Botón subir
    });

    function animationLoop() {
        updateVideoScroll();

        // Si la diferencia es muy pequeña, dejamos de animar para ahorrar recursos
        if (Math.abs(currentTime - targetTime) > 0.01) {
            window.requestAnimationFrame(animationLoop);
        } else {
            isScrolling = false;
        }
    }

    function updateVideoScroll() {
        const rect = scrollVideoSection.getBoundingClientRect();
        const sectionHeight = rect.height;
        const windowHeight = window.innerHeight;
        const distanceFromTop = -rect.top;
        const maxScroll = sectionHeight - windowHeight;

        if (distanceFromTop >= -windowHeight && distanceFromTop <= maxScroll + windowHeight) {
            let scrollProgress = distanceFromTop / maxScroll;
            scrollProgress = Math.max(0, Math.min(1, scrollProgress));

            if (scrollVideo.readyState >= 2 && scrollVideo.duration) {
                // LERP: Movemos el tiempo actual suavemente hacia el objetivo
                targetTime = scrollVideo.duration * scrollProgress;
                currentTime += (targetTime - currentTime) * smoothFactor;

                if (currentTime < 0) currentTime = 0;
                if (currentTime > scrollVideo.duration) currentTime = scrollVideo.duration;

                scrollVideo.currentTime = currentTime;
            }

            // Fade del Hero (usando currentTime para que vaya sync con el video suave)
            if (heroOverlay) {
                // Usamos el progreso visual real para el fade
                const visualProgress = currentTime / scrollVideo.duration;
                if (visualProgress > 0.1) {
                    heroOverlay.style.opacity = Math.max(0, 1 - (visualProgress - 0.1) * 3); // Fade out más rápido
                } else {
                    heroOverlay.style.opacity = 1;
                }
            }
        }
    }
}

// ---------------- NAVBAR INTELIGENTE Y BACK TO TOP ----------------
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');
const btnBackToTop = document.getElementById('btn-back-to-top');

function handleNavAndTopBtn() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Smart Navbar
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        navbar.classList.add('navbar-hidden');
    } else {
        navbar.classList.remove('navbar-hidden');
    }
    lastScrollTop = scrollTop;

    // Back to Top Button
    if (btnBackToTop) {
        if (scrollTop > 300) {
            btnBackToTop.style.display = 'flex';
        } else {
            btnBackToTop.style.display = 'none';
        }
    }
}

// Click en botón volver arriba
if (btnBackToTop) {
    btnBackToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ---------------- RENDERIZADO DE CATÁLOGO ----------------

function renderProducts(filter = 'todos') {
    const container = document.getElementById('products-carousel');
    if (!container) return;

    container.innerHTML = '';

    // Filtramos productos
    const filteredProducts = productos.filter(p => {
        if (filter === 'todos') return true;
        return p.tipo === filter; // Filtra por 'papas' o 'combos'
    });

    filteredProducts.forEach(producto => {
        const slide = document.createElement('div');
        slide.className = 'product-slide';

        // Determinar si mostrar descripción (para combos)
        const descHtml = producto.descripcion ? `<p class="text-muted small mb-2">${producto.descripcion}</p>` : '';

        slide.innerHTML = `
            <div class="card card-custom h-100">
                <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre} - ${producto.descripcion || 'Papas fritas gourmet personalizadas'}" loading="lazy">
                <div class="card-body d-flex flex-column text-center">
                    <h5 class="card-title fw-bold">${producto.nombre}</h5>
                    ${descHtml}
                    <p class="card-price mb-3">$${formatPrice(producto.precio)}</p>
                    <button class="btn btn-primary-custom w-100 mt-auto" onclick="openCustomizeModal(${producto.id})">
                        Personalizar
                    </button>
                </div>
            </div>
        `;
        container.appendChild(slide);
    });
}

// Inicializar filtrado de botones activos
function filterProducts(category) {
    // Actualizar botones visualmente
    const buttons = document.querySelectorAll('.btn-group button');
    buttons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes(category) ||
            (category === 'todos' && btn.textContent === 'Todos')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    renderProducts(category);
}

// ---------------- RENDERIZADO DE ACOMPAÑAMIENTOS ----------------
function renderAccompaniments() {
    const container = document.getElementById('accompaniments-grid');
    if (container) {
        container.innerHTML = accompaniments.map(p => `
            <div class="col-md-3 col-6">
                <div class="card card-custom h-100">
                    <img src="${p.imagen}" class="card-img-top" alt="${p.nombre} - ${p.tipo}" style="height: 150px; object-fit: cover;" loading="lazy">
                    <div class="card-body text-center p-3">
                        <h6 class="card-title mb-1">${p.nombre}</h6>
                        <p class="card-price mb-2">$${formatPrice(p.precio)}</p>
                        <button class="btn btn-sm btn-outline-primary w-100" onclick="addAccompanimentToCart(${p.id})">
                            AGREGAR
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Agregar acompañamiento directo al carrito
function addAccompanimentToCart(id) {
    const product = accompaniments.find(p => p.id === id);
    if (!product) return;

    const cartItem = {
        uid: Date.now(),
        product: product,
        toppings: [], // Sin toppings
        quantity: 1,
        unitBasePrice: product.precio
    };

    carrito.push(cartItem);
    saveCart();
    refreshCartDisplay();

    // Feedback visual (abrir carrito)
    const offcanvasElement = document.getElementById('cartOffcanvas');
    if (offcanvasElement) {
        const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    }
}

// ---------------- MODAL DE PERSONALIZACIÓN ----------------
let customizeModal;
const customizeModalEl = document.getElementById('customizeModal');
if (customizeModalEl) {
    customizeModal = new bootstrap.Modal(customizeModalEl);
}

function openCustomizeModal(productId) {
    currentProduct = productos.find(p => p.id === productId);
    document.getElementById('modal-product-name').innerText = currentProduct.nombre;
    document.getElementById('modal-quantity').value = 1;

    // Setear imagen de Vista Previa
    const previewImg = document.getElementById('modal-preview-image');
    if (previewImg) {
        previewImg.src = currentProduct.imagen;
    }

    // 1. Renderizar TOPPINGS (Ingredientes)
    const toppingsList = document.getElementById('toppings-list');
    toppingsList.innerHTML = toppingsOptions.map(t => `
        <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
            <div>
                <span class="fw-medium">${t.nombre}</span>
                <small class="text-muted d-block">+$${t.precio}</small>
            </div>
            <div class="d-flex align-items-center bg-light rounded-pill px-2 border">
                <button class="btn btn-sm btn-link text-decoration-none p-0 fw-bold text-dark" 
                        onclick="updateToppingQty(${t.id}, -1)">−</button>
                <input type="text" readonly class="form-control-plaintext text-center mx-1 p-0 topping-qty" 
                       id="topping-qty-${t.id}" value="0" data-id="${t.id}" data-price="${t.precio}" 
                       style="width: 25px; font-weight: bold;">
                <button class="btn btn-sm btn-link text-decoration-none p-0 fw-bold text-dark" 
                        onclick="updateToppingQty(${t.id}, 1)">+</button>
            </div>
        </div>
    `).join('');

    // 2. Renderizar EXTRAS (Bebidas y Postres) - NEW
    const extrasList = document.getElementById('extras-list');
    if (extrasList) {
        extrasList.innerHTML = accompaniments.map(e => `
            <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                <div class="d-flex align-items-center">
                    <img src="${e.imagen}" alt="${e.nombre}" class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover;">
                    <div>
                        <span class="fw-medium d-block" style="font-size: 0.9rem;">${e.nombre}</span>
                        <small class="text-secondary fw-bold">$${e.precio}</small>
                    </div>
                </div>
                <div class="d-flex align-items-center bg-light rounded-pill px-2 border">
                    <button class="btn btn-sm btn-link text-decoration-none p-0 fw-bold text-dark" 
                            onclick="updateExtraQty(${e.id}, -1)">−</button>
                    <input type="text" readonly class="form-control-plaintext text-center mx-1 p-0 extra-qty" 
                           id="extra-qty-${e.id}" value="0" data-id="${e.id}" data-price="${e.precio}" 
                           style="width: 25px; font-weight: bold;">
                    <button class="btn btn-sm btn-link text-decoration-none p-0 fw-bold text-dark" 
                            onclick="updateExtraQty(${e.id}, 1)">+</button>
                </div>
            </div>
        `).join('');
    }

    updateModalPrice();

    updateModalPrice();

    // Iniciar en Paso 1
    goToStep(1);
    customizeModal.show();
}

// ---------------- WIZARD DE PASOS ----------------
window.goToStep = function (step) {
    // Referencias
    const step1 = document.getElementById('modal-step-1-toppings');
    const step2 = document.getElementById('modal-step-2-question');
    const step3 = document.getElementById('modal-step-3-extras');

    const btnNext = document.getElementById('btn-step-next');
    const btnFinish = document.getElementById('btn-step-finish');

    // Resetear visibilidad
    if (step1) step1.className = 'd-none';
    if (step2) step2.className = 'd-none';
    if (step3) step3.className = 'd-none';

    // Mostrar paso actual
    if (step === 1) {
        if (step1) step1.className = 'd-flex flex-column h-100'; // Flex para layout layout interno
        if (btnNext) btnNext.classList.remove('d-none');
        if (btnFinish) btnFinish.classList.add('d-none');
    } else if (step === 2) {
        if (step2) step2.className = 'd-flex h-100 flex-column justify-content-center';
        if (btnNext) btnNext.classList.add('d-none'); // Ocultar botones en paso pregunta (tiene sus propios botones)
        if (btnFinish) btnFinish.classList.add('d-none');
    } else if (step === 3) {
        if (step3) step3.className = 'd-flex flex-column h-100';
        if (btnNext) btnNext.classList.add('d-none');
        if (btnFinish) btnFinish.classList.remove('d-none');
    }
}

// Opción "No, solo papas"
window.finishOrderNoExtras = function () {
    // Asegurar que no hay extras seleccionados
    document.querySelectorAll('.extra-qty').forEach(input => input.value = 0);
    updateModalPrice();
    addToCartFromModal();
}

// Auxiliar para Toppings
window.updateToppingQty = function (id, change) {
    const input = document.getElementById(`topping-qty-${id}`);
    if (!input) return;
    let val = parseInt(input.value) || 0;
    val += change;
    if (val < 0) val = 0;
    if (val > 5) val = 5;
    input.value = val;
    updateModalPrice();
}

// Auxiliar para Extras (Bebidas/Postres)
window.updateExtraQty = function (id, change) {
    const input = document.getElementById(`extra-qty-${id}`);
    if (!input) return;
    let val = parseInt(input.value) || 0;
    val += change;
    if (val < 0) val = 0;
    if (val > 10) val = 10;
    input.value = val;
    updateModalPrice();
}

// Auxiliar para Cantidad de Producto Principal
window.updateModalQuantity = function (change) {
    const input = document.getElementById('modal-quantity');
    if (!input) return;
    let val = parseInt(input.value) || 1;
    val += change;
    if (val < 1) val = 1;  // Mínimo 1
    if (val > 10) val = 10; // Máximo 10
    input.value = val;
    updateModalPrice();
}


// Calcula el precio en tiempo real (Base + Toppings)*Qty + (Extras*Qty)
function updateModalPrice() {
    if (!currentProduct) return;
    const prodQuantity = parseInt(document.getElementById('modal-quantity').value) || 1;

    // 1. Costo Papas + Toppings
    let toppingsTotal = 0;
    document.querySelectorAll('.topping-qty').forEach(input => {
        const qty = parseInt(input.value) || 0;
        const price = parseInt(input.dataset.price) || 0;
        toppingsTotal += (qty * price);
    });

    // 2. Costo Extras
    let extrasTotal = 0;
    document.querySelectorAll('.extra-qty').forEach(input => {
        const qty = parseInt(input.value) || 0;
        const price = parseInt(input.dataset.price) || 0;
        extrasTotal += (qty * price);
    });

    const mainTotal = (currentProduct.precio + toppingsTotal) * prodQuantity;
    const finalTotal = mainTotal + extrasTotal;

    document.getElementById('modal-total-price').innerText = '$' + formatPrice(finalTotal);
}

const modalQty = document.getElementById('modal-quantity');
if (modalQty) {
    modalQty.addEventListener('change', updateModalPrice);
}

// Agregar TODO al carrito
function addToCartFromModal() {
    const prodQuantity = parseInt(document.getElementById('modal-quantity').value);

    // 1. Armar Producto Principal (Papas + Toppings)
    const qtyInputs = document.querySelectorAll('.topping-qty');
    const selectedToppings = [];
    let toppingsTotal = 0;

    qtyInputs.forEach(input => {
        const qty = parseInt(input.value) || 0;
        if (qty > 0) {
            const tId = input.dataset.id;
            const toppingObj = toppingsOptions.find(t => t.id == tId);
            if (toppingObj) {
                selectedToppings.push({ ...toppingObj, qty: qty });
                toppingsTotal += (qty * toppingObj.precio);
            }
        }
    });

    const mainItem = {
        uid: Date.now(),
        product: currentProduct,
        toppings: selectedToppings,
        quantity: prodQuantity,
        unitBasePrice: currentProduct.precio + toppingsTotal
    };
    carrito.push(mainItem);

    // 2. Agregar Extras como Items Separados
    const extraInputs = document.querySelectorAll('.extra-qty');
    extraInputs.forEach((input, index) => {
        const qty = parseInt(input.value) || 0;
        if (qty > 0) {
            const eId = input.dataset.id;
            const extraObj = accompaniments.find(e => e.id == eId);
            if (extraObj) {
                // Agregar item extra
                carrito.push({
                    uid: Date.now() + index + 1, // UID único offset
                    product: extraObj,
                    toppings: [],
                    quantity: qty,
                    unitBasePrice: extraObj.precio
                });
            }
        }
    });

    saveCart();
    refreshCartDisplay();
    customizeModal.hide();

    // Feedback
    const offcanvasElement = document.getElementById('cartOffcanvas');
    if (offcanvasElement) {
        const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
        offcanvas.show();
    }
}

// ---------------- GESTIÓN DEL CARRITO ----------------
function saveCart() {
    localStorage.setItem('viajestore_cart', JSON.stringify(carrito));
}

function refreshCartDisplay() {
    const countBadge = document.getElementById('cart-count');
    const container = document.getElementById('cart-items-container');

    if (!countBadge || !container) return;

    const totalItems = carrito.reduce((acc, item) => acc + item.quantity, 0);

    countBadge.innerText = totalItems;

    // Estado vacío
    if (carrito.length === 0) {
        container.innerHTML = '<div class="text-center py-5 text-muted">Tu carrito está vacío 🍟<br><button class="btn btn-sm btn-outline-dark mt-3" data-bs-dismiss="offcanvas">Ir a comprar</button></div>';
        document.getElementById('cart-subtotal').innerText = '$0';
        document.getElementById('cart-total').innerText = '$0';
        const checkoutBtn = document.getElementById('btn-checkout');
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    const checkoutBtn = document.getElementById('btn-checkout');
    if (checkoutBtn) checkoutBtn.disabled = false;
    let subtotal = 0;

    // Renderizar items
    container.innerHTML = carrito.map(item => {
        const itemTotal = item.unitBasePrice * item.quantity;
        subtotal += itemTotal;

        // Renderizado seguro de lista de toppings
        let toppingsStr = '';
        if (item.toppings && Array.isArray(item.toppings) && item.toppings.length > 0) {
            const list = item.toppings.map(t => `+ ${t.qty > 1 ? `(${t.qty}x) ` : ''}${t.nombre}`).join('<br>');
            toppingsStr = `<small class="text-muted d-block mt-1" style="font-size: 0.85em;">${list}</small>`;
        }

        return `
            <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                <div>
                    <strong>${item.product.nombre}</strong>
                    ${toppingsStr}
                    <div class="mt-1">
                        <span class="text-primary-custom">$${formatPrice(item.unitBasePrice)}</span> x ${item.quantity}
                    </div>
                </div>
                <div class="d-flex align-items-center">
                    <span class="fw-bold me-3">$${formatPrice(itemTotal)}</span>
                    <button class="btn btn-sm btn-link text-danger p-0" onclick="removeFromCart(${item.uid})">✕</button>
                </div>
            </div>
            `;
    }).join('');

    document.getElementById('cart-subtotal').innerText = '$' + formatPrice(subtotal);
    document.getElementById('cart-total').innerText = '$' + formatPrice(subtotal + SHIPPING_COST);
}

function removeFromCart(uid) {
    carrito = carrito.filter(item => item.uid !== uid);
    saveCart();
    refreshCartDisplay();
}

// ---------------- LÓGICA DE CHECKOUT Y PAGO ----------------
let checkoutModal;
const checkoutModalEl = document.getElementById('checkoutModal');
if (checkoutModalEl) {
    checkoutModal = new bootstrap.Modal(checkoutModalEl);
}

function initCheckout() {
    // Llenar resumen en el modal de pago
    // Llenar resumen en el modal de pago
    const summaryDiv = document.getElementById('checkout-summary');
    let subtotal = 0;
    summaryDiv.innerHTML = carrito.map(item => {
        const t = item.unitBasePrice * item.quantity;
        subtotal += t;

        // Generar texto de toppings
        let details = '';
        if (item.toppings && Array.isArray(item.toppings) && item.toppings.length > 0) {
            const tNames = item.toppings.map(t => t.nombre).join(', ');
            details = ` <span class="text-muted" style="font-size:0.9em;">(+ ${tNames})</span>`;
        }

        return `
            <div class="d-flex justify-content-between mb-1">
                <small>
                    <strong>${item.quantity}x</strong> ${item.product.nombre}${details}
                </small>
                <small>$${formatPrice(t)}</small>
            </div>
        `;
    }).join('');

    document.getElementById('checkout-subtotal').innerText = '$' + formatPrice(subtotal);
    document.getElementById('checkout-total').innerText = '$' + formatPrice(subtotal + SHIPPING_COST);

    // Cargar datos previos del usuario si existen
    const prevClient = JSON.parse(localStorage.getItem('viajestore_client'));
    if (prevClient) {
        document.getElementById('checkout-name').value = prevClient.name || '';
        document.getElementById('checkout-email').value = prevClient.email || '';
        document.getElementById('checkout-phone').value = prevClient.phone || '';
        document.getElementById('checkout-address').value = prevClient.address || '';
        document.getElementById('checkout-commune').value = prevClient.commune || '';
        validateCommune();
    }

    // Cerrar el carrito lateral antes de abrir el modal central
    const offcanvasEl = document.getElementById('cartOffcanvas');
    if (offcanvasEl) {
        const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
        if (offcanvas) offcanvas.hide();
    }

    checkoutModal.show();
}

// Validador Geográfico: Solo permite 3 comunas específicas
function validateCommune() {
    const select = document.getElementById('checkout-commune');
    const val = select.value;
    const validCommunes = ['Macul', 'La Florida', 'Peñalolén'];
    const btn = document.getElementById('btn-pay');
    const feedbackInv = document.getElementById('commune-feedback');
    const feedbackVal = document.getElementById('commune-success');

    select.classList.remove('is-valid-commune', 'is-invalid-commune');
    feedbackInv.style.display = 'none';
    feedbackVal.style.display = 'none';

    if (validCommunes.includes(val)) {
        select.classList.add('is-valid-commune');
        feedbackVal.style.display = 'block';
        btn.disabled = false; // Habilita el botón de pago
    } else {
        select.classList.add('is-invalid-commune');
        feedbackInv.style.display = 'block';
        btn.disabled = true; // Deshabilita pago si la comuna no es válida
    }
}

function processPayment() {
    // Guardar datos del cliente
    const clientData = {
        name: document.getElementById('checkout-name').value,
        email: document.getElementById('checkout-email').value,
        phone: document.getElementById('checkout-phone').value,
        address: document.getElementById('checkout-address').value,
        commune: document.getElementById('checkout-commune').value
    };
    localStorage.setItem('viajestore_client', JSON.stringify(clientData));

    if (!clientData.name || !clientData.email || !clientData.phone || !clientData.address) {
        alert("Por favor completa todos los campos requeridos");
        return;
    }

    // Simulación de proceso de pago (MercadoPago)
    const btn = document.getElementById('btn-pay');
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Procesando...';
    btn.disabled = true;

    setTimeout(() => {
        // Ocultar formulario y mostrar mensaje de éxito
        document.getElementById('checkout-form-container').classList.add('d-none');
        document.getElementById('checkout-success-message').classList.remove('d-none');

        // Actualizar información de entrega
        document.getElementById('success-delivery-info').innerText =
            `Tu orden llegará en 30-45 minutos a ${clientData.commune}.`;

        // Limpiar carrito
        carrito = [];
        saveCart();
        refreshCartDisplay();

        // Resetear botón (para próximas compras)
        btn.innerHTML = 'PAGAR CON MERCADOPAGO';
        btn.disabled = true;
    }, 2000);
}

// Función para cerrar el modal de éxito y recargar la página
window.closeCheckoutAndReload = function () {
    // Ocultar mensaje de éxito y mostrar formulario de nuevo
    document.getElementById('checkout-success-message').classList.add('d-none');
    document.getElementById('checkout-form-container').classList.remove('d-none');

    // Cerrar modal
    checkoutModal.hide();

    // Recargar página para reiniciar estado
    setTimeout(() => {
        window.location.reload();
    }, 300);
}

// ---------------- LÓGICA DE AGENDAMIENTO TECH ----------------
let bookingModal;
const bookingModalEl = document.getElementById('bookingModal');
if (bookingModalEl) {
    bookingModal = new bootstrap.Modal(bookingModalEl);
}

function openBookingModal(serviceName, price) {
    document.getElementById('booking-service-name').innerText = serviceName;
    bookingModal.show();
}

function setupBookingDate() {
    // Configurar fecha mínima = mañana
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        const today = new Date();
        today.setDate(today.getDate() + 1);
        const strDate = today.toISOString().split('T')[0];
        dateInput.min = strDate;
    }
}

function handleBooking(e) {
    e.preventDefault();
    alert("✓ Redirigiendo a MercadoPago para seña de $10.000...\n\n(Simulación: Cita Agendada)");
    bookingModal.hide();
    // Redirigir a WhatsApp
    window.open("https://wa.me/56912345678?text=Hola,%20acabo%20de%20pagar%20la%20seña%20para%20un%20servicio%20Tech", "_blank");
}
