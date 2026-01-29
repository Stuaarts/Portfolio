// assets/js/ui.js
import { openProjectModal } from './data.js';

export function initUI() {
  initTheme();
  initNav();
  initFooterYear();
  initModalClose();
  trapFocus();
}

function initTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = prefersDark ? 'dark' : 'light';
  setTheme(theme);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => setTheme(e.matches ? 'dark' : 'light'));
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
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
    const isOpen = nav.classList.contains('open');
    isOpen ? close() : open();
  });
  nav.addEventListener('click', e => {
    if (e.target.tagName === 'A') close();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });

  // Active link detection
  const path = window.location.pathname.replace(/index\.html$/, '').replace(/\\/g, '/');
  nav.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && path.endsWith(href.replace('..','').replace('./','').replace('index.html',''))) {
      link.classList.add('active');
    }
  });
}

function initFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

function initModalClose() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;
  modal.querySelectorAll('[data-modal-close]').forEach(btn => btn.addEventListener('click', () => closeModal(modal)));
  modal.addEventListener('click', e => {
    if (e.target.classList.contains('modal-backdrop')) closeModal(modal);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(modal);
  });
}

function closeModal(modal) {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

function trapFocus() {
  const nav = document.getElementById('site-nav');
  const toggle = document.querySelector('.nav-toggle');
  if (!nav || !toggle) return;
  nav.addEventListener('keydown', e => {
    if (!nav.classList.contains('open')) return;
    if (e.key !== 'Tab') return;
    const focusables = nav.querySelectorAll('a, button');
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}

export function bindProjectCards() {
  document.querySelectorAll('[data-project-card]').forEach(card => {
    card.addEventListener('click', () => openProjectModal(card.dataset.slug));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProjectModal(card.dataset.slug); }
    });
  });
}

