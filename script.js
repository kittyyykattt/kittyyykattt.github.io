// =========================================================
// Katya Serechenko — portfolio interactions
// - progres bar
// - mobile nav drawer
// - active section highlight
// - particle canvas background
// =========================================================

document.getElementById("year").textContent = new Date().getFullYear();

// ===== Scroll progress bar =====
const progressBar = document.getElementById("scroll-progress-bar");

function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight =
    document.documentElement.scrollHeight - window.innerHeight;

  const progress = (scrollTop / docHeight) * 100;
  progressBar.style.width = `${progress}%`;
}

window.addEventListener("scroll", updateProgress);
window.addEventListener("load", updateProgress);


// ----- Mobile nav drawer -----
const navToggle = document.getElementById("navToggle");
const navDrawer = document.getElementById("navDrawer");

function setDrawer(open) {
  navToggle.setAttribute("aria-expanded", String(open));
  navDrawer.hidden = !open;
}

if (navToggle && navDrawer) {
  navToggle.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") === "true";
    setDrawer(!open);
  });

  navDrawer.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) setDrawer(false);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setDrawer(false);
  });
}

// ----- Active nav link highlight -----
const sections = Array.from(document.querySelectorAll("main section[id]"));

const links = Array.from(document.querySelectorAll(".nav-link, .drawer-link"));

// Map "#id" -> [link, link, ...] (desktop + drawer can share the same href)
const byHash = new Map();
for (const l of links) {
  const href = l.getAttribute("href");
  if (!href || !href.startsWith("#")) continue;
  if (!byHash.has(href)) byHash.set(href, []);
  byHash.get(href).push(l);
}

function setActive(id) {
  links.forEach(l => l.classList.remove("active"));
  const list = byHash.get(`#${id}`);
  if (list) list.forEach(l => l.classList.add("active"));
}

const ratios = new Map(sections.map(s => [s.id, 0]));

function pickBestSection() {
  // 1) pick highest intersection ratio
  let bestId = null;
  let bestRatio = 0;

  for (const [id, r] of ratios.entries()) {
    if (r > bestRatio) {
      bestRatio = r;
      bestId = id;
    }
  }

  // 2) fallback: pick the section closest to the top (for fast jumps / edge cases)
  if (!bestId || bestRatio < 0.12) {
    let closest = sections[0]?.id;
    let closestDist = Infinity;

    for (const s of sections) {
      const rect = s.getBoundingClientRect();
      const dist = Math.abs(rect.top - 120); 
      if (dist < closestDist) {
        closestDist = dist;
        closest = s.id;
      }
    }
    bestId = closest;
  }

  if (bestId) setActive(bestId);
}

const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
  }
  pickBestSection();
}, {
  rootMargin: "-25% 0px -55% 0px",
  threshold: [0, 0.08, 0.12, 0.2, 0.35, 0.5, 0.75]
});

sections.forEach(s => io.observe(s));

// Set active immediately on load + when hash changes
window.addEventListener("load", () => {
  const id = (location.hash || "#home").slice(1);
  if (document.getElementById(id)) setActive(id);
});
window.addEventListener("hashchange", () => {
  const id = (location.hash || "#home").slice(1);
  if (document.getElementById(id)) setActive(id);
});

links.forEach((l) => {
  l.addEventListener("click", () => {
    const href = l.getAttribute("href");
    if (href && href.startsWith("#")) setActive(href.slice(1));
  });
});

// ----- Particles canvas -----
const canvas = document.getElementById("particles");
const ctx = canvas?.getContext("2d", { alpha: true });

function resize() {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

let particles = [];
function seedParticles() {
  if (!canvas) return;
  const count = Math.round(Math.min(130, Math.max(60, window.innerWidth / 12)));
  particles = Array.from({ length: count }).map(() => ({
    x: rand(0, window.innerWidth),
    y: rand(0, window.innerHeight),
    r: rand(0.8, 2.2),
    vx: rand(-0.25, 0.25),
    vy: rand(-0.18, 0.18),
    a: rand(0.06, 0.18)
  }));
}

function step() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // faint glow lines between nearby particles
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -20) p.x = window.innerWidth + 20;
    if (p.x > window.innerWidth + 20) p.x = -20;
    if (p.y < -20) p.y = window.innerHeight + 20;
    if (p.y > window.innerHeight + 20) p.y = -20;

    // draw particle
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(158,215,255,${p.a})`;
    ctx.fill();

    // connections
    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const d2 = dx * dx + dy * dy;
      const max = 140 * 140;
      if (d2 < max) {
        const t = 1 - (d2 / max);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(199,166,255,${0.12 * t})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(step);
}

if (canvas && ctx) {
  resize();
  seedParticles();
  step();
}

// re-seed on orientation changes / large resizes
let lastW = window.innerWidth;
let lastH = window.innerHeight;
setInterval(() => {
  const w = window.innerWidth, h = window.innerHeight;
  if (Math.abs(w - lastW) > 180 || Math.abs(h - lastH) > 180) {
    lastW = w; lastH = h;
    seedParticles();
  }
}, 800);
