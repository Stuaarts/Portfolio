import { openProjectModal } from './data.js';

export function initUI() {
  setTheme();
  initNav();
  initFooterYear();
  initModalClose();
  trapFocus();
}

function setTheme() {
  document.documentElement.dataset.theme = 'light';
}

function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#site-nav');
  if (!toggle || !nav) return;

  const close = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const open = () => {
    nav.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  toggle.addEventListener('click', () => {
    nav.classList.contains('open') ? close() : open();
  });

  nav.addEventListener('click', event => {
    if (event.target.tagName === 'A') close();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
  });
}

function initFooterYear() {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
}

function initModalClose() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;

  modal.querySelectorAll('[data-modal-close]').forEach(button => {
    button.addEventListener('click', () => closeModal(modal));
  });

  modal.addEventListener('click', event => {
    if (event.target.classList.contains('modal-backdrop')) closeModal(modal);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('open')) closeModal(modal);
  });
}

function closeModal(modal) {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function trapFocus() {
  const nav = document.getElementById('site-nav');
  if (!nav) return;

  nav.addEventListener('keydown', event => {
    if (!nav.classList.contains('open') || event.key !== 'Tab') return;

    const focusables = nav.querySelectorAll('a, button');
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

export function bindProjectCards() {
  document.querySelectorAll('[data-project-card]').forEach(card => {
    card.addEventListener('click', () => openProjectModal(card.dataset.slug));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openProjectModal(card.dataset.slug);
      }
    });
  });
}
