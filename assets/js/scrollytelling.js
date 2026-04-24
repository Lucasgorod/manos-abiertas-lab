/* =============================================================================
   MANOS ABIERTAS CON NORTE · Scrollytelling editorial vanguardista
   Stack: Lenis 1.3 + GSAP 3.14 + ScrollTrigger
   Estilo: divergent entries · 3D perspective · horizontal pin · sticky image
           switcher · marquee · split reveal · character-by-character
   ============================================================================= */
(function () {
    'use strict';

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
        return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
        document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
        return;
    }

    /* ---------- LENIS ---------- */
    let lenis = null;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true, touchMultiplier: 1.6
        });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(time => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const href = a.getAttribute('href');
            if (href && href.length > 1 && document.querySelector(href)) {
                e.preventDefault();
                if (lenis) lenis.scrollTo(href, { offset: -80, duration: 1.2 });
                else document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Refresh ScrollTrigger tras scroll programático (para evitar estados rotos)
    if (lenis) {
        lenis.on('scroll', () => { /* ScrollTrigger.update ya está suscrito */ });
    }

    /* ---------- UTIL: split text por chars dentro de words ----------
       Las palabras son inline-block y no se rompen por la mitad.
       Dentro de cada palabra hay spans .char que GSAP anima. */
    function splitChars(el) {
        if (!el || el.dataset.split === 'done') return [];
        const chars = [];
        const walk = (node) => {
            const toReplace = [];
            node.childNodes.forEach(n => {
                if (n.nodeType === 3) toReplace.push(n);
                else if (n.nodeType === 1 && n.nodeName !== 'BR') walk(n);
            });
            toReplace.forEach(textNode => {
                const text = textNode.nodeValue;
                const frag = document.createDocumentFragment();
                // Tokenizar en palabras y espacios
                text.split(/(\s+)/).forEach(token => {
                    if (!token) return;
                    if (/^\s+$/.test(token)) {
                        frag.appendChild(document.createTextNode(token));
                        return;
                    }
                    const word = document.createElement('span');
                    word.className = 'word';
                    token.split('').forEach(ch => {
                        const c = document.createElement('span');
                        c.className = 'char';
                        c.textContent = ch;
                        word.appendChild(c);
                        chars.push(c);
                    });
                    frag.appendChild(word);
                });
                textNode.parentNode.replaceChild(frag, textNode);
            });
        };
        walk(el);
        el.dataset.split = 'done';
        return chars;
    }

    /* ================= GAMIFICACIÓN · Selector de disciplina =================
       Auto-rotación cada 3s hasta que el usuario haga click en un chip.
       El verbo del titular se anima morfeando al cambiar. */
    (function initDisciplinePicker() {
        const chips = gsap.utils.toArray('.hero__chip');
        const verbEl = document.querySelector('.hero__verb');
        const statusWrap = document.querySelector('.hero__picker-status');
        const statusText = document.querySelector('.hero__picker-text');
        if (!chips.length || !verbEl) return;

        const ROTATE_MS = 3000;
        let idx = 0;
        let userLocked = false;
        let timer = null;

        function setActive(newIdx, fromClick = false) {
            if (newIdx === idx && !fromClick) return;
            idx = newIdx;
            const chip = chips[idx];
            const newVerb = chip.dataset.verb;
            const newDiscipline = chip.dataset.discipline;

            // Estado visual de chips
            chips.forEach((c, i) => {
                const active = i === idx;
                c.classList.toggle('is-active', active);
                c.setAttribute('aria-selected', active ? 'true' : 'false');
            });

            // Morfología del verbo: salida hacia arriba + entrada desde abajo con blur
            gsap.timeline()
                .to(verbEl, {
                    yPercent: -55, opacity: 0, filter: 'blur(6px)',
                    duration: 0.22, ease: 'power2.in'
                })
                .call(() => { verbEl.textContent = newVerb; })
                .fromTo(verbEl,
                    { yPercent: 55, opacity: 0, filter: 'blur(6px)' },
                    { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.45, ease: 'expo.out' }
                );

            if (fromClick && !userLocked) {
                userLocked = true;
                clearInterval(timer);
                if (statusWrap) statusWrap.classList.add('is-locked');
                if (statusText) statusText.textContent = `Has elegido ${newDiscipline}. Apúntate cuando estés.`;
            }
        }

        // Auto-rotación
        timer = setInterval(() => {
            if (userLocked) return;
            setActive((idx + 1) % chips.length);
        }, ROTATE_MS);

        // Click handlers
        chips.forEach((chip, i) => {
            chip.addEventListener('click', () => setActive(i, true));
            chip.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActive(i, true);
                }
                // Flechas para navegación por teclado
                if (e.key === 'ArrowRight') { e.preventDefault(); chips[(i + 1) % chips.length].focus(); }
                if (e.key === 'ArrowLeft') { e.preventDefault(); chips[(i - 1 + chips.length) % chips.length].focus(); }
            });
        });

        // Pausar en hover (cortesía sin bloquear la interacción)
        const picker = document.querySelector('.hero__picker');
        if (picker) {
            picker.addEventListener('mouseenter', () => { if (!userLocked) clearInterval(timer); });
            picker.addEventListener('mouseleave', () => {
                if (!userLocked) {
                    timer = setInterval(() => {
                        if (userLocked) return;
                        setActive((idx + 1) % chips.length);
                    }, ROTATE_MS);
                }
            });
        }
    })();

    /* ================= HERO · ENTRADA CINEMATOGRÁFICA ================= */
    const heroTitle = document.querySelector('.hero__title');
    if (heroTitle) {
        // Solo animamos las partes estáticas (no el verbo dinámico)
        const staticParts = heroTitle.querySelectorAll('.hero__title-part');
        staticParts.forEach(part => splitChars(part));
        const chars = heroTitle.querySelectorAll('.hero__title-part .char');
        gsap.from(chars, {
            opacity: 0,
            yPercent: 80,
            rotate: () => gsap.utils.random(-10, 10),
            filter: 'blur(8px)',
            scale: 0.8,
            duration: 1.0,
            ease: 'expo.out',
            stagger: { each: 0.015, from: 'random' },
            delay: 0.2
        });
        // El verbo entra con fade + scale subtle
        const verbWrap = heroTitle.querySelector('.hero__verb-wrap');
        if (verbWrap) {
            gsap.from(verbWrap, {
                opacity: 0, yPercent: 30, scale: 0.9,
                duration: 0.8, ease: 'expo.out', delay: 0.6
            });
        }
    }

    // Picker de disciplinas entra al final de la secuencia
    gsap.from('.hero__picker', {
        y: 40, opacity: 0, duration: 0.9, ease: 'expo.out', delay: 1.3
    });
    gsap.from('.hero__curator', {
        scaleX: 0, opacity: 0, duration: 0.9, ease: 'expo.out',
        transformOrigin: 'left center', delay: 0.1
    });

    // Sala heads entran con línea dibujándose
    gsap.utils.toArray('.sala-head').forEach(head => {
        const num = head.querySelector('.sala-num');
        const div = head.querySelector('.sala-div');
        const label = head.querySelector('.sala-label');
        const tl = gsap.timeline({
            scrollTrigger: { trigger: head, start: 'top 85%', toggleActions: 'play none none reverse' }
        });
        if (num) tl.from(num, { x: -30, opacity: 0, duration: 0.7, ease: 'expo.out' }, 0);
        if (div) tl.from(div, { scaleX: 0, transformOrigin: 'left center', duration: 0.9, ease: 'expo.out' }, 0.2);
        if (label) tl.from(label, { x: 20, opacity: 0, duration: 0.6, ease: 'expo.out' }, 0.4);
    });

    // Eyebrow cae desde arriba con bounce
    gsap.from('.hero .eyebrow', {
        y: -40, opacity: 0, duration: 0.9, ease: 'back.out(1.6)', delay: 0.05
    });

    // Lead desde la derecha
    gsap.from('.hero__lead', {
        x: 60, opacity: 0, duration: 1, ease: 'expo.out', delay: 0.8
    });

    // Acciones desde abajo con escala
    gsap.from('.hero__actions > *', {
        y: 40, scale: 0.85, opacity: 0, duration: 0.8, ease: 'back.out(1.4)',
        stagger: 0.12, delay: 1
    });

    // Meta numbers desde un punto central, irradiando
    const metaItems = gsap.utils.toArray('.hero__meta-item');
    if (metaItems.length) {
        gsap.from(metaItems, {
            scale: 0, opacity: 0, rotation: -30,
            duration: 0.8, ease: 'back.out(2)',
            stagger: 0.1, delay: 1.3,
            transformOrigin: 'center center'
        });
    }

    // Cartel del hero (derecha) + stickers
    const heroPoster = document.querySelector('.hero__poster');
    if (heroPoster) {
        gsap.fromTo(heroPoster,
            { clipPath: 'inset(50% 50% 50% 50% round 160px)', scale: 0.6, rotate: 10 },
            { clipPath: 'inset(0% 0% 0% 0% round 24px)', scale: 1, rotate: -1.5,
              duration: 1.4, ease: 'expo.out', delay: 0.4 }
        );
        gsap.to(heroPoster.querySelector('img'), {
            yPercent: -6, scale: 1.06,
            ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
        });
    }

    // Sticker amarillo y tape entran con rebote en diagonales opuestas
    gsap.from('.hero__sticker', {
        scale: 0, rotate: 15, y: 80, opacity: 0,
        duration: 0.9, ease: 'back.out(1.8)', delay: 1.3
    });
    gsap.from('.hero__tape-alt', {
        scale: 0, rotate: -20, y: -60, opacity: 0,
        duration: 0.9, ease: 'back.out(1.8)', delay: 1.5
    });
    gsap.from('.hero__poster-tag', {
        x: -40, opacity: 0, rotate: 0,
        duration: 0.8, ease: 'expo.out', delay: 1.7
    });

    // Foto panorámica debajo del hero
    const heroPanorama = document.querySelector('.hero__panorama');
    if (heroPanorama) {
        gsap.fromTo(heroPanorama,
            { clipPath: 'inset(0 50% 0 50% round 24px)' },
            { clipPath: 'inset(0 0 0 0 round 24px)',
              duration: 1.4, ease: 'power4.out', immediateRender: false,
              scrollTrigger: { trigger: heroPanorama, start: 'top 85%', toggleActions: 'play none none none' } }
        );
        gsap.to(heroPanorama.querySelector('img'), {
            yPercent: -8, scale: 1.06, ease: 'none',
            scrollTrigger: { trigger: heroPanorama, start: 'top bottom', end: 'bottom top', scrub: 1.2 }
        });
        gsap.from(heroPanorama.querySelector('.hero__panorama-cap'), {
            y: 30, opacity: 0, duration: 0.8, ease: 'expo.out', delay: 0.6,
            scrollTrigger: { trigger: heroPanorama, start: 'top 80%' }
        });
    }

    // Copy hero fade out al bajar
    gsap.to('.hero__copy', {
        yPercent: 15, opacity: 0.15, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'center top', end: 'bottom top', scrub: 1 }
    });

    // Badge y tape legacy (voluntariado)
    if (document.querySelector('.hero__badge')) {
        gsap.from('.hero__badge', {
            x: -100, y: 50, rotate: -30, scale: 0, opacity: 0,
            duration: 1, ease: 'back.out(1.8)', delay: 1.8
        });
    }
    if (document.querySelector('.hero__tape')) {
        gsap.from('.hero__tape', {
            x: 100, y: -50, rotate: 30, scale: 0, opacity: 0,
            duration: 1, ease: 'back.out(1.8)', delay: 2
        });
    }
    gsap.from('.hero__star', {
        scale: 0, rotate: 180, opacity: 0,
        duration: 1.2, ease: 'elastic.out(1, 0.5)', delay: 2.2
    });

    // Indicador scroll pulsa y desaparece
    gsap.to('.hero__scroll', {
        opacity: 0, y: 30, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: '25% top', scrub: 1 }
    });

    /* ================= PROYECTOS · ENTRADA DIVERGENTE 3D ================= */
    gsap.from('.projects__head .eyebrow, .projects__head h2', {
        x: -50, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: '.projects__head', start: 'top 85%' }
    });
    gsap.from('.projects__head > p', {
        x: 50, opacity: 0, duration: 0.9, ease: 'expo.out',
        scrollTrigger: { trigger: '.projects__head', start: 'top 85%' }
    });

    gsap.utils.toArray('.project').forEach((p, i) => {
        // Card 0: izquierda · Card 1: centro con scale · Card 2: derecha
        const entryConfig = [
            { x: -220, y: 40, rotateY: 25, rotateZ: -2 },   // izq
            { x: 0, y: 80, scale: 0.7, rotateY: 0 },         // centro
            { x: 220, y: 40, rotateY: -25, rotateZ: 2 }      // dcha
        ][i % 3];

        gsap.from(p, {
            ...entryConfig,
            opacity: 0,
            duration: 1.3,
            ease: 'expo.out',
            scrollTrigger: { trigger: '.projects__grid', start: 'top 85%', toggleActions: 'play none none none' }
        });

        // Parallax del número gigante
        const num = p.querySelector('.project__num');
        if (num) {
            gsap.to(num, {
                y: -60, rotate: i % 2 === 0 ? 5 : -5, ease: 'none',
                scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: 1 }
            });
        }

        // Hover 3D tilt (microinteracción)
        p.addEventListener('mousemove', (e) => {
            const r = p.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            gsap.to(p, { rotateY: x * 10, rotateX: -y * 10, duration: 0.4, ease: 'power2.out' });
        });
        p.addEventListener('mouseleave', () => {
            gsap.to(p, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power3.out' });
        });
    });

    /* ================= HISTORIAS · STICKY EDITORIAL ================= */
    // Cada historia: imagen entra con clip-path desde direcciones alternas
    gsap.utils.toArray('.story').forEach((story, i) => {
        const img = story.querySelector('.story__img');
        const imgEl = story.querySelector('.story__img img');
        const quote = story.querySelector('.story__quote');
        const meta = story.querySelector('.story__meta');

        if (img) {
            const directions = [
                'inset(0 100% 0 0)',
                'inset(100% 0 0 0)',
                'inset(0 0 0 100%)'
            ];
            gsap.fromTo(img,
                { clipPath: directions[i % 3] },
                { clipPath: 'inset(0 0 0 0)',
                  duration: 1.4, ease: 'power4.out',
                  immediateRender: false,
                  scrollTrigger: { trigger: story, start: 'top 85%', toggleActions: 'play none none none' } }
            );
        }
        if (imgEl) {
            gsap.fromTo(imgEl, { scale: 1.4 }, {
                scale: 1, duration: 1.5, ease: 'power2.out',
                scrollTrigger: { trigger: story, start: 'top 80%' }
            });
            gsap.to(imgEl, {
                yPercent: -12, ease: 'none',
                scrollTrigger: { trigger: story, start: 'top bottom', end: 'bottom top', scrub: 1.2 }
            });
        }
        if (quote) {
            const chars = splitChars(quote);
            if (chars.length) {
                gsap.from(chars, {
                    opacity: 0, y: 20, filter: 'blur(6px)',
                    duration: 0.6, ease: 'power2.out',
                    stagger: { each: 0.008, from: i % 2 === 0 ? 'start' : 'end' },
                    scrollTrigger: { trigger: story, start: 'top 75%', toggleActions: 'play none none reverse' }
                });
            }
        }
        if (meta) {
            gsap.from(meta, {
                x: i % 2 === 0 ? -40 : 40, opacity: 0,
                duration: 0.8, ease: 'expo.out', delay: 0.3,
                scrollTrigger: { trigger: story, start: 'top 70%', toggleActions: 'play none none reverse' }
            });
        }
        // Story__more como orbital
        const more = story.querySelector('.story__more');
        if (more) {
            gsap.from(more, {
                scale: 0, rotate: 180, opacity: 0,
                duration: 0.8, ease: 'back.out(1.8)', delay: 0.5,
                scrollTrigger: { trigger: story, start: 'top 75%', toggleActions: 'play none none reverse' }
            });
        }
    });

    /* ================= CÓMO FUNCIONA · HORIZONTAL PIN ================= */
    const how = document.querySelector('.how');
    if (how) {
        // Cabecera editorial: entra split
        const howH2 = how.querySelector('h2');
        if (howH2) {
            const chars = splitChars(howH2);
            gsap.from(chars, {
                opacity: 0, yPercent: 100, rotate: (i) => gsap.utils.random(-20, 20),
                filter: 'blur(8px)',
                duration: 1, ease: 'expo.out',
                stagger: { each: 0.015, from: 'random' },
                scrollTrigger: { trigger: how, start: 'top 75%', toggleActions: 'play none none reverse' }
            });
        }
        gsap.from(how.querySelector('.eyebrow'), {
            x: -60, opacity: 0, duration: 0.8, ease: 'expo.out',
            scrollTrigger: { trigger: how, start: 'top 80%' }
        });

        // Cada step: entrada cinematográfica desde abajo con scale + rotación 3D
        gsap.utils.toArray('.step').forEach((step, i) => {
            const num = step.querySelector('.step__num');
            const title = step.querySelector('.step__title');
            const desc = step.querySelector('.step__desc');
            const tl = gsap.timeline({
                scrollTrigger: { trigger: step, start: 'top 85%', toggleActions: 'play none none reverse' }
            });
            if (num) tl.from(num, {
                scale: 0, rotateY: -180, opacity: 0, duration: 1, ease: 'back.out(1.5)',
                transformOrigin: 'center center'
            }, 0);
            if (title) tl.from(title, {
                y: 40, opacity: 0, filter: 'blur(6px)', duration: 0.7, ease: 'expo.out'
            }, 0.2);
            if (desc) tl.from(desc, {
                y: 20, opacity: 0, duration: 0.7, ease: 'expo.out'
            }, 0.35);
        });

        // Halo radial que rota con el scroll
        gsap.to(how, {
            '--halo-r': '360deg', ease: 'none',
            scrollTrigger: { trigger: how, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
        });
    }

    /* ================= STATS · ENTRADA RADIAL + COUNTER SCRUB ================= */
    gsap.utils.toArray('.stat').forEach((stat, i) => {
        const num = stat.querySelector('.stat__num');

        // Entrada radial: como explotando desde un punto central
        gsap.from(stat, {
            scale: 0.3,
            rotate: gsap.utils.random(-15, 15),
            opacity: 0,
            filter: 'blur(10px)',
            duration: 1.1,
            ease: 'expo.out',
            delay: i * 0.12,
            scrollTrigger: { trigger: '.impact__grid', start: 'top 85%', toggleActions: 'play none none reverse' }
        });

        if (num) {
            const raw = num.textContent.trim();
            const match = raw.match(/([\d.,]+)/);
            if (!match) return;
            const target = parseFloat(match[1].replace(/[.,]/g, ''));
            if (!isFinite(target)) return;
            const sup = num.querySelector('sup');
            const supHTML = sup ? sup.outerHTML : '';
            const original = num.innerHTML;
            const obj = { v: 0 };

            gsap.to(obj, {
                v: target,
                ease: 'none',
                scrollTrigger: {
                    trigger: stat, start: 'top 85%', end: 'bottom 50%',
                    scrub: 1.5,
                    onUpdate: self => {
                        num.innerHTML = Math.round(obj.v).toLocaleString('es-ES') + supHTML;
                    },
                    onLeave: () => { num.innerHTML = original; }
                }
            });
        }
    });

    gsap.from('.impact .projects__head > div > *, .impact .projects__head > p', {
        y: 40, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: '.impact', start: 'top 85%' }
    });

    /* ================= HERO META: counter scrub ================= */
    gsap.utils.toArray('.hero__meta-item .num').forEach((el, i) => {
        const raw = el.textContent.trim();
        const match = raw.match(/([\d.,]+)/);
        if (!match) return;
        const target = parseFloat(match[1].replace(/[.,]/g, ''));
        if (!isFinite(target)) return;
        const suffix = raw.replace(match[1], '');
        const obj = { v: 0 };
        gsap.to(obj, {
            v: target, duration: 2, ease: 'power2.out', snap: { v: 1 },
            delay: 1.5 + i * 0.12,
            onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; }
        });
    });

    /* ================= CTA COMUNICACIÓN · SPLIT CONVERGENTE ================= */
    const ctaComms = document.querySelector('.cta-comms');
    if (ctaComms) {
        // El bloque se forma desde ambos lados
        gsap.fromTo(ctaComms,
            { clipPath: 'inset(0 50% 0 50% round 40px)' },
            { clipPath: 'inset(0 0 0 0 round 36px)',
              duration: 1.3, ease: 'power4.out', immediateRender: false,
              scrollTrigger: { trigger: ctaComms, start: 'top 85%', toggleActions: 'play none none none' } }
        );

        // Cabecera izquierda desde la izquierda
        gsap.from('.cta-comms > div:first-child > .eyebrow, .cta-comms > div:first-child > h2', {
            x: -60, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.1, delay: 0.4,
            scrollTrigger: { trigger: ctaComms, start: 'top 80%' }
        });

        // Imagen derecha desde la derecha
        gsap.from('.cta-comms > div:last-child', {
            x: 80, opacity: 0, duration: 1, ease: 'expo.out', delay: 0.6,
            scrollTrigger: { trigger: ctaComms, start: 'top 80%' }
        });

        // Viñetas estrella aparecen una a una con rebote + rotación
        gsap.from('.cta-comms__list li', {
            x: -30, opacity: 0, scale: 0.9,
            duration: 0.6, ease: 'back.out(1.5)', stagger: 0.07, delay: 0.8,
            scrollTrigger: { trigger: ctaComms, start: 'top 75%' }
        });

        // Imagen con parallax
        const img = ctaComms.querySelector('img');
        if (img) {
            gsap.to(img, {
                yPercent: -12, scale: 1.08, ease: 'none',
                scrollTrigger: { trigger: ctaComms, start: 'top bottom', end: 'bottom top', scrub: 1.2 }
            });
        }

        // Actions desde abajo
        gsap.from('.cta-comms__actions > *', {
            y: 40, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.12, delay: 1.1,
            scrollTrigger: { trigger: ctaComms, start: 'top 75%' }
        });
    }

    /* ================= PARTNERS · MARQUEE INFINITO ================= */
    const partners = document.querySelector('.partners__list');
    if (partners && !partners.dataset.marquee) {
        partners.dataset.marquee = '1';
        const items = Array.from(partners.children);
        // Duplicar para loop infinito
        items.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            partners.appendChild(clone);
        });
        partners.classList.add('is-marquee');

        // Animación infinita
        gsap.to(partners, {
            xPercent: -50,
            duration: 28,
            ease: 'none',
            repeat: -1
        });

        // Entrada inicial
        gsap.from('.partners__label', {
            y: 20, opacity: 0, duration: 0.9, ease: 'expo.out',
            scrollTrigger: { trigger: '.partners', start: 'top 85%' }
        });
    }

    /* ================= BLOG POSTS · PERSPECTIVE FLIP ================= */
    gsap.from('.blog__head .eyebrow, .blog__head h2', {
        y: 40, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: '.blog__head', start: 'top 85%' }
    });
    gsap.from('.blog__head > p', {
        x: 40, opacity: 0, duration: 0.9, ease: 'expo.out',
        scrollTrigger: { trigger: '.blog__head', start: 'top 85%' }
    });

    gsap.utils.toArray('.post').forEach((post, i) => {
        gsap.from(post, {
            y: 80, rotateX: 45, opacity: 0, scale: 0.9,
            transformOrigin: 'center bottom',
            duration: 1, ease: 'expo.out', delay: i * 0.12,
            scrollTrigger: { trigger: '.blog__list', start: 'top 82%', toggleActions: 'play none none reverse' }
        });
    });

    /* ================= DIVIDERS · estrella rotando con scrub ================= */
    gsap.utils.toArray('.star-divider__star').forEach(star => {
        gsap.to(star, {
            rotate: 720, ease: 'none',
            scrollTrigger: { trigger: star, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
        });
    });

    /* ================= FOOTER · columnas con perspectiva ================= */
    gsap.from('.footer__brand, .footer__col', {
        y: 60, opacity: 0, rotateX: 25,
        transformOrigin: 'center top',
        duration: 0.9, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: '.footer', start: 'top 90%', toggleActions: 'play none none reverse' }
    });
    gsap.from('.newsletter', {
        y: 40, opacity: 0, scale: 0.95,
        duration: 0.9, ease: 'expo.out', delay: 0.2,
        scrollTrigger: { trigger: '.footer', start: 'top 85%' }
    });

    /* ================= PÁGINA VOLUNTARIADO ================= */
    const volHero = document.querySelector('.vol-hero');
    if (volHero) {
        const volTitle = volHero.querySelector('.vol-hero__title');
        if (volTitle) {
            const chars = splitChars(volTitle);
            gsap.from(chars, {
                opacity: 0, yPercent: 80, rotate: () => gsap.utils.random(-12, 12),
                filter: 'blur(8px)',
                duration: 1.1, ease: 'expo.out',
                stagger: { each: 0.02, from: 'random' },
                delay: 0.2
            });
        }
        gsap.from('.vol-hero__lead', { x: 50, opacity: 0, duration: 1, ease: 'expo.out', delay: 0.8 });
        gsap.from('.vol-hero__grid > div:first-child .hero__actions > *', {
            y: 40, scale: 0.85, opacity: 0, duration: 0.8, ease: 'back.out(1.4)',
            stagger: 0.1, delay: 1.2
        });

        // Collage asimétrico: cada imagen desde distinta dirección
        gsap.from('.vol-hero__visual img', {
            x: (i) => [-100, 100, -80, 80][i] || 0,
            y: (i) => [60, -50, 80, -40][i] || 0,
            scale: 0.7, opacity: 0, rotate: (i) => [(-8), 8, -5, 5][i] || 0,
            duration: 1.3, ease: 'expo.out',
            stagger: 0.15, delay: 0.5
        });
    }

    // Task cards: entrada 3D con perspective
    gsap.utils.toArray('.task').forEach((task, i) => {
        // Fila 0: izda/centro/dcha desde esas direcciones
        // Fila 1: igual
        const row = Math.floor(i / 3);
        const col = i % 3;
        const xMap = [-180, 0, 180];
        const yMap = row % 2 === 0 ? 80 : -80;

        gsap.from(task, {
            x: xMap[col],
            y: yMap,
            rotateY: xMap[col] * 0.15,
            scale: col === 1 ? 0.6 : 0.85,
            opacity: 0,
            duration: 1.1,
            ease: 'expo.out',
            delay: col * 0.08,
            scrollTrigger: { trigger: task, start: 'top 85%', toggleActions: 'play none none reverse' }
        });

        // Hover 3D
        task.addEventListener('mousemove', (e) => {
            const r = task.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            gsap.to(task, { rotateY: x * 8, rotateX: -y * 8, duration: 0.4, ease: 'power2.out' });
        });
        task.addEventListener('mouseleave', () => {
            gsap.to(task, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power3.out' });
        });
    });

    gsap.from('.tasks__head .eyebrow, .tasks__head h2', {
        x: -50, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: '.tasks__head', start: 'top 85%' }
    });
    gsap.from('.tasks__head > p', {
        x: 50, opacity: 0, duration: 0.9, ease: 'expo.out',
        scrollTrigger: { trigger: '.tasks__head', start: 'top 85%' }
    });

    // Timeline de proceso: línea progresiva + dots
    const pt = document.querySelector('.process__timeline');
    if (pt) {
        gsap.utils.toArray('.phase').forEach((phase, i) => {
            const dot = phase.querySelector('.phase__dot');
            const tl = gsap.timeline({
                scrollTrigger: { trigger: phase, start: 'top 80%', toggleActions: 'play none none reverse' }
            });
            if (dot) tl.from(dot, {
                scale: 0, rotate: 180, duration: 0.7, ease: 'back.out(2)',
                transformOrigin: 'center center'
            }, 0);
            tl.from(phase.querySelectorAll('.phase__time, h4, p'), {
                y: 40, opacity: 0, filter: 'blur(4px)',
                duration: 0.7, ease: 'expo.out', stagger: 0.08
            }, 0.15);
        });
    }

    // Perfil · bloque completo con clip-path desde ambos lados
    const profile = document.querySelector('.profile');
    if (profile) {
        gsap.fromTo(profile,
            { clipPath: 'inset(0 50% 0 50% round 40px)' },
            { clipPath: 'inset(0 0 0 0 round 36px)',
              duration: 1.3, ease: 'power4.out', immediateRender: false,
              scrollTrigger: { trigger: profile, start: 'top 85%', toggleActions: 'play none none none' } }
        );
        gsap.from('.profile__grid > div:first-child > *', {
            x: -50, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.1, delay: 0.5,
            scrollTrigger: { trigger: profile, start: 'top 80%' }
        });
        gsap.from('.profile__item', {
            x: 80, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.12, delay: 0.7,
            scrollTrigger: { trigger: '.profile__list', start: 'top 80%', toggleActions: 'play none none reverse' }
        });
    }

    // FAQ · cada detail con clip-path desde la izquierda
    if (document.querySelector('.faq details')) {
        gsap.fromTo('.faq details',
            { clipPath: 'inset(0 100% 0 0)' },
            { clipPath: 'inset(0 0 0 0)',
              duration: 0.9, ease: 'power3.out', stagger: 0.08, immediateRender: false,
              scrollTrigger: { trigger: '.faq', start: 'top 85%', toggleActions: 'play none none none' } }
        );
    }

    if (document.querySelector('.breadcrumb')) {
        gsap.from('.breadcrumb', { y: 15, opacity: 0, duration: 0.6, ease: 'power2.out', delay: 0.1 });
    }

    /* ================= NAV · auto-hide + fondo que se intensifica ================= */
    const nav = document.querySelector('.nav');
    if (nav) {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const cur = window.scrollY;
            if (cur > 200) nav.classList.toggle('nav--hidden', cur > lastScroll);
            else nav.classList.remove('nav--hidden');
            if (cur > 100) nav.classList.add('nav--scrolled');
            else nav.classList.remove('nav--scrolled');
            lastScroll = cur;
        }, { passive: true });
    }

    /* ================= Refresh tras fuentes e imágenes ================= */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());

    console.info('[Scrollytelling] Estilo editorial vanguardista activo. Escenas:', ScrollTrigger.getAll().length);
})();
