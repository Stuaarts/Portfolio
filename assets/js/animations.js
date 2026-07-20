const defaultChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function initAnimations() {
  initTextScramble();
}

function initTextScramble() {
  const titles = [...document.querySelectorAll('[data-text-scramble]')];
  if (!titles.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    titles.forEach(title => prepareTitle(title));
    return;
  }

  const observer = new IntersectionObserver(handleIntersect, {
    threshold: 0.3,
    rootMargin: '0px 0px -8% 0px'
  });

  titles.forEach(title => {
    prepareTitle(title);
    observer.observe(title);
  });

  function handleIntersect(entries) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const title = entry.target;
      observer.unobserve(title);
      scrambleTitle(title);
    });
  }
}

function prepareTitle(title) {
  title.dataset.scrambleText = title.dataset.scrambleText || title.textContent.trim();
  title.setAttribute('aria-label', title.dataset.scrambleText);
  title.classList.add('text-scramble');
}

function scrambleTitle(title) {
  if (title.dataset.scrambleDone === 'true') return;

  const text = title.dataset.scrambleText || title.textContent.trim();
  const duration = Number(title.dataset.scrambleDuration || 0.9);
  const speed = Number(title.dataset.scrambleSpeed || 0.035);
  const steps = Math.max(1, Math.ceil(duration / speed));
  let step = 0;

  title.classList.add('is-scrambling');

  const interval = window.setInterval(() => {
    const progress = step / steps;
    let scrambled = '';

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];

      if (!/[A-Za-z0-9]/.test(char)) {
        scrambled += char;
        continue;
      }

      if (progress * text.length > index) {
        scrambled += char;
        continue;
      }

      scrambled += defaultChars[Math.floor(Math.random() * defaultChars.length)];
    }

    title.textContent = scrambled;
    step += 1;

    if (step > steps) {
      window.clearInterval(interval);
      title.textContent = text;
      title.dataset.scrambleDone = 'true';
      title.classList.remove('is-scrambling');
    }
  }, speed * 1000);
}
