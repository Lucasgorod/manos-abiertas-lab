/* Manos Abiertas con Norte — interacciones del prototipo */
(function () {
    'use strict';

    const POPUP_DELAY_MS = 15000;
    const STICKY_DELAY_MS = 4000;

    /* ---------- Pop-up de prácticas ---------- */
    const popup = document.getElementById('popup-practicas');
    const openers = document.querySelectorAll('[data-popup-open]');
    const closers = document.querySelectorAll('[data-popup-close]');
    const form = document.getElementById('popup-form');
    const progress = document.querySelectorAll('.popup__progress span');
    const success = document.querySelector('.popup__success');
    const body = document.querySelector('.popup__body');
    const stickyCta = document.querySelector('.sticky-cta');
    let lastFocused = null;

    function openPopup() {
        if (!popup) return;
        lastFocused = document.activeElement;
        popup.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        const firstInput = popup.querySelector('input');
        if (firstInput) setTimeout(() => firstInput.focus(), 300);
    }

    function closePopup() {
        if (!popup) return;
        popup.classList.remove('is-open');
        document.body.style.overflow = '';
        if (lastFocused) lastFocused.focus();
    }

    // Auto-open tras 15s en cada carga (incluido F5)
    if (popup) {
        setTimeout(openPopup, POPUP_DELAY_MS);
    }

    // Sticky CTA visible tras delay
    if (stickyCta) {
        setTimeout(() => stickyCta.classList.add('is-visible'), STICKY_DELAY_MS);
    }

    openers.forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault(); openPopup();
    }));
    closers.forEach(btn => btn.addEventListener('click', closePopup));

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popup && popup.classList.contains('is-open')) {
            closePopup();
        }
    });

    // Focus trap dentro del popup
    if (popup) {
        popup.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            const focusables = popup.querySelectorAll('button, input, a, [tabindex]:not([tabindex="-1"])');
            if (!focusables.length) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                last.focus(); e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === last) {
                first.focus(); e.preventDefault();
            }
        });
    }

    // Barra de progreso del formulario
    if (form && progress.length) {
        const inputs = form.querySelectorAll('input[required]');
        const submitBtn = form.querySelector('button[type="submit"]');

        const updateProgress = () => {
            const filled = Array.from(inputs).filter(i => {
                if (i.type === 'checkbox') return i.checked;
                if (i.type === 'email') return i.value.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value);
                return i.value.trim().length > 0;
            }).length;
            progress.forEach((s, idx) => {
                s.classList.remove('is-current', 'is-done');
                if (idx < filled) s.classList.add('is-done');
                else if (idx === filled) s.classList.add('is-current');
            });
        };
        inputs.forEach(i => i.addEventListener('input', updateProgress));
        inputs.forEach(i => i.addEventListener('change', updateProgress));
        updateProgress();

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!form.checkValidity()) {
                const firstInvalid = form.querySelector(':invalid');
                if (firstInvalid) firstInvalid.focus();
                return;
            }
            // Loading state
            if (submitBtn) submitBtn.classList.add('is-loading');
            submitBtn.disabled = true;

            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.classList.remove('is-loading');
                    submitBtn.disabled = false;
                }
                if (body) body.style.display = 'none';
                if (success) success.classList.add('is-active');
                showToast('¡Candidatura enviada! Te escribimos en 48h.');

                setTimeout(() => {
                    closePopup();
                    setTimeout(() => {
                        if (body) body.style.display = '';
                        if (success) success.classList.remove('is-active');
                        form.reset();
                        updateProgress();
                    }, 400);
                }, 3200);
            }, 1100);
        });
    }

    /* ---------- Reveal al hacer scroll ---------- */
    const revealElements = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window && revealElements.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
        revealElements.forEach(el => io.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('is-visible'));
    }

    /* ---------- Contador animado de stats (solo si GSAP no está disponible) ---------- */
    if (typeof gsap === 'undefined') {
        const stats = document.querySelectorAll('.stat__num, .hero__meta-item .num');
        function animateCount(el) {
            const rawText = el.textContent.trim();
            const match = rawText.match(/([\d.,]+)(.*)/s);
            if (!match) return;
            const finalNum = parseFloat(match[1].replace(/[.,]/g, ''));
            const suffix = el.innerHTML.substring(rawText.indexOf(match[1]) + match[1].length);
            if (!isFinite(finalNum)) return;
            const duration = 1400, steps = 36, increment = finalNum / steps;
            let current = 0, count = 0;
            const original = el.innerHTML;
            const timer = setInterval(() => {
                current += increment; count++;
                if (count >= steps) { el.innerHTML = original; clearInterval(timer); }
                else el.innerHTML = Math.floor(current).toLocaleString('es-ES') + suffix;
            }, duration / steps);
        }
        if ('IntersectionObserver' in window && stats.length) {
            const statIO = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCount(entry.target); statIO.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            stats.forEach(s => statIO.observe(s));
        }
    }

    /* ---------- Scroll progress bar ---------- */
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        let ticking = false;
        const update = () => {
            const scrolled = window.scrollY;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const ratio = max > 0 ? scrolled / max : 0;
            progressBar.style.transform = `scaleX(${ratio})`;
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
    }

    /* ---------- Cookie banner ---------- */
    const cookies = document.getElementById('cookie-banner');
    if (cookies && !localStorage.getItem('ma-cookies')) {
        setTimeout(() => cookies.classList.add('is-visible'), 1500);
        cookies.querySelectorAll('[data-cookie]').forEach(btn => {
            btn.addEventListener('click', () => {
                localStorage.setItem('ma-cookies', btn.dataset.cookie);
                cookies.classList.remove('is-visible');
                showToast(btn.dataset.cookie === 'aceptar'
                    ? 'Preferencias guardadas. Gracias.'
                    : 'Solo cookies esenciales activas.');
            });
        });
    }

    /* ---------- Newsletter ---------- */
    const nlForm = document.getElementById('newsletter-form');
    const nlOk = document.getElementById('nl-ok');
    if (nlForm) {
        nlForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = nlForm.querySelector('input[type="email"]');
            if (!email || !email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                email.focus();
                showToast('Necesitamos un correo válido.');
                return;
            }
            nlForm.style.display = 'none';
            if (nlOk) nlOk.classList.add('is-active');
            showToast('Suscrito al boletín. Bienvenida.');
        });
    }

    /* ---------- Toast ---------- */
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');
    let toastTimer = null;
    function showToast(msg) {
        if (!toast) return;
        if (toastText) toastText.textContent = msg;
        toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4000);
    }

    /* ---------- Menú hamburguesa ---------- */
    const toggle = document.querySelector('.nav__toggle');
    const menu = document.querySelector('.nav__menu');
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('is-open');
            const expanded = menu.classList.contains('is-open');
            toggle.setAttribute('aria-expanded', expanded);
        });
    }

    /* ---------- Cerrar menú al hacer click fuera ---------- */
    document.addEventListener('click', (e) => {
        if (menu && menu.classList.contains('is-open') &&
            !menu.contains(e.target) && !toggle.contains(e.target)) {
            menu.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
})();
