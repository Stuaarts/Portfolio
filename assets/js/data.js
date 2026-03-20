// assets/js/data.js
import { bindProjectCards } from './ui.js';

let projectCache = null;
let experienceCache = null;

async function fetchJSON(paths, fallback = []) {
  const candidates = Array.isArray(paths) ? paths : [paths];
  for (const path of candidates) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(res.statusText);
      return await res.json();
    } catch (err) {
      console.warn(`Failed to fetch ${path}`, err);
    }
  }
  return fallback;
}

export async function loadProjects() {
  if (projectCache) return projectCache;
  projectCache = await fetchJSON(['content/projects.json', '../content/projects.json', '/content/projects.json'], []);
  return projectCache;
}

export async function loadExperience() {
  if (experienceCache) return experienceCache;
  experienceCache = await fetchJSON(['content/experience.json', '../content/experience.json', '/content/experience.json'], { experience: [], certifications: [] });
  return experienceCache;
}

export async function renderFeaturedProjects() {
  const data = await loadProjects();
  const featured = data.filter(p => p.featured).slice(0, 3);
  const container = document.getElementById('featured-projects');
  if (!container) return;
  container.innerHTML = featured.map(cardTemplate).join('');
  bindProjectCards();
}

export async function renderProjectsGrid() {
  const data = await loadProjects();
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  grid.innerHTML = data.map(cardTemplate).join('');
  bindProjectCards();
}

export function cardTemplate(project) {
  const tags = project.tags?.map(tag => `<span class="tag">${tag}</span>`).join('') || '';
  return `
    <article class="card project-card" data-project-card tabindex="0" data-slug="${project.slug}">
      <p class="eyebrow">${project.category}</p>
      <h3>${project.title}</h3>
      <p class="muted-text">${project.summary}</p>
      <div class="tag-row">${tags}</div>
    </article>`;
}

export function applyProjectFilters() {
  const chips = document.querySelectorAll('.chip');
  const searchInput = document.getElementById('project-search');
  const grid = document.getElementById('projects-grid');
  if (!chips.length || !grid) return;

  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    filter();
  }));
  searchInput?.addEventListener('input', filter);

  async function filter() {
    const data = await loadProjects();
    const active = document.querySelector('.chip.active')?.dataset.filter || 'All';
    const term = (searchInput?.value || '').toLowerCase();
    const filtered = data.filter(p => {
      const matchCategory = active === 'All' || p.category === active;
      const matchText = !term || p.title.toLowerCase().includes(term) || p.tags.some(t => t.toLowerCase().includes(term));
      return matchCategory && matchText;
    });
    grid.innerHTML = filtered.map(cardTemplate).join('');
    bindProjectCards();
  }
}

export async function openProjectModal(slug) {
  const data = await loadProjects();
  const project = data.find(p => p.slug === slug);
  if (!project) return;
  const modal = document.getElementById('project-modal');
  if (!modal) return;
  modal.querySelector('#modal-title').textContent = project.title;
  modal.querySelector('#modal-summary').textContent = project.summary;
  const list = modal.querySelector('#modal-highlights');
  list.innerHTML = (project.highlights || []).map(item => `<li>${item}</li>`).join('');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  modal.querySelector('.modal-close').focus();
}

export async function renderExperience() {
  const { experience } = await loadExperience();
  const container = document.getElementById('experience-timeline');
  if (!container) return;
  container.innerHTML = experience.map(item => {
    const highlights = item.highlights?.map(h => `<li>${h}</li>`).join('') || '';
    return `
      <div class="timeline-item">
        <div class="timeline-bullet"></div>
        <h3>${item.title} — ${item.org}</h3>
        <p class="meta">${item.location} · ${item.start} – ${item.end}</p>
        <p class="muted-text">${item.summary}</p>
        <ul class="highlights">${highlights}</ul>
      </div>`;
  }).join('');
}

export async function renderCertifications() {
  const { certifications } = await loadExperience();
  const container = document.getElementById('certifications-list');
  if (!container) return;
  container.innerHTML = certifications.map(cert => `
    <article class="card">
      <h3>${cert.name}</h3>
      <p class="muted-text">${cert.issuer}</p>
      <p class="meta">Issued ${cert.date}</p>
      <a class="btn outline" href="${cert.verify}" target="_blank" rel="noopener noreferrer">Verify</a>
    </article>`).join('');
}

export async function renderAwards() {
  const { awards = [] } = await loadExperience();
  const container = document.getElementById('awards-list');
  if (!container) return;
  container.innerHTML = awards.map(award => `
    <article class="card">
      <p class="eyebrow">${award.term}</p>
      <h3>${award.title}</h3>
      <p class="muted-text">${award.summary}</p>
      <p class="meta">${award.date}</p>
      <a class="btn outline" href="${award.file}" target="_blank" rel="noopener noreferrer">Open Letter</a>
    </article>`).join('');
}

