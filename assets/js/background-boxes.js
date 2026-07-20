const colors = [
  [125, 211, 252],
  [249, 168, 212],
  [134, 239, 172],
  [253, 224, 71],
  [252, 165, 165],
  [216, 180, 254],
  [147, 197, 253],
  [165, 180, 252],
  [196, 181, 253]
];

const cellWidth = 64;
const cellHeight = 32;
const activeDuration = 2600;

export function initBackgroundBoxes() {
  if (document.querySelector('[data-background-boxes]')) return;

  const layer = document.createElement('div');
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;

  layer.className = 'background-boxes';
  layer.dataset.backgroundBoxes = '';
  layer.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('aria-hidden', 'true');
  layer.append(canvas);
  document.body.prepend(layer);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const activeCells = new Map();
  let transform = new DOMMatrix();
  let inverseTransform = transform.inverse();
  let bounds = { minCol: 0, maxCol: 0, minRow: 0, maxRow: 0 };
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let animationFrame = 0;
  let pointerFrame = 0;
  let pendingPointer = null;
  let lastCell = '';

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const scale = Math.max(0.72, Math.min(0.94, width / 1700));
    const skewX = Math.tan(-40 * Math.PI / 180) * scale;
    const skewY = Math.tan(12 * Math.PI / 180) * scale;

    transform = new DOMMatrix([
      scale,
      skewY,
      skewX,
      scale,
      width * 0.34,
      -height * 0.2
    ]);
    inverseTransform = transform.inverse();
    bounds = getGridBounds(inverseTransform, width, height);
    render();
  };

  const handlePointerMove = event => {
    if (reducedMotion.matches) return;

    pendingPointer = { x: event.clientX, y: event.clientY };
    if (pointerFrame) return;

    pointerFrame = window.requestAnimationFrame(() => {
      pointerFrame = 0;
      if (!pendingPointer) return;

      const localPoint = new DOMPoint(pendingPointer.x, pendingPointer.y).matrixTransform(inverseTransform);
      const col = Math.floor(localPoint.x / cellWidth);
      const row = Math.floor(localPoint.y / cellHeight);
      const key = `${col}:${row}`;

      if (key !== lastCell) {
        activeCells.set(key, {
          col,
          row,
          color: colors[Math.floor(Math.random() * colors.length)],
          startedAt: performance.now()
        });
        lastCell = key;
        requestRender();
      }

      pendingPointer = null;
    });
  };

  const requestRender = () => {
    if (animationFrame) return;
    animationFrame = window.requestAnimationFrame(render);
  };

  function render(timestamp = performance.now()) {
    animationFrame = 0;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.setTransform(
      transform.a * pixelRatio,
      transform.b * pixelRatio,
      transform.c * pixelRatio,
      transform.d * pixelRatio,
      transform.e * pixelRatio,
      transform.f * pixelRatio
    );

    let hasActiveCells = false;
    activeCells.forEach((cell, key) => {
      const progress = (timestamp - cell.startedAt) / activeDuration;
      if (progress >= 1) {
        activeCells.delete(key);
        return;
      }

      hasActiveCells = true;
      const alpha = 0.78 * (1 - progress);
      context.fillStyle = `rgba(${cell.color.join(', ')}, ${alpha})`;
      context.fillRect(cell.col * cellWidth, cell.row * cellHeight, cellWidth, cellHeight);
    });

    const styles = getComputedStyle(document.documentElement);
    context.strokeStyle = styles.getPropertyValue('--boxes-line').trim();
    context.lineWidth = 1;
    context.beginPath();

    for (let col = bounds.minCol; col <= bounds.maxCol; col += 1) {
      const x = col * cellWidth;
      context.moveTo(x, bounds.minRow * cellHeight);
      context.lineTo(x, bounds.maxRow * cellHeight);
    }

    for (let row = bounds.minRow; row <= bounds.maxRow; row += 1) {
      const y = row * cellHeight;
      context.moveTo(bounds.minCol * cellWidth, y);
      context.lineTo(bounds.maxCol * cellWidth, y);
    }

    context.stroke();
    drawCrosses(context, bounds, styles.getPropertyValue('--boxes-cross').trim());

    if (hasActiveCells) requestRender();
  }

  const handleReducedMotion = () => {
    activeCells.clear();
    lastCell = '';
    render();
  };

  const themeObserver = new MutationObserver(() => render());
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  reducedMotion.addEventListener?.('change', handleReducedMotion);
  resize();
}

function getGridBounds(inverseTransform, width, height) {
  const corners = [
    new DOMPoint(0, 0),
    new DOMPoint(width, 0),
    new DOMPoint(0, height),
    new DOMPoint(width, height)
  ].map(point => point.matrixTransform(inverseTransform));

  const xValues = corners.map(point => point.x);
  const yValues = corners.map(point => point.y);

  return {
    minCol: Math.floor(Math.min(...xValues) / cellWidth) - 2,
    maxCol: Math.ceil(Math.max(...xValues) / cellWidth) + 2,
    minRow: Math.floor(Math.min(...yValues) / cellHeight) - 2,
    maxRow: Math.ceil(Math.max(...yValues) / cellHeight) + 2
  };
}

function drawCrosses(context, bounds, color) {
  const arm = 5;
  context.strokeStyle = color;
  context.lineWidth = 1;
  context.beginPath();

  for (let row = bounds.minRow; row <= bounds.maxRow; row += 2) {
    for (let col = bounds.minCol; col <= bounds.maxCol; col += 2) {
      const x = col * cellWidth;
      const y = row * cellHeight;
      context.moveTo(x - arm, y);
      context.lineTo(x + arm, y);
      context.moveTo(x, y - arm);
      context.lineTo(x, y + arm);
    }
  }

  context.stroke();
}
