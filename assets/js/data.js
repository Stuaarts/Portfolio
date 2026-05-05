import { bindProjectCards } from './ui.js';

let projectCache = null;
let experienceCache = null;

async function fetchJSON(paths, fallback = []) {
  const candidates = Array.isArray(paths) ? paths : [paths];

  for (const path of candidates) {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(response.statusText);
      return await response.json();
    } catch (error) {
      console.warn(`Failed to fetch ${path}`, error);
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
  experienceCache = await fetchJSON(
    ['content/experience.json', '../content/experience.json', '/content/experience.json'],
    { experience: [], certifications: [], awards: [] }
  );
  return experienceCache;
}

export async function renderFeaturedProjects() {
  const projects = await loadProjects();
  const featured = projects.filter(project => project.featured);
  const container = document.getElementById('featured-projects');
  if (!container) return;

  container.innerHTML = featured.map(featureTemplate).join('');
  bindProjectCards();
}

export async function renderProjectsGrid() {
  const projects = await loadProjects();
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  grid.innerHTML = projects.map(gridTemplate).join('');
  bindProjectCards();
}

function featureTemplate(project) {
  return `
    <article class="project-feature card reveal project-surface" data-project-card tabindex="0" data-slug="${project.slug}">
      <div class="project-media-frame">
        <img src="${project.image}" alt="${project.title} screenshot">
      </div>
      <div class="project-content">
        <div class="project-topline">
          <p class="eyebrow">${project.category}</p>
          <span class="project-year">${project.year}</span>
        </div>
        <h3>${project.title}</h3>
        <p class="project-subtitle">${project.subtitle}</p>
        <p class="muted-text">${project.summary}</p>
        <div class="tag-row">${renderTags(project.tags)}</div>
        ${renderCardLinks(project)}
        <span class="project-link-hint">Open case study</span>
      </div>
    </article>`;
}

function gridTemplate(project) {
  return `
    <article class="project-case card reveal project-surface" data-project-card tabindex="0" data-slug="${project.slug}">
      <div class="project-media-frame compact">
        <img src="${project.image}" alt="${project.title} screenshot">
      </div>
      <div class="project-content">
        <div class="project-topline">
          <p class="eyebrow">${project.category}</p>
          <span class="project-year">${project.year}</span>
        </div>
        <h3>${project.title}</h3>
        <p class="project-subtitle">${project.subtitle}</p>
        <p class="muted-text">${project.summary}</p>
        <div class="tag-row">${renderTags(project.tags)}</div>
        ${renderCardLinks(project)}
        <span class="project-link-hint">Open case study</span>
      </div>
    </article>`;
}

function renderTags(tags = []) {
  return tags.map(tag => `<span class="tag">${tag}</span>`).join('');
}

function renderCardLinks(project) {
  if (!project.links?.demo) return '';

  return `
    <div class="project-card-links">
      <a class="project-card-link" href="${project.links.demo}" target="_blank" rel="noopener noreferrer">Website</a>
    </div>`;
}

export function applyProjectFilters() {
  const chips = document.querySelectorAll('.chip');
  const searchInput = document.getElementById('project-search');
  const grid = document.getElementById('projects-grid');
  if (!chips.length || !grid) return;

  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(item => item.classList.remove('active'));
    chip.classList.add('active');
    filterProjects();
  }));

  searchInput?.addEventListener('input', filterProjects);

  async function filterProjects() {
    const projects = await loadProjects();
    const active = document.querySelector('.chip.active')?.dataset.filter || 'All';
    const term = (searchInput?.value || '').toLowerCase().trim();
    const filtered = projects.filter(project => {
      const matchCategory = active === 'All' || project.category === active;
      const matchText =
        !term ||
        project.title.toLowerCase().includes(term) ||
        project.tags.some(tag => tag.toLowerCase().includes(term));
      return matchCategory && matchText;
    });

    grid.innerHTML = filtered.map(gridTemplate).join('');
    bindProjectCards();
  }
}

