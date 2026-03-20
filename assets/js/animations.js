// assets/js/animations.js
const prefersReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initAnimations() {
  if (prefersReduceMotion || typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  revealOnScroll();
  microInteractions();
}

export function heroIntro() {
  if (prefersReduceMotion || typeof gsap === 'undefined') return;
  const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.8 } });
  tl.from('[data-animate="hero"] .hero-title', { y: 24, opacity: 0 })
    .from('[data-animate="hero"] .lead', { y: 18, opacity: 0 }, '-=0.4')
    .from('[data-animate="hero"] .hero-actions > *', { y: 16, opacity: 0, stagger: 0.1 }, '-=0.5')
    .from('[data-animate="hero"] .hero-card', { y: 30, opacity: 0, duration: 1 }, '-=0.4');
}

export function revealOnScroll() {
  if (prefersReduceMotion || typeof gsap === 'undefined') return;
  const elements = gsap.utils.toArray('.reveal, .card');
  elements.forEach(el => {
    gsap.from(el, {
      y: 24,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });
}

export function microInteractions() {
  if (prefersReduceMotion || typeof gsap === 'undefined') return;
  gsap.utils.toArray('.btn, .chip').forEach(el => {
    el.addEventListener('mouseenter', () => gsap.to(el, { y: -2, duration: 0.2, ease: 'power2.out' }));
    el.addEventListener('mouseleave', () => gsap.to(el, { y: 0, duration: 0.2, ease: 'power2.out' }));
  });
}

