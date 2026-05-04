/* ── Dropdown header ── */
// Recupera il pulsante del profilo e il menu dropdown dall'HTML
const profileBtn = document.getElementById('header-profile');
const dropdown   = document.getElementById('header-dropdown');

// Al click sul pulsante profilo: attiva/disattiva la classe 'open' sul dropdown
// e sincronizza la stessa classe sul pulsante (es. per ruotare la freccia chevron)
// stopPropagation evita che il click si propaghi al documento e richiuda subito il menu
profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = dropdown.classList.toggle('open');
    profileBtn.classList.toggle('open', open);
});

// Click ovunque nel documento → chiude il dropdown rimuovendo 'open' da entrambi gli elementi
document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    profileBtn.classList.remove('open');
});

/* ── Scroll reveal ── */
// Seleziona tutti gli elementi con classe 'reveal' (sezioni, card, testi, ecc.)
const revealEls = document.querySelectorAll('.reveal');

// Crea un IntersectionObserver: osserva quando un elemento entra nel viewport
// threshold: 0.12 → scatta quando almeno il 12% dell'elemento è visibile
const revObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        // Aggiunge 'visible' per triggerare l'animazione CSS, poi smette di osservare l'elemento
        if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); }
    });
}, { threshold: 0.12 });

// Avvia l'osservazione per ogni elemento '.reveal'
revealEls.forEach(el => revObs.observe(el));

/* ── Team Carousel ── */
// Riferimenti agli elementi del carosello dei membri del team
const carousel = document.getElementById('team-carousel');
const prevBtn  = document.getElementById('carousel-prev');
const nextBtn  = document.getElementById('carousel-next');
const dotsWrap = document.getElementById('carousel-dots');
const cards    = Array.from(carousel.querySelectorAll('.team-card'));

// Stato del carosello
let currentPage = 0;       // Pagina corrente
let isDragging = false;    // Indica se l'utente sta trascinando
let startX = 0;            // Posizione X iniziale del drag
let startScrollLeft = 0;   // scrollLeft del carousel all'inizio del drag
let lastX = 0;             // Ultima posizione X rilevata (per calcolare velocità)
let lastTime = 0;          // Timestamp dell'ultimo evento (per calcolare velocità)
let velocity = 0;          // Velocità istantanea del drag (px/ms)
let momentumFrame = null;  // ID del requestAnimationFrame per l'inerzia/animazione

// Restituisce quante card sono visibili contemporaneamente in base alla larghezza finestra
function visibleCount() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return 2;
    return 4;
}

// Calcola il numero totale di "pagine" del carosello
function pageCount() {
    return Math.ceil(cards.length / visibleCount());
}

// Calcola la larghezza di una singola card + gap (16px) per sapere di quanto scorrere
function cardStep() {
    return cards[0].offsetWidth + 16;
}

// Calcola la larghezza totale di una "pagina" (visibleCount card + gap)
function pageWidth() {
    return visibleCount() * cardStep();
}

// Limita il numero di pagina tra 0 e l'ultima pagina disponibile
function clampPage(page) {
    return Math.max(0, Math.min(page, pageCount() - 1));
}

// Aggiorna lo stato visivo del carosello:
// - ricalcola currentPage in base allo scrollLeft attuale
// - aggiorna il dot attivo
// - disabilita i pulsanti prev/next ai bordi
function updateCarouselState() {
    currentPage = clampPage(Math.round(carousel.scrollLeft / pageWidth()));

    dotsWrap.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentPage);
    });

    prevBtn.disabled = carousel.scrollLeft <= 4;
    nextBtn.disabled = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 4;
}

// Crea i pallini di navigazione (dots) in base al numero di pagine
// Svuota i dots esistenti e li rigenera; al click su un dot va alla pagina corrispondente
function buildDots() {
    dotsWrap.innerHTML = '';

    for (let i = 0; i < pageCount(); i++) {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot' + (i === currentPage ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
    }
}