export async function openProjectModal(slug) {
  const projects = await loadProjects();
  const project = projects.find(item => item.slug === slug);
  if (!project) return;

  const modal = document.getElementById('project-modal');
  if (!modal) return;

  modal.querySelector('#modal-kicker').textContent = `${project.category} / ${project.year}`;
  modal.querySelector('#modal-title').textContent = project.title;
  modal.querySelector('#modal-subtitle').textContent = project.subtitle;
  modal.querySelector('#modal-summary').textContent = project.description;

  const image = modal.querySelector('#modal-image');
  image.src = project.image;
  image.alt = `${project.title} screenshot`;

  const highlights = modal.querySelector('#modal-highlights');
  highlights.innerHTML = (project.highlights || []).map(item => `<li>${item}</li>`).join('');

  const tags = modal.querySelector('#modal-tags');
  tags.innerHTML = renderTags(project.tags);

  const links = modal.querySelector('#modal-links');
  const linkButtons = [];
  if (project.links?.demo) {
    linkButtons.push(`<a class="btn primary" href="${project.links.demo}" target="_blank" rel="noopener noreferrer">Website</a>`);
  }
  if (project.links?.github) {
    linkButtons.push(`<a class="btn outline" href="${project.links.github}" target="_blank" rel="noopener noreferrer">GitHub</a>`);
  }
  if (project.links?.video) {
    linkButtons.push(`<a class="btn ghost" href="${project.links.video}" target="_blank" rel="noopener noreferrer">Watch Walkthrough</a>`);
  }
  links.innerHTML = linkButtons.join('');
  links.hidden = linkButtons.length === 0;

  const credentialsWrap = modal.querySelector('#modal-credentials-wrap');
  const credentials = modal.querySelector('#modal-credentials');
  const credentialItems = (project.credentials || [])
    .map(item => `<li><strong>${item.label}:</strong> ${item.value}</li>`)
    .join('');
  credentials.innerHTML = credentialItems;
  credentialsWrap.hidden = credentialItems.length === 0;

  const note = modal.querySelector('#modal-note');
  note.textContent = project.note || '';
  note.hidden = !project.note;

  const gallery = modal.querySelector('#modal-gallery');
  const galleryItems = (project.gallery || [])
    .map(src => `
      <button class="gallery-thumb" type="button" data-gallery-image="${src}">
        <img src="${src}" alt="${project.title} gallery image">
      </button>`)
    .join('');
  gallery.innerHTML = galleryItems;
  gallery.hidden = !galleryItems;

  gallery.querySelectorAll('[data-gallery-image]').forEach(button => {
    button.addEventListener('click', () => {
      image.src = button.dataset.galleryImage;
      image.alt = `${project.title} screenshot`;
    });
  });

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  modal.querySelector('.modal-close').focus();
}

export async function renderExperience() {
  const { experience } = await loadExperience();
  const container = document.getElementById('experience-timeline');
  if (!container) return;

  container.innerHTML = experience.map(item => {
    const highlights = item.highlights?.map(entry => `<li>${entry}</li>`).join('') || '';
    return `
      <article class="timeline-item card reveal">
        <div class="timeline-bullet" aria-hidden="true"></div>
        <p class="eyebrow">${item.type}</p>
        <h3>${item.title}</h3>
        <p class="meta">${item.org} / ${item.location}</p>
        <p class="meta">${item.start} - ${item.end}</p>
        <p class="muted-text">${item.summary}</p>
        <ul class="highlights">${highlights}</ul>
      </article>`;
  }).join('');
}

export async function renderCertifications() {
  const { certifications } = await loadExperience();
  const container = document.getElementById('certifications-list');
  if (!container) return;

  container.innerHTML = certifications.map(cert => `
    <article class="card reveal">
      <p class="eyebrow">Certification</p>
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
    <article class="card reveal">
      <p class="eyebrow">${award.term}</p>
      <h3>${award.title}</h3>
      <p class="muted-text">${award.summary}</p>
      <p class="meta">${award.date}</p>
      <a class="btn outline" href="${award.file}" target="_blank" rel="noopener noreferrer">Open Letter</a>
    </article>`).join('');
}
