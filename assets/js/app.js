// assets/js/app.js
import { initUI } from './ui.js';
import { initAnimations } from './animations.js';
import { initBackgroundBoxes } from './background-boxes.js';
import { renderFeaturedProjects, renderProjectsGrid, applyProjectFilters, renderExperience, renderCertifications, renderAwards } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  initUI();
  initBackgroundBoxes();
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
    renderAwards();
  }
});

