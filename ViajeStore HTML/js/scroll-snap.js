/**
 * ================================================================
 * SCROLL SNAP CONTROLLER - Navegación por diapositivas
 * ================================================================
 * Controla la navegación entre secciones con scroll snap
 */

(function () {
    'use strict';

    // Configuración
    const sections = document.querySelectorAll('.snap-section, #scrolly-video, #tech-video-hero');
    const navDots = document.querySelectorAll('.scroll-nav-dot');
    const scrollProgress = document.getElementById('scrollProgress');
    let currentSection = 0;
    let isNavigating = false;

    // Inicializar
    function init() {
        setupScrollObserver();
        setupDotNavigation();
        setupScrollProgress();
        setupKeyboardNav();
        hideScrollIndicator();
    }

    // Observer para detectar sección visible
    function setupScrollObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px', // Trigger cuando esté centrada
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Update active dot
                    const sectionId = entry.target.id;
                    updateActiveDot(sectionId);

                    // Add in-view class para animaciones
                    entry.target.classList.add('in-view');

                    // Update navbar active links
                    updateNavbarLinks(sectionId);
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }

    // Actualizar dot activo
    function updateActiveDot(sectionId) {
        navDots.forEach(dot => {
            const target = dot.dataset.target;
            if (target === sectionId) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Navegación con clicks en dots
    function setupDotNavigation() {
        navDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const targetId = dot.dataset.target;
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    // Desactivar snap temporalmente para smooth scroll
                    disableSnapTemporarily();

                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Progress bar de scroll
    function setupScrollProgress() {
        window.addEventListener('scroll', () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrolled = window.scrollY;
            const progress = (scrolled / documentHeight) * 100;

            if (scrollProgress) {
                scrollProgress.style.transform = `scaleX(${progress / 100})`;
            }
        });
    }

    // Navegación con teclado (flechas arriba/abajo)
    function setupKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                navigateToSection('next');
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                navigateToSection('prev');
            } else if (e.key === 'Home') {
                e.preventDefault();
                navigateToSection('first');
            } else if (e.key === 'End') {
                e.preventDefault();
                navigateToSection('last');
            }
        });
    }

    // Navegar a sección
    function navigateToSection(direction) {
        const sectionsArray = Array.from(sections);
        let targetIndex;

        // Encontrar sección actual
        const currentScrollPosition = window.scrollY + (window.innerHeight / 2);
        currentSection = sectionsArray.findIndex(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + window.scrollY;
            const sectionBottom = sectionTop + rect.height;
            return currentScrollPosition >= sectionTop && currentScrollPosition < sectionBottom;
        });

        // Calcular target
        switch (direction) {
            case 'next':
                targetIndex = Math.min(currentSection + 1, sectionsArray.length - 1);
                break;
            case 'prev':
                targetIndex = Math.max(currentSection - 1, 0);
                break;
            case 'first':
                targetIndex = 0;
                break;
            case 'last':
                targetIndex = sectionsArray.length - 1;
                break;
            default:
                return;
        }

        if (targetIndex !== currentSection && sectionsArray[targetIndex]) {
            disableSnapTemporarily();
            sectionsArray[targetIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Desactivar snap temporalmente para smooth scroll - TIEMPO AUMENTADO
    function disableSnapTemporarily() {
        if (isNavigating) return;

        isNavigating = true;
        document.documentElement.classList.add('navigating');

        setTimeout(() => {
            document.documentElement.classList.remove('navigating');
            isNavigating = false;
        }, 1500); // Aumentado de 1000ms a 1500ms
    }

    // Actualizar links del navbar
    function updateNavbarLinks(sectionId) {
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes('#') && href.split('#')[1] === sectionId) {
                link.classList.add('active-section');
            } else {
                link.classList.remove('active-section');
            }
        });
    }

    // Ocultar indicador de scroll después de primer scroll
    function hideScrollIndicator() {
        const indicator = document.querySelector('.scroll-indicator');
        if (!indicator) return;

        let hasScrolled = false;
        window.addEventListener('scroll', () => {
            if (!hasScrolled && window.scrollY > 100) {
                hasScrolled = true;
                indicator.style.opacity = '0';
                indicator.style.pointerEvents = 'none';
                setTimeout(() => {
                    indicator.style.display = 'none';
                }, 500);
            }
        });
    }

    // Ajustar scroll snap según dispositivo - MEJORADO
    function checkMobileAndDisable() {
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
        const isDesktop = window.innerWidth > 1024;

        if (isMobile) {
            // Desactivar completamente en móvil
            document.documentElement.style.scrollSnapType = 'none';
        } else if (isTablet) {
            // Muy suave en tablet
            document.documentElement.style.scrollSnapType = 'y proximity';
        } else if (isDesktop) {
            // Proximity en desktop (menos agresivo que mandatory)
            document.documentElement.style.scrollSnapType = 'y proximity';
        }
    }

    // Desactivar snap cuando se acerca al footer
    function handleFooterProximity() {
        const footer = document.querySelector('footer');
        if (!footer) return;

        const reviewsSection = document.getElementById('reviews');
        if (!reviewsSection) return;

        window.addEventListener('scroll', () => {
            const footerRect = footer.getBoundingClientRect();
            const reviewsRect = reviewsSection.getBoundingClientRect();

            // Si estamos cerca del footer (últimos 300px de reviews)
            if (reviewsRect.bottom < window.innerHeight + 300) {
                document.documentElement.style.scrollSnapType = 'none';
            } else if (window.scrollY < document.documentElement.scrollHeight - window.innerHeight - 500) {
                // Restaurar snap si estamos lejos del footer
                checkMobileAndDisable();
            }
        });
    }

    // Listener para resize
    window.addEventListener('resize', checkMobileAndDisable);

    // Inicializar cuando DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            handleFooterProximity(); // Añadir handler del footer
        });
    } else {
        init();
        handleFooterProximity(); // Añadir handler del footer
    }

    // Check mobile al cargar
    checkMobileAndDisable();

    // Exponer API global para debugging
    window.ViajestoreScrollSnap = {
        navigateToSection,
        updateActiveDot,
        currentSection: () => currentSection
    };

})();
