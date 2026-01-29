// assets/js/app.js
import { initUI } from './ui.js';
import { initAnimations } from './animations.js';
import { renderFeaturedProjects, renderProjectsGrid, applyProjectFilters, renderExperience, renderCertifications, initContactForm } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  initUI();
  initAnimations();
  const page = document.body.dataset.page;
  if (page === 'home') {
    renderFeaturedProjects();
  }
  if (page === 'projects') {
    renderProjectsGrid();
    applyProjectFilters();
  }
  if (page === 'experience') {
    renderExperience();
    renderCertifications();
  }
  if (page === 'contact') {
    initContactForm();
  }
});

