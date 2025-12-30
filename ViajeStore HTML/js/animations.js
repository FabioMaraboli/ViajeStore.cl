/*
 * ================================================================
 * VIAJESTORE - ANIMATION LOGIC
 * ================================================================
 * Vanilla JavaScript for scroll-triggered animations
 * Uses IntersectionObserver for performance
 */

(function () {
    'use strict';

    // ================================================================
    // INITIALIZATION - Run when DOM is ready
    // ================================================================

    function init() {
        console.log('🎨 ViajeStore Animations Initialized');

        // Initialize all animation systems
        initScrollAnimations();
        initValueCardsAnimation();
        initProductCardsAnimation();
        initServiceCardsAnimation();
        initFooterAnimation();
        initHeroBadgePulse();
        initButtonMicroInteractions();
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ================================================================
    // 1. SCROLL ANIMATIONS - Generic IntersectionObserver
    // ================================================================

    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Unobserve after animation to improve performance
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all elements with .animate-on-scroll class
        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(el => observer.observe(el));
    }

    // ================================================================
    // 2. VALUE CARDS (Misión/Visión/Compromiso) - Cascade Animation
    // ================================================================

    function initValueCardsAnimation() {
        const valueCards = document.querySelectorAll('.value-card');

        if (valueCards.length === 0) return;

        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add cascade animation classes
                    valueCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add(`animate-cascade-${index + 1}`);
                        }, index * 50); // Small delay for smoother cascade
                    });
                    observer.disconnect(); // Only animate once
                }
            });
        }, observerOptions);

        // Observe the first value card as trigger
        if (valueCards[0]) {
            observer.observe(valueCards[0]);
        }
    }

    // ================================================================
    // 3. PRODUCT CARDS - Stagger Animation
    // ================================================================

    function initProductCardsAnimation() {
        // This function will be called whenever products are rendered
        // We'll observe the carousel container instead
        const carousel = document.getElementById('products-carousel');

        if (!carousel) return;

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateProductSlides();
                    observer.disconnect();
                }
            });
        }, observerOptions);

        observer.observe(carousel);

        // Listen for filter changes to re-animate
        const filterButtons = document.querySelectorAll('.btn-group button');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                setTimeout(animateProductSlides, 50);
            });
        });
    }

    function animateProductSlides() {
        const slides = document.querySelectorAll('.product-slide');

        slides.forEach((slide, index) => {
            // Remove previous animation
            slide.classList.remove('animate-stagger');
            slide.style.animationDelay = '';

            // Force reflow to restart animation
            void slide.offsetWidth;

            // Add stagger animation with delay
            setTimeout(() => {
                slide.style.animationDelay = `${index * 0.1}s`;
                slide.classList.add('animate-stagger');
            }, 10);
        });
    }

    // ================================================================
    // 4. SERVICE CARDS - Grid Animation (2x2)
    // ================================================================

    function initServiceCardsAnimation() {
        const servicesSection = document.getElementById('services');

        if (!servicesSection) return;

        const serviceCards = servicesSection.querySelectorAll('.card-custom');

        if (serviceCards.length === 0) return;

        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add grid animation classes with alternating delays
                    serviceCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add(`animate-grid-${index + 1}`);
                        }, index * 100);
                    });
                    observer.disconnect();
                }
            });
        }, observerOptions);

        observer.observe(servicesSection);
    }

    // ================================================================
    // 5. FOOTER - Column Cascade
    // ================================================================

    function initFooterAnimation() {
        const footer = document.querySelector('footer');

        if (!footer) return;

        const footerColumns = footer.querySelectorAll('.col-md-4');

        if (footerColumns.length === 0) return;

        const observerOptions = {
            threshold: 0.3,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    footerColumns.forEach((col, index) => {
                        setTimeout(() => {
                            col.classList.add(`animate-footer-${index + 1}`);
                        }, index * 150);
                    });
                    observer.disconnect();
                }
            });
        }, observerOptions);

        observer.observe(footer);
    }

    // ================================================================
    // 6. HERO BADGE PULSE - Infinite Animation
    // ================================================================

    function initHeroBadgePulse() {
        // Find the badge with "250+ órdenes"
        const heroOverlay = document.getElementById('hero-overlay');

        if (!heroOverlay) return;

        // Find the small element with the badge text
        const badgeElement = heroOverlay.querySelector('small');

        if (badgeElement) {
            // Add pulse class after a delay
            setTimeout(() => {
                badgeElement.classList.add('hero-badge-pulse');
            }, 1500);
        }
    }

    // ================================================================
    // 7. BUTTON MICRO-INTERACTIONS - Click Feedback
    // ================================================================

    function initButtonMicroInteractions() {
        // Add ripple effect on button clicks
        const buttons = document.querySelectorAll('.btn, button');

        buttons.forEach(button => {
            button.addEventListener('click', function (e) {
                // Don't interfere with existing functionality
                this.style.transform = 'scale(0.98)';

                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });
    }

    // ================================================================
    // 8. UTILITY FUNCTIONS
    // ================================================================

    /**
     * Apply stagger delay to a collection of elements
     * @param {NodeList} elements - Elements to stagger
     * @param {number} delayMs - Delay between each element in milliseconds
     * @param {string} animationClass - CSS class to add
     */
    function applyStaggerAnimation(elements, delayMs, animationClass) {
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add(animationClass);
            }, index * delayMs);
        });
    }

    /**
     * Check if user prefers reduced motion
     * @returns {boolean}
     */
    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Expose utility functions globally if needed
    window.ViajeStoreAnimations = {
        applyStagger: applyStaggerAnimation,
        prefersReducedMotion: prefersReducedMotion
    };

    console.log('✅ All animations loaded successfully');

})();