// Cancella l'animazione requestAnimationFrame in corso (inerzia o scorrimento automatico)
function stopAnimation() {
    if (momentumFrame !== null) {
        cancelAnimationFrame(momentumFrame);
        momentumFrame = null;
    }
}

// Anima lo scorrimento del carosello verso una posizione target con easing easeOutCubic
// duration: durata in ms dell'animazione (default 10ms = molto rapida)
function animateScrollTo(target, duration = 10) {
    stopAnimation();

    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    const safeTarget = Math.max(0, Math.min(target, maxScroll)); // clamp entro i limiti
    const start = carousel.scrollLeft;
    const diff = safeTarget - start;
    const startTime = performance.now();

    // Curva di decelerazione cubica: parte veloce, rallenta alla fine
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

    const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        carousel.scrollLeft = start + diff * easeOutCubic(progress);
        updateCarouselState();

        // Continua l'animazione finché non è completata
        if (progress < 1) {
            momentumFrame = requestAnimationFrame(step);
        } else {
            momentumFrame = null;
        }
    };

    momentumFrame = requestAnimationFrame(step);
}

// Porta il carosello alla pagina indicata (usato da prev/next/dots )
function goTo(page) {
    currentPage = clampPage(page);
    animateScrollTo(currentPage * pageWidth());
}

// Simula l'inerzia dopo il rilascio del drag:
// decrementa progressivamente la velocità e scorre il carosello finché non si ferma
function applyMomentum() {
    stopAnimation();

    const step = () => {
        // Ferma l'inerzia sotto una soglia minima di velocità
        if (Math.abs(velocity) < 0.15) {
            velocity = 0;
            momentumFrame = null;
            updateCarouselState();
            return;
        }

        carousel.scrollLeft -= velocity * 18; // Applica lo spostamento proporzionale alla velocità

        // Ferma l'inerzia se si raggiunge un bordo del carosello
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        if (carousel.scrollLeft <= 0 || carousel.scrollLeft >= maxScroll) {
            velocity = 0;
            momentumFrame = null;
            updateCarouselState();
            return;
        }

        velocity *= 0.95; // Attrizione: riduce la velocità del 5% ad ogni frame
        updateCarouselState();
        momentumFrame = requestAnimationFrame(step);
    };

    momentumFrame = requestAnimationFrame(step);
}

// Termina il drag (mouse o touch): rimuove la classe CSS 'dragging' e avvia l'inerzia
function stopDrag() {
    if (!isDragging) return;
    isDragging = false;
    carousel.classList.remove('dragging');
    applyMomentum();
}

// Pulsanti freccia: navigano alla pagina precedente o successiva
prevBtn.addEventListener('click', () => goTo(currentPage - 1));
nextBtn.addEventListener('click', () => goTo(currentPage + 1));

// ── Drag con mouse ──
// mousedown: inizia il drag, salva posizione iniziale e azzera velocità
carousel.addEventListener('mousedown', (e) => {
    stopAnimation();
    isDragging = true;
    startX = e.pageX;
    startScrollLeft = carousel.scrollLeft;
    lastX = e.pageX;
    lastTime = performance.now();
    velocity = 0;
    carousel.classList.add('dragging');
});

// mousemove: aggiorna scrollLeft e calcola la velocità istantanea (px/ms)
carousel.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Evita selezione testo durante il drag

    const now = performance.now();
    const dx = e.pageX - lastX;           // Spostamento dall'ultimo frame
    const dt = now - lastTime || 16;      // Tempo trascorso (fallback 16ms se 0)

    carousel.scrollLeft = startScrollLeft - (e.pageX - startX); // Scorrimento diretto
    velocity = dx / dt; // Velocità = spostamento / tempo
    lastX = e.pageX;
    lastTime = now;
});

