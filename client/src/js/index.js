/* ── Dropdown header ── */
const profileBtn = document.getElementById('header-profile');
const dropdown   = document.getElementById('header-dropdown');

profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = dropdown.classList.toggle('open');
    profileBtn.classList.toggle('open', open);
});
document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    profileBtn.classList.remove('open');
});

/* ── Scroll reveal ── */
const revealEls = document.querySelectorAll('.reveal');
const revObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); }
    });
}, { threshold: 0.12 });
revealEls.forEach(el => revObs.observe(el));

/* ── Team Carousel ── */
const carousel = document.getElementById('team-carousel');
const prevBtn  = document.getElementById('carousel-prev');
const nextBtn  = document.getElementById('carousel-next');
const dotsWrap = document.getElementById('carousel-dots');
const cards    = Array.from(carousel.querySelectorAll('.team-card'));

let currentPage = 0;
let isDragging = false;
let startX = 0;
let startScrollLeft = 0;
let lastX = 0;
let lastTime = 0;
let velocity = 0;
let momentumFrame = null;

function visibleCount() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return 2;
    return 4;
}

function pageCount() {
    return Math.ceil(cards.length / visibleCount());
}

function cardStep() {
    return cards[0].offsetWidth + 16;
}

function pageWidth() {
    return visibleCount() * cardStep();
}

function clampPage(page) {
    return Math.max(0, Math.min(page, pageCount() - 1));
}

function updateCarouselState() {
    currentPage = clampPage(Math.round(carousel.scrollLeft / pageWidth()));

    dotsWrap.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentPage);
    });

    prevBtn.disabled = carousel.scrollLeft <= 4;
    nextBtn.disabled = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 4;
}

function buildDots() {
    dotsWrap.innerHTML = '';

    for (let i = 0; i < pageCount(); i++) {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot' + (i === currentPage ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
    }
}

function stopAnimation() {
    if (momentumFrame !== null) {
        cancelAnimationFrame(momentumFrame);
        momentumFrame = null;
    }
}

function animateScrollTo(target, duration = 420) {
    stopAnimation();

    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    const safeTarget = Math.max(0, Math.min(target, maxScroll));
    const start = carousel.scrollLeft;
    const diff = safeTarget - start;
    const startTime = performance.now();
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

    const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        carousel.scrollLeft = start + diff * easeOutCubic(progress);
        updateCarouselState();

        if (progress < 1) {
            momentumFrame = requestAnimationFrame(step);
        } else {
            momentumFrame = null;
        }
    };

    momentumFrame = requestAnimationFrame(step);
}

function goTo(page) {
    currentPage = clampPage(page);
    animateScrollTo(currentPage * pageWidth());
}

function applyMomentum() {
    stopAnimation();

    const step = () => {
        if (Math.abs(velocity) < 0.15) {
            velocity = 0;
            momentumFrame = null;
            updateCarouselState();
            return;
        }

        carousel.scrollLeft -= velocity * 18;

        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        if (carousel.scrollLeft <= 0 || carousel.scrollLeft >= maxScroll) {
            velocity = 0;
            momentumFrame = null;
            updateCarouselState();
            return;
        }

        velocity *= 0.95;
        updateCarouselState();
        momentumFrame = requestAnimationFrame(step);
    };

    momentumFrame = requestAnimationFrame(step);
}

function stopDrag() {
    if (!isDragging) return;
    isDragging = false;
    carousel.classList.remove('dragging');
    applyMomentum();
}

prevBtn.addEventListener('click', () => goTo(currentPage - 1));
nextBtn.addEventListener('click', () => goTo(currentPage + 1));

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

carousel.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const now = performance.now();
    const dx = e.pageX - lastX;
    const dt = now - lastTime || 16;

    carousel.scrollLeft = startScrollLeft - (e.pageX - startX);
    velocity = dx / dt;
    lastX = e.pageX;
    lastTime = now;
});

carousel.addEventListener('mouseup', stopDrag);
carousel.addEventListener('mouseleave', stopDrag);

carousel.addEventListener('touchstart', (e) => {
    stopAnimation();
    isDragging = true;
    startX = e.touches[0].pageX;
    startScrollLeft = carousel.scrollLeft;
    lastX = e.touches[0].pageX;
    lastTime = performance.now();
    velocity = 0;
    carousel.classList.add('dragging');
}, { passive: true });

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

carousel.addEventListener('touchend', stopDrag);
carousel.addEventListener('touchcancel', stopDrag);
carousel.addEventListener('scroll', updateCarouselState);

window.addEventListener('resize', () => {
    currentPage = clampPage(currentPage);
    buildDots();
    carousel.scrollLeft = currentPage * pageWidth();
    updateCarouselState();
});

buildDots();
carousel.scrollLeft = 0;
updateCarouselState();

/* ── Avatar team: iniziale stilizzata ── */
document.querySelectorAll('.team-card').forEach((card, i) => {
    const nome    = card.querySelector('.team-name').textContent.trim();
    const avatar  = card.querySelector('.team-avatar');
    avatar.textContent = nome.charAt(0).toUpperCase();
    avatar.classList.add(`color-${(i % 6) + 1}`);
});

/* ── Animazione mockup al viewport ── */
const mockupFrame = document.querySelector('.mockup-frame');

if (mockupFrame) {
    const mockObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            /* barre: crescono una dopo l'altra */
            entry.target.querySelectorAll('.mock-bar').forEach((bar, i) => {
                const h = bar.dataset.h || 50;
                bar.style.height = h + '%';
                setTimeout(() => bar.classList.add('animated'), i * 80);
            });

            /* righe eventi: scivolano da sinistra */
            entry.target.querySelectorAll('.mock-event').forEach((ev, i) => {
                setTimeout(() => ev.classList.add('animated'), 450 + i * 120);
            });

            mockObs.unobserve(entry.target);
        });
    }, { threshold: 0.3 });

    mockObs.observe(mockupFrame);
}

/* ── FAQ toggle ── */
document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');

        item.classList.toggle('open', !isOpen);
        btn.setAttribute('aria-expanded', String(!isOpen));
    });
});