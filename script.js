'use strict';


/* ============================================================
   NAVIGATION — scroll state
   ============================================================ */
const nav = document.getElementById('nav');

function syncNav() {
  nav.classList.toggle('scrolled', window.scrollY > 64);
}
window.addEventListener('scroll', syncNav, { passive: true });
syncNav();

/* ============================================================
   HAMBURGER / DRAWER MENU
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('nav-menu');
const navLinks  = navMenu.querySelectorAll('.nav__link');

function closeMenu() {
  hamburger.classList.remove('open');
  navMenu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  const opening = !navMenu.classList.contains('open');
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(opening));
  document.body.style.overflow = opening ? 'hidden' : '';
});

navLinks.forEach(link => link.addEventListener('click', closeMenu));

document.addEventListener('click', e => {
  if (!nav.contains(e.target)) closeMenu();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

/* ============================================================
   SMOOTH SCROLL — anchor links (fallback for older browsers)
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 8;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================================
   GSAP ANIMATIONS
   ============================================================ */
if (typeof gsap !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Desktop: desloca imagem para a direita — rosto sai de trás do texto
  if (window.innerWidth >= 768) {
    gsap.set('.hero__img', { xPercent: 14 });
  }

  /* ----------------------------------------------------------
     HERO — entrada encadeada
  ---------------------------------------------------------- */
  const heroTL = gsap.timeline({ delay: 0.1 });

  // Foto: Ken Burns (zoom-out sutil)
  heroTL.from('.hero__img', {
    scale: 1.07,
    duration: 2.6,
    ease: 'power2.out',
  }, 0);

  // Badge: desliza da esquerda
  heroTL.fromTo('.hero__badge',
    { opacity: 0, x: -32, y: 0 },
    { opacity: 1, x: 0, y: 0, duration: 0.65, ease: 'power3.out' },
    0.35
  );

  // Título: SplitText palavra por palavra
  // Spans filhos são invisíveis imediatamente; pai (.reveal, opacity:0) é aberto no timeline.
  const titleSplit = new SplitText('.hero__title', { type: 'words' });
  gsap.set(titleSplit.words, { opacity: 0, y: 48, rotateX: -20 });
  heroTL.set('.hero__title', { opacity: 1, y: 0 }, 0.44);
  heroTL.to(titleSplit.words,
    { opacity: 1, y: 0, rotateX: 0, duration: 0.72, stagger: 0.1, ease: 'power4.out', transformPerspective: 500 },
    0.45
  );

  // Slogan: desliza da esquerda com delay
  heroTL.fromTo('.hero__slogan',
    { opacity: 0, x: -22, y: 0 },
    { opacity: 1, x: 0, y: 0, duration: 0.65, ease: 'power3.out' },
    0.85
  );

  // Botão CTA: sobe com bounce
  heroTL.fromTo('.hero__body .btn--gold',
    { opacity: 0, y: 22 },
    { opacity: 1, y: 0, duration: 0.58, ease: 'back.out(1.8)' },
    1.0
  );

  // Scroll hint: fade in por último
  heroTL.fromTo('.hero__scroll-hint',
    { opacity: 0 },
    { opacity: 1, duration: 0.55 },
    1.3
  );

  /* ----------------------------------------------------------
     PARALLAX — foto do hero ao rolar
  ---------------------------------------------------------- */
  gsap.to('.hero__img', {
    yPercent: 28,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });

  /* ----------------------------------------------------------
     PROPOSAL CARDS — batch com stagger em grupo
  ---------------------------------------------------------- */
  ScrollTrigger.batch('.proposal-card', {
    onEnter: batch => gsap.to(batch, {
      opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
    }),
    start: 'top 88%',
  });

  /* ----------------------------------------------------------
     ABOUT — foto da esquerda, bio da direita
  ---------------------------------------------------------- */
  gsap.fromTo('.about__photo-wrap',
    { opacity: 0, x: -56, y: 0 },
    {
      opacity: 1, x: 0, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: {
        trigger: '.about__grid', start: 'top 82%',
        toggleActions: 'play none none none',
      },
    }
  );
  gsap.fromTo('.about__bio',
    { opacity: 0, x: 56, y: 0 },
    {
      opacity: 1, x: 0, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: {
        trigger: '.about__grid', start: 'top 82%',
        toggleActions: 'play none none none',
      },
    }
  );

  /* ----------------------------------------------------------
     TIMELINE — itens em cascata da esquerda
     gsap.set define o estado inicial; to() persiste após rolar.
  ---------------------------------------------------------- */
  gsap.set('.trajectory__item', { opacity: 0, x: -36 });
  ScrollTrigger.batch('.trajectory__item', {
    onEnter: batch => gsap.to(batch, {
      opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
    }),
    start: 'top 90%',
  });

  /* ----------------------------------------------------------
     RESTANTE DOS REVEALS — ScrollTrigger individual
  ---------------------------------------------------------- */
  const handledEls = new Set([
    ...document.querySelectorAll(
      '#hero .reveal, .proposal-card, .trajectory__item, .about__photo-wrap, .about__bio'
    ),
  ]);

  gsap.utils.toArray('.reveal').filter(el => !handledEls.has(el)).forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });
}