// mouseup / mouseleave: termina il drag
carousel.addEventListener('mouseup', stopDrag);
carousel.addEventListener('mouseleave', stopDrag);

// ── Drag touch (mobile) ──
// touchstart: equivalente di mousedown per il touch
carousel.addEventListener('touchstart', (e) => {
    stopAnimation();
    isDragging = true;
    startX = e.touches[0].pageX;
    startScrollLeft = carousel.scrollLeft;
    lastX = e.touches[0].pageX;
    lastTime = performance.now();
    velocity = 0;
    carousel.classList.add('dragging');
}, { passive: true }); // passive: true → migliora le performance su mobile

// touchmove: equivalente di mousemove per il touch
carousel.addEventListener('touchmove', (e) => {
    if (!isDragging) return;

    const now = performance.now();
    const x = e.touches[0].pageX;
    const dx = x - lastX;
    const dt = now - lastTime || 16;

    carousel.scrollLeft = startScrollLeft - (x - startX);
    velocity = dx / dt;
    lastX = x;
    lastTime = now;
}, { passive: true });

// touchend / touchcancel: termina il drag touch
carousel.addEventListener('touchend', stopDrag);
carousel.addEventListener('touchcancel', stopDrag);

// Aggiorna lo stato del carosello ad ogni evento scroll (es. scroll nativo da trackpad)
carousel.addEventListener('scroll', updateCarouselState);

// Al resize della finestra: ricalcola dots e riposiziona il carosello sulla pagina corrente
window.addEventListener('resize', () => {
    currentPage = clampPage(currentPage);
    buildDots();
    carousel.scrollLeft = currentPage * pageWidth();
    updateCarouselState();
});

// Inizializzazione: costruisce i dots, porta il carosello all'inizio e aggiorna i pulsanti
buildDots();
carousel.scrollLeft = 0;
updateCarouselState();

/* ── Avatar team: iniziale stilizzata ── */
// Per ogni team-card: estrae la prima lettera del nome e la usa come avatar testuale
// Assegna una classe colore ciclica (color-1 … color-6) per differenziare gli avatar
document.querySelectorAll('.team-card').forEach((card, i) => {
    const nome    = card.querySelector('.team-name').textContent.trim();
    const avatar  = card.querySelector('.team-avatar');
    avatar.textContent = nome.charAt(0).toUpperCase();
    avatar.classList.add(`color-${(i % 6) + 1}`);
});

/* ── Animazione mockup al viewport ── */
// Osserva il mockup della dashboard (sezione "about") con IntersectionObserver
// Quando entra nel viewport (almeno 30% visibile), avvia le animazioni interne
const mockupFrame = document.querySelector('.mockup-frame');

if (mockupFrame) {
    const mockObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            // Barre del grafico: imposta l'altezza da data-h e le anima in sequenza (80ms di delay tra l'una e l'altra)
            entry.target.querySelectorAll('.mock-bar').forEach((bar, i) => {
                const h = bar.dataset.h || 50;
                bar.style.height = h + '%';
                setTimeout(() => bar.classList.add('animated'), i * 80);
            });

            // Righe degli esami: scivolano da sinistra con delay progressivo (partono dopo 450ms)
            entry.target.querySelectorAll('.mock-event').forEach((ev, i) => {
                setTimeout(() => ev.classList.add('animated'), 450 + i * 120);
            });

            // Smette di osservare dopo la prima animazione (non si ripete)
            mockObs.unobserve(entry.target);
        });
    }, { threshold: 0.3 });

    mockObs.observe(mockupFrame);
}

/* ── FAQ toggle ── */
// Per ogni domanda FAQ: al click apre/chiude la risposta corrispondente
// Aggiorna anche aria-expanded per l'accessibilità
document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');

        // Toggling: se era aperta la chiude, e viceversa
        item.classList.toggle('open', !isOpen);
        btn.setAttribute('aria-expanded', String(!isOpen));
    });
});