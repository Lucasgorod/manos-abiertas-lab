/* =========================================================================
   MANOS ABIERTAS CON NORTE · Presentación interactiva
   Controlador de slides, escala 16:9, QR dinámico, atajos de teclado.
   ========================================================================= */
(function () {
    'use strict';

    // -------------------------------------------------------------
    // 1. Escalado responsive del deck (1920x1080) al viewport
    // -------------------------------------------------------------
    const STAGE_W = 1920;
    const STAGE_H = 1080;
    const deck = document.getElementById('deck');

    function fitDeck() {
        const sx = window.innerWidth / STAGE_W;
        const sy = window.innerHeight / STAGE_H;
        const s = Math.min(sx, sy);
        deck.style.transform = `translate(-50%, -50%) scale(${s})`;
    }
    fitDeck();
    window.addEventListener('resize', fitDeck);

    // -------------------------------------------------------------
    // 2. Estado de slides
    // -------------------------------------------------------------
    const slides = Array.from(document.querySelectorAll('.slide'));
    const total = slides.length;
    let current = 0;

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const fsBtn = document.getElementById('fs-btn');
    const hudCurrent = document.getElementById('hud-current');
    const hudTotal = document.getElementById('hud-total');
    const progressBar = document.getElementById('progress-bar');

    hudTotal.textContent = String(total).padStart(2, '0');

    function setSlide(idx, opts = {}) {
        idx = Math.max(0, Math.min(total - 1, idx));
        if (idx === current && !opts.force) return;

        slides[current].classList.remove('is-active');
        slides[idx].classList.add('is-active');
        current = idx;

        hudCurrent.textContent = String(idx + 1).padStart(2, '0');
        progressBar.style.width = `${((idx + 1) / total) * 100}%`;

        prevBtn.disabled = idx === 0;
        nextBtn.disabled = idx === total - 1;

        // Active item en el menú
        document.querySelectorAll('.menu__item').forEach((el, i) => {
            el.classList.toggle('is-active', i === idx);
        });

        // Hooks específicos (números de slide actualizados tras reorganización)
        if (slides[idx].dataset.slide === '2') ensureQR('qr-landing', 'https://lucasgorod.github.io/manos-abiertas-lab/quiz.html', 380);
        if (slides[idx].dataset.slide === '8') animateBars(slides[idx]);
        if (slides[idx].dataset.slide === '9') animateScorecard(slides[idx]);
        if (slides[idx].dataset.slide === '10') animateFunnel(slides[idx]);
        if (slides[idx].dataset.slide === '13') animateMix();
        if (slides[idx].dataset.slide === '18') ensureQR('qr-end', 'https://lucasgorod.github.io/manos-abiertas-lab/quiz.html', 320);

        // Persistencia ligera en URL hash
        history.replaceState(null, '', `#slide-${idx + 1}`);
    }

    function next() { if (current < total - 1) setSlide(current + 1); }
    function prev() { if (current > 0) setSlide(current - 1); }

    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    // -------------------------------------------------------------
    // 3. Atajos de teclado
    // -------------------------------------------------------------
    document.addEventListener('keydown', (e) => {
        if (e.target.matches('input, textarea, [contenteditable]')) return;

        switch (e.key) {
            case 'ArrowRight':
            case 'PageDown':
            case ' ':
                e.preventDefault();
                next();
                break;
            case 'ArrowLeft':
            case 'PageUp':
                e.preventDefault();
                prev();
                break;
            case 'Home':
                e.preventDefault();
                setSlide(0);
                break;
            case 'End':
                e.preventDefault();
                setSlide(total - 1);
                break;
            case 'Escape':
                if (document.getElementById('menu').classList.contains('is-open')) {
                    closeMenu();
                } else {
                    openMenu();
                }
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                toggleFullscreen();
                break;
            default:
                // Number keys 1-9 jump to that slide
                if (/^[1-9]$/.test(e.key)) {
                    setSlide(parseInt(e.key, 10) - 1);
                }
        }
    });

    // -------------------------------------------------------------
    // 4. Pantalla completa
    // -------------------------------------------------------------
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    }
    fsBtn.addEventListener('click', toggleFullscreen);

    // -------------------------------------------------------------
    // 5. Menú / índice navegable
    // -------------------------------------------------------------
    const menu = document.getElementById('menu');
    const menuToggle = document.getElementById('menu-toggle');
    const menuClose = document.getElementById('menu-close');
    const menuList = document.getElementById('menu-list');

    // Construir menú a partir de los slides
    slides.forEach((slide, idx) => {
        const title = slide.dataset.title || `Slide ${idx + 1}`;
        const btn = document.createElement('button');
        btn.className = 'menu__item';
        btn.innerHTML = `
            <span class="menu__item-num">${String(idx + 1).padStart(2, '0')}</span>
            <span class="menu__item-title">${title}</span>
        `;
        btn.addEventListener('click', () => {
            setSlide(idx);
            closeMenu();
        });
        menuList.appendChild(btn);
    });

    function openMenu() { menu.classList.add('is-open'); }
    function closeMenu() { menu.classList.remove('is-open'); }
    menuToggle.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    menu.addEventListener('click', (e) => {
        if (e.target === menu) closeMenu();
    });

    // -------------------------------------------------------------
    // 6. Click en tarjetas del índice de la slide 2 (TOC)
    // -------------------------------------------------------------
    document.querySelectorAll('[data-go]').forEach((el) => {
        el.addEventListener('click', () => {
            const target = parseInt(el.dataset.go, 10);
            if (!isNaN(target)) setSlide(target - 1);
        });
    });

    // -------------------------------------------------------------
    // 7. Animación del modelo 70/20/10 (slide 12)
    // -------------------------------------------------------------
    // -------------------------------------------------------------
    // 7b. Animaciones de gráficos (slide 7, 8, 9)
    // -------------------------------------------------------------
    const animatedSlides = new Set();

    function animateBars(slide) {
        if (animatedSlides.has('bars')) return;
        const fills = slide.querySelectorAll('.bar__fill[data-pct]');
        fills.forEach((el, i) => {
            const pct = parseFloat(el.dataset.pct);
            setTimeout(() => { el.style.width = pct + '%'; }, 200 + i * 80);
        });
        animatedSlides.add('bars');
    }

    function animateScorecard(slide) {
        if (animatedSlides.has('scorecard')) return;
        // Anillos circulares
        const circles = slide.querySelectorAll('.score-ring__progress[data-pct]');
        circles.forEach((c, i) => {
            const pct = parseFloat(c.dataset.pct);
            const len = parseFloat(c.getAttribute('stroke-dasharray'));
            const offset = len * (1 - pct / 100);
            setTimeout(() => { c.style.strokeDashoffset = offset; }, 300 + i * 200);
        });
        // Number tickers
        const nums = slide.querySelectorAll('[data-count]');
        nums.forEach((el, i) => {
            const target = parseFloat(el.dataset.count);
            const decimals = parseInt(el.dataset.decimals || '0', 10);
            const dur = 1200;
            const start = performance.now();
            setTimeout(() => {
                requestAnimationFrame(function step(now) {
                    const t = Math.min((now - start - 300) / dur, 1);
                    if (t < 0) return requestAnimationFrame(step);
                    const eased = 1 - Math.pow(1 - t, 3);
                    el.textContent = (target * eased).toFixed(decimals);
                    if (t < 1) requestAnimationFrame(step);
                });
            }, 300 + i * 200);
        });
        // Pills criterios
        const pills = slide.querySelectorAll('.score-pill');
        pills.forEach((p, i) => {
            p.style.opacity = '0';
            p.style.transform = 'translateY(8px)';
            setTimeout(() => {
                p.style.transition = 'opacity .35s ease-out, transform .35s ease-out';
                p.style.opacity = '1';
                p.style.transform = 'translateY(0)';
            }, 100 + i * 25);
        });
        animatedSlides.add('scorecard');
    }

    function animateFunnel(slide) {
        if (animatedSlides.has('funnel')) return;
        const steps = slide.querySelectorAll('.funnel__step');
        steps.forEach((step, i) => {
            step.style.opacity = '0';
            step.style.transform = 'translateY(16px)';
            setTimeout(() => {
                step.style.transition = 'opacity .55s ease-out, transform .55s ease-out';
                step.style.opacity = '1';
                step.style.transform = 'translateY(0)';
            }, 200 + i * 150);
        });
        animatedSlides.add('funnel');
    }

    let mixAnimated = false;
    function animateMix() {
        if (mixAnimated) return;
        const story = document.getElementById('arc-story');
        const impact = document.getElementById('arc-impact');
        const conv = document.getElementById('arc-conv');
        if (!story) return;

        // dasharray total = 502.65 (2*pi*r con r=80)
        // Storytelling 70% → offset = 502.65 * (1 - .70) = 150.79
        // Impacto 20% → offset = 502.65 * (1 - .20) = 402.12
        // Conversión 10% → offset = 502.65 * (1 - .10) = 452.39

        setTimeout(() => { story.style.strokeDashoffset = '150.79'; }, 200);
        setTimeout(() => { impact.style.strokeDashoffset = '402.12'; }, 600);
        setTimeout(() => { conv.style.strokeDashoffset = '452.39'; }, 1000);

        mixAnimated = true;
    }

    // -------------------------------------------------------------
    // 8. Generación de QR (con qrcode-generator + fallback API)
    // -------------------------------------------------------------
    function ensureQR(containerId, url, size) {
        const el = document.getElementById(containerId);
        if (!el || el.dataset.rendered === 'true') return;

        try {
            if (typeof qrcode === 'function') {
                const qr = qrcode(0, 'M');
                qr.addData(url);
                qr.make();

                // Generar SVG con colores del design system
                const cells = qr.getModuleCount();
                const cellSize = Math.floor(size / cells);
                const margin = Math.floor((size - cellSize * cells) / 2);

                const svgNS = 'http://www.w3.org/2000/svg';
                const svg = document.createElementNS(svgNS, 'svg');
                svg.setAttribute('width', size);
                svg.setAttribute('height', size);
                svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
                svg.setAttribute('shape-rendering', 'crispEdges');

                // Fondo crema
                const bg = document.createElementNS(svgNS, 'rect');
                bg.setAttribute('width', size);
                bg.setAttribute('height', size);
                bg.setAttribute('fill', '#FFFFFF');
                svg.appendChild(bg);

                // Módulos
                for (let r = 0; r < cells; r++) {
                    for (let c = 0; c < cells; c++) {
                        if (qr.isDark(r, c)) {
                            const rect = document.createElementNS(svgNS, 'rect');
                            rect.setAttribute('x', margin + c * cellSize);
                            rect.setAttribute('y', margin + r * cellSize);
                            rect.setAttribute('width', cellSize);
                            rect.setAttribute('height', cellSize);
                            rect.setAttribute('fill', '#0F2C52');
                            svg.appendChild(rect);
                        }
                    }
                }

                el.innerHTML = '';
                el.appendChild(svg);
                el.removeAttribute('data-loading');
                el.dataset.rendered = 'true';
                return;
            }
        } catch (err) {
            console.warn('qrcode-generator falló, usando fallback', err);
        }

        // Fallback: usar API de qrserver.com (necesita internet)
        const img = document.createElement('img');
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&color=0F2C52&bgcolor=FFFFFF&qzone=2&data=${encodeURIComponent(url)}`;
        img.alt = 'QR a la landing de Manos Abiertas con Norte';
        img.onload = () => {
            el.removeAttribute('data-loading');
            el.dataset.rendered = 'true';
        };
        el.innerHTML = '';
        el.appendChild(img);
    }

    // -------------------------------------------------------------
    // 9. Inicialización + URL hash
    // -------------------------------------------------------------
    function initFromHash() {
        const m = window.location.hash.match(/^#slide-(\d+)$/);
        if (m) {
            const idx = parseInt(m[1], 10) - 1;
            if (idx >= 0 && idx < total) {
                setSlide(idx, { force: true });
                return;
            }
        }
        setSlide(0, { force: true });
    }

    // Esperar a que las libs cargadas con `defer` estén disponibles antes
    // de generar QRs si el usuario salta directo a slide 15/18
    window.addEventListener('load', () => {
        initFromHash();
    });

    // -------------------------------------------------------------
    // 10. Click en deck → avanzar (cómodo en presentaciones)
    //     Excepto en elementos interactivos
    // -------------------------------------------------------------
    deck.addEventListener('click', (e) => {
        // Ignorar clicks sobre elementos con data-go (índice TOC) o botones
        if (e.target.closest('[data-go], button, a, .qr-block, .end__qr')) return;
        next();
    });

})();
