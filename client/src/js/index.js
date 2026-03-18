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

function visibleCount() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return 2;
    return 4;
}

function pageCount() {
    return Math.ceil(cards.length / visibleCount());
}

function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < pageCount(); i++) {
        const d = document.createElement('div');
        d.className = 'carousel-dot' + (i === currentPage ? ' active' : '');
        d.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(d);
    }
}

function goTo(page) {
    currentPage = Math.max(0, Math.min(page, pageCount() - 1));
    const vc     = visibleCount();
    const cardW  = cards[0].offsetWidth + 16;
    carousel.scrollTo({ left: currentPage * vc * cardW, behavior: 'smooth' });

    dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentPage);
    });
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage >= pageCount() - 1;
}

prevBtn.addEventListener('click', () => goTo(currentPage - 1));
nextBtn.addEventListener('click', () => goTo(currentPage + 1));

buildDots();
goTo(0);
window.addEventListener('resize', () => { buildDots(); goTo(0); });
