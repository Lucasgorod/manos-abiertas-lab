/* =========================================================================
   MANOS ABIERTAS CON NORTE · Quiz "¿Te encaja?"
   5 preguntas · 4 perfiles · resultado dinámico con CTA personalizado
   ========================================================================= */
(function () {
    'use strict';

    // -------------------------------------------------------------
    // 1. Datos del quiz · 5 preguntas, scoring por perfil
    //    Perfiles: LAB | EDUCA | ALIADO | LEJOS
    // -------------------------------------------------------------
    const QUESTIONS = [
        {
            title: '¿Qué tipo de comunicación te <em>motiva</em>?',
            opts: [
                {
                    letter: 'A',
                    strong: 'Storytelling humano',
                    text: 'Narrativas reales, vídeo cercano, testimonios, redes sociales con propósito.',
                    score: { LAB: 4, EDUCA: 0, ALIADO: 0, LEJOS: 0 }
                },
                {
                    letter: 'B',
                    strong: 'Branding y estrategia corporativa',
                    text: 'Identidad de marca, posicionamiento, comunicación interna de empresa.',
                    score: { LAB: 0, EDUCA: 0, ALIADO: 2, LEJOS: 2 }
                },
                {
                    letter: 'C',
                    strong: 'RP, eventos y gabinete de prensa',
                    text: 'Relaciones públicas, organización de actos, vocería y prensa.',
                    score: { LAB: 1, EDUCA: 0, ALIADO: 2, LEJOS: 1 }
                },
                {
                    letter: 'D',
                    strong: 'Periodismo riguroso y datos',
                    text: 'Investigación, reportajes largos, periodismo de datos, fact-checking.',
                    score: { LAB: 2, EDUCA: 0, ALIADO: 1, LEJOS: 0 }
                }
            ]
        },
        {
            title: '¿Dónde te imaginas trabajando en <em>5 años</em>?',
            opts: [
                {
                    letter: 'A',
                    strong: 'En una ONG o fundación',
                    text: 'Quiero comunicar para causas, no para clientes.',
                    score: { LAB: 4, EDUCA: 2, ALIADO: 1, LEJOS: 0 }
                },
                {
                    letter: 'B',
                    strong: 'En una agencia o consultora',
                    text: 'Me atrae el ritmo, los clientes variados y la profesionalización.',
                    score: { LAB: 0, EDUCA: 0, ALIADO: 2, LEJOS: 2 }
                },
                {
                    letter: 'C',
                    strong: 'En el dircom de una empresa grande',
                    text: 'Me interesa la comunicación corporativa de alto nivel.',
                    score: { LAB: 0, EDUCA: 0, ALIADO: 1, LEJOS: 3 }
                },
                {
                    letter: 'D',
                    strong: 'Como freelance o con proyecto propio',
                    text: 'Quiero autonomía y elegir las causas con las que trabajo.',
                    score: { LAB: 2, EDUCA: 1, ALIADO: 2, LEJOS: 1 }
                }
            ]
        },
        {
            title: '¿Cuántas horas semanales podrías dedicar durante <em>3 meses</em>?',
            opts: [
                {
                    letter: 'A',
                    strong: '4 — 6 horas fijas',
                    text: 'Puedo comprometerme con un calendario y un equipo.',
                    score: { LAB: 3, EDUCA: 2, ALIADO: 1, LEJOS: 0 }
                },
                {
                    letter: 'B',
                    strong: 'Más de 6 horas',
                    text: 'Busco una experiencia intensiva, casi de equipo interno.',
                    score: { LAB: 4, EDUCA: 3, ALIADO: 0, LEJOS: 0 }
                },
                {
                    letter: 'C',
                    strong: '1 — 3 horas o por proyecto',
                    text: 'Prefiero colaboraciones puntuales sin compromiso semanal.',
                    score: { LAB: 0, EDUCA: 0, ALIADO: 4, LEJOS: 1 }
                },
                {
                    letter: 'D',
                    strong: 'Casi nada, estoy a tope',
                    text: 'El máster y el trabajo no me dejan margen real.',
                    score: { LAB: 0, EDUCA: 0, ALIADO: 1, LEJOS: 3 }
                }
            ]
        },
        {
            title: '¿Te interesa trabajar con <em>infancia y adolescencia</em> en contextos vulnerables?',
            opts: [
                {
                    letter: 'A',
                    strong: 'Sí, mucho. Es lo que más me motiva',
                    text: 'Quiero estar cerca de los chicos, no solo contar lo que pasa.',
                    score: { LAB: 2, EDUCA: 5, ALIADO: 0, LEJOS: 0 }
                },
                {
                    letter: 'B',
                    strong: 'Sí, pero no es mi prioridad',
                    text: 'Me parece valioso, aunque mi foco está en el oficio comunicativo.',
                    score: { LAB: 4, EDUCA: 1, ALIADO: 1, LEJOS: 0 }
                },
                {
                    letter: 'C',
                    strong: 'Prefiero comunicar para adultos o empresas',
                    text: 'Mi público natural está en otro lugar.',
                    score: { LAB: 0, EDUCA: 0, ALIADO: 2, LEJOS: 3 }
                },
                {
                    letter: 'D',
                    strong: 'Me da igual el público',
                    text: 'Lo importante es la calidad del trabajo, no a quién va dirigido.',
                    score: { LAB: 1, EDUCA: 0, ALIADO: 2, LEJOS: 1 }
                }
            ]
        },
        {
            title: '¿Estás dispuesto/a a ir <em>presencialmente</em> al Polígono Norte (Sevilla) al menos una tarde por semana?',
            opts: [
                {
                    letter: 'A',
                    strong: 'Sí, sin problema',
                    text: 'Vivo cerca o me organizo. La presencia me parece esencial.',
                    score: { LAB: 4, EDUCA: 3, ALIADO: 1, LEJOS: 0 }
                },
                {
                    letter: 'B',
                    strong: 'Esporádicamente, sí',
                    text: 'Puedo ir cada dos semanas o para coberturas concretas.',
                    score: { LAB: 2, EDUCA: 0, ALIADO: 3, LEJOS: 0 }
                },
                {
                    letter: 'C',
                    strong: 'Prefiero remoto al 100%',
                    text: 'Trabajo mejor sin desplazarme.',
                    score: { LAB: 0, EDUCA: 0, ALIADO: 1, LEJOS: 3 }
                },
                {
                    letter: 'D',
                    strong: 'No podría comprometerme con esa frecuencia',
                    text: 'Mi agenda no me lo permite ahora mismo.',
                    score: { LAB: 0, EDUCA: 0, ALIADO: 2, LEJOS: 2 }
                }
            ]
        }
    ];

    const PROFILE_ORDER = ['LAB', 'EDUCA', 'ALIADO', 'LEJOS'];

    const PROFILE_NAMES = {
        LAB: 'Lab de Comunicación',
        EDUCA: 'Voluntariado socioeducativo',
        ALIADO: 'Aliado puntual',
        LEJOS: 'Otra dirección'
    };

    const RESULTS = {
        LAB: {
            tag: 'Match alto · 90 % encaje',
            title: 'El <em>Lab te está esperando</em>.',
            lead: 'Tu perfil cuadra exacto con lo que buscamos: alguien con energía, mirada cercana y ganas de practicar comunicación con propósito en un barrio que necesita ser contado.',
            cardLabel: 'Tu mejor encaje',
            actions: [
                {
                    primary: true,
                    text: 'Conocer la propuesta y aplicar',
                    href: 'voluntariado.html'
                },
                {
                    primary: false,
                    text: 'Ver el proyecto completo',
                    href: 'index.html'
                }
            ]
        },
        EDUCA: {
            tag: 'Match parcial · vocación distinta',
            title: 'Lo tuyo no es <em>comunicar</em>… es <em>educar</em> de cerca.',
            lead: 'Tu vocación apunta más al contacto humano directo que al oficio comunicativo. Manos Abiertas también busca voluntariado socioeducativo: aula de convivencia, refuerzo escolar, talleres con familias y campamento de verano.',
            cardLabel: 'Tu mejor encaje',
            actions: [
                {
                    primary: true,
                    text: 'Conocer las áreas socioeducativas',
                    href: 'index.html#proyectos'
                },
                {
                    primary: false,
                    text: 'Ver también el Lab de comunicación',
                    href: 'voluntariado.html'
                }
            ]
        },
        ALIADO: {
            tag: 'Match desde otro lugar',
            title: 'Tu impacto puede venir <em>de otra forma</em>.',
            lead: 'Tu perfil profesional o tu disponibilidad apuntan a una colaboración más puntual: hacerte socio/a, prestar tu mirada experta como mentor/a, o difundir el proyecto desde tu red. También suma muchísimo.',
            cardLabel: 'Tu mejor encaje',
            actions: [
                {
                    primary: true,
                    text: 'Quiero colaborar',
                    href: 'index.html#transparencia'
                },
                {
                    primary: false,
                    text: 'Conocer Manos Abiertas con Norte',
                    href: 'index.html'
                }
            ]
        },
        LEJOS: {
            tag: 'Honesto: tu camino va por otro lado',
            title: 'Igual queríamos <em>contártelo</em>.',
            lead: 'Lo que hacemos en el Polígono Norte no es para todo el mundo, y eso está bien. Pero si conoces a alguien al que esto le pueda hacer click, o si quieres seguir nuestro trabajo desde lejos, también nos suma.',
            cardLabel: 'Tu mejor encaje',
            actions: [
                {
                    primary: true,
                    text: 'Conocer el proyecto igualmente',
                    href: 'index.html'
                },
                {
                    primary: false,
                    text: 'Compartirlo con alguien',
                    href: 'mailto:?subject=Manos%20Abiertas%20con%20Norte&body=Mir%C3%A1%20esto%2C%20creo%20que%20te%20puede%20interesar%3A%20https%3A%2F%2Flucasgorod.github.io%2Fmanos-abiertas-lab%2Findex.html'
                }
            ]
        }
    };

    // -------------------------------------------------------------
    // 2. Estado
    // -------------------------------------------------------------
    let current = 0;
    const answers = new Array(QUESTIONS.length).fill(null);

    // Refs
    const screens = document.querySelectorAll('.quiz__screen');
    const progressBar = document.getElementById('quiz-progress');
    const qContainer = document.getElementById('quiz-q');
    const resultContainer = document.getElementById('quiz-result');
    const backBtn = document.getElementById('quiz-back');
    const skipBtn = document.getElementById('quiz-skip');

    function setProgress(pct) {
        progressBar.style.width = pct + '%';
    }

    function showScreen(name) {
        screens.forEach(s => s.classList.toggle('is-active', s.dataset.screen === name));
        backBtn.hidden = name !== 'question';
        if (name === 'intro') setProgress(0);
        if (name === 'result') setProgress(100);
        // scroll arriba
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // -------------------------------------------------------------
    // 3. Render de pregunta
    // -------------------------------------------------------------
    function renderQuestion(idx) {
        const q = QUESTIONS[idx];
        const total = QUESTIONS.length;
        const selectedLetter = answers[idx]?.letter;

        const html = `
            <div class="quiz__q-meta">
                <span class="quiz__q-num">${String(idx + 1).padStart(2, '0')}</span>
                <span>Pregunta ${idx + 1} de ${total}</span>
            </div>
            <h2 class="quiz__q-title">${q.title}</h2>
            <div class="quiz__opts" role="radiogroup">
                ${q.opts.map((opt, i) => `
                    <button class="quiz__opt ${selectedLetter === opt.letter ? 'is-selected' : ''}"
                            role="radio"
                            aria-checked="${selectedLetter === opt.letter}"
                            data-opt-idx="${i}">
                        <span class="quiz__opt-letter">${opt.letter}</span>
                        <span class="quiz__opt-text">
                            <strong>${opt.strong}</strong>
                            ${opt.text}
                        </span>
                        <span class="quiz__opt-arrow" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                        </span>
                    </button>
                `).join('')}
            </div>
        `;

        qContainer.innerHTML = html;

        // Bind clicks
        qContainer.querySelectorAll('.quiz__opt').forEach(btn => {
            btn.addEventListener('click', () => {
                const optIdx = parseInt(btn.dataset.optIdx, 10);
                handleAnswer(idx, optIdx);
            });
        });

        // Update progress (intro=0, q1=20, q2=40, ..., q5=80, result=100)
        setProgress((idx / total) * 80 + 20);
    }

    function handleAnswer(qIdx, optIdx) {
        const q = QUESTIONS[qIdx];
        const opt = q.opts[optIdx];
        answers[qIdx] = { letter: opt.letter, score: opt.score };

        // Marcar visualmente
        qContainer.querySelectorAll('.quiz__opt').forEach((b, i) => {
            b.classList.toggle('is-selected', i === optIdx);
            b.setAttribute('aria-checked', i === optIdx ? 'true' : 'false');
        });

        // Avanzar tras un breve delay para que se vea el feedback
        setTimeout(() => {
            if (qIdx + 1 < QUESTIONS.length) {
                current = qIdx + 1;
                qContainer.classList.add('is-leaving');
                setTimeout(() => {
                    qContainer.classList.remove('is-leaving');
                    renderQuestion(current);
                }, 230);
            } else {
                showResult();
            }
        }, 280);
    }

    // -------------------------------------------------------------
    // 4. Cálculo del resultado
    // -------------------------------------------------------------
    function calculateScores() {
        const totals = { LAB: 0, EDUCA: 0, ALIADO: 0, LEJOS: 0 };
        answers.forEach(a => {
            if (!a) return;
            Object.entries(a.score).forEach(([k, v]) => { totals[k] += v; });
        });
        return totals;
    }

    function pickWinner(totals) {
        // Prioridad de desempate: LAB > EDUCA > ALIADO > LEJOS
        let best = 'LAB';
        let bestScore = -1;
        PROFILE_ORDER.forEach(p => {
            if (totals[p] > bestScore) { best = p; bestScore = totals[p]; }
        });
        return best;
    }

    // -------------------------------------------------------------
    // 5. Render del resultado
    // -------------------------------------------------------------
    function showResult() {
        const totals = calculateScores();
        const winner = pickWinner(totals);
        const result = RESULTS[winner];
        const max = Math.max(...Object.values(totals)) || 1;

        const html = `
            <div class="quiz__result-head">
                <span class="quiz__result-tag">${result.tag}</span>
                <h1 class="quiz__result-title">${result.title}</h1>
                <p class="quiz__result-lead">${result.lead}</p>
            </div>

            <div class="quiz__result-card">
                <header class="quiz__result-card-head">
                    <span class="quiz__result-card-label">${result.cardLabel}</span>
                    <span class="quiz__result-card-score">${PROFILE_NAMES[winner]}</span>
                </header>
                <div class="quiz__result-bars">
                    ${PROFILE_ORDER.map(p => {
                        const pct = Math.round((totals[p] / max) * 100);
                        const isWinner = p === winner;
                        return `
                            <div class="quiz__result-bar ${isWinner ? 'is-winner' : ''}">
                                <span class="quiz__result-bar-name">${PROFILE_NAMES[p]}</span>
                                <span class="quiz__result-bar-track">
                                    <span class="quiz__result-bar-fill" data-pct="${pct}"></span>
                                </span>
                                <span class="quiz__result-bar-pct">${totals[p]}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="quiz__result-actions">
                ${result.actions.map(a => `
                    <a href="${a.href}" class="quiz__cta ${a.primary ? '' : 'quiz__cta--secondary'}">
                        ${a.primary ? '<span class="quiz__cta-dot"></span>' : ''}
                        ${a.text}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </a>
                `).join('')}
            </div>

            <p class="quiz__result-foot">
                ¿No te convence el resultado?
                <button data-action="restart">Volver a hacer el quiz</button>
            </p>
        `;

        // Aplicar clase al contenedor según perfil
        const screen = document.querySelector('[data-screen="result"] .quiz__result');
        screen.className = 'quiz__result quiz__result--' + winner.toLowerCase();
        resultContainer.innerHTML = html;

        showScreen('result');

        // Animar las barras
        requestAnimationFrame(() => {
            setTimeout(() => {
                resultContainer.querySelectorAll('.quiz__result-bar-fill').forEach((el, i) => {
                    setTimeout(() => {
                        el.style.width = el.dataset.pct + '%';
                    }, i * 100);
                });
            }, 250);
        });

        // Bind restart button
        resultContainer.querySelector('[data-action="restart"]')?.addEventListener('click', restart);
    }

    // -------------------------------------------------------------
    // 6. Acciones
    // -------------------------------------------------------------
    function start() {
        current = 0;
        renderQuestion(current);
        showScreen('question');
    }

    function back() {
        if (current > 0) {
            current -= 1;
            qContainer.classList.add('is-leaving');
            setTimeout(() => {
                qContainer.classList.remove('is-leaving');
                renderQuestion(current);
            }, 230);
        } else {
            showScreen('intro');
        }
    }

    function restart() {
        current = 0;
        for (let i = 0; i < answers.length; i++) answers[i] = null;
        showScreen('intro');
    }

    // -------------------------------------------------------------
    // 7. Listeners
    // -------------------------------------------------------------
    document.querySelector('[data-action="start"]').addEventListener('click', start);
    backBtn.addEventListener('click', back);
    skipBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Atajos de teclado
    document.addEventListener('keydown', (e) => {
        if (e.target.matches('input, textarea, [contenteditable]')) return;

        // Números 1-4 seleccionan opción si estamos en una pregunta
        const activeScreen = document.querySelector('.quiz__screen.is-active')?.dataset.screen;
        if (activeScreen === 'question' && /^[1-4]$/.test(e.key)) {
            const optIdx = parseInt(e.key, 10) - 1;
            const opt = qContainer.querySelectorAll('.quiz__opt')[optIdx];
            opt?.click();
        }
        if (e.key === 'ArrowLeft' && activeScreen === 'question') back();
    });

    // -------------------------------------------------------------
    // 8. Init
    // -------------------------------------------------------------
    showScreen('intro');

})();
