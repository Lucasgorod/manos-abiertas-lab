# Manos Abiertas con Norte — Rediseño web

Propuesta de rediseño web para **Manos Abiertas con Norte**, ONG socioeducativa del Polígono Norte de Sevilla (Red La Salle). Prototipo orientado a la captación de estudiantes de comunicación para prácticas homologadas.

Firmado por el **Lab de Comunicación e Innovación** · Curso 2025/2026.

## Stack

- HTML5 estático · CSS3 con sistema de tokens · JS vanilla
- [GSAP 3.14](https://gsap.com) + ScrollTrigger (scrollytelling)
- [Lenis 1.3](https://lenis.darkroom.engineering) (smooth scroll)
- Tipografía [Fraunces](https://fonts.google.com/specimen/Fraunces) + [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans)

## Estructura

```
prototipo/
├── index.html              · Home
├── voluntariado.html       · Página de prácticas en comunicación
└── assets/
    ├── css/styles.css      · Sistema de diseño "La Salle"
    ├── js/
    │   ├── scrollytelling.js  · GSAP + Lenis (60+ escenas)
    │   └── popup.js           · Pop-up, toast, menú, cookies
    └── img/                · Logo real, slider, carteles oficiales
```

## Desarrollo local

```bash
python -m http.server 8000
# abre http://localhost:8000
```

## Identidad visual

- **Navy** `#0F2C52` · primario lasalliano
- **Amarillo** `#F4C430` · acento estrella
- **Blanco** `#FFFFFF` · base institucional

---

© 1992–2026 Manos Abiertas con Norte · Lab de Comunicación e Innovación
