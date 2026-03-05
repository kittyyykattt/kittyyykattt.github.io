// =========================================================
// Katya Serechenko — portfolio interactions
// =========================================================

document.getElementById("year").textContent = new Date().getFullYear();

// ===== Scroll progress bar =====
const progressBar = document.getElementById("scroll-progress-bar");

function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${(scrollTop / docHeight) * 100}%`;
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
    setDrawer(navToggle.getAttribute("aria-expanded") !== "true");
  });
  navDrawer.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => setDrawer(false));
  });
}

// ----- Active section highlight -----
const navLinks = document.querySelectorAll(".nav-link");
const sections = ["home", "experience", "projects", "skills", "contact"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

function setActiveNav() {
  const y = window.scrollY + 120;
  let activeId = "home";
  for (const sec of sections) {
    if (sec.offsetTop <= y) activeId = sec.id;
  }
  navLinks.forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === `#${activeId}`);
  });
}
window.addEventListener("scroll", setActiveNav);
window.addEventListener("load", setActiveNav);

// ===== Particles background =====
const canvas = document.getElementById("particles");
const ctx = canvas ? canvas.getContext("2d") : null;
let particles = [];

function resize() {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);

function rand(min, max) { return Math.random() * (max - min) + min; }

function seedParticles() {
  if (!canvas) return;
  const count = Math.round(Math.min(90, Math.max(45, window.innerWidth / 18)));
  particles = Array.from({ length: count }, () => ({
    x: rand(0, window.innerWidth), y: rand(0, window.innerHeight),
    r: rand(1.2, 3.2), vx: rand(-0.35, 0.35), vy: rand(-0.25, 0.25),
  }));
}

function step() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < -20) p.x = window.innerWidth + 20;
    if (p.x > window.innerWidth + 20) p.x = -20;
    if (p.y < -20) p.y = window.innerHeight + 20;
    if (p.y > window.innerHeight + 20) p.y = -20;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.40)";
    ctx.fill();
  }
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d2 = dx * dx + dy * dy, max = 140;
      if (d2 < max * max) {
        const t = 1 - Math.sqrt(d2) / max;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(255,255,255,${0.12 * t})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(step);
}

if (canvas && ctx) { resize(); seedParticles(); step(); }

let lastW = window.innerWidth, lastH = window.innerHeight;
setInterval(() => {
  const w = window.innerWidth, h = window.innerHeight;
  if (Math.abs(w - lastW) > 180 || Math.abs(h - lastH) > 180) {
    lastW = w; lastH = h; seedParticles();
  }
}, 800);


// =========================================================
// ===== Projects Grid =====
// =========================================================
(function () {
  const grid   = document.getElementById("projectsGrid");
  const btn    = document.getElementById("btnSeeAll");
  if (!grid || !btn) return;

  const cards = Array.from(grid.querySelectorAll(".pc"));

  // Inject image preview into each card
  cards.forEach((card, i) => {
    if (i >= 4) card.classList.add("pc-hidden");

    // Wrap existing text children in .pc-body
    const body = document.createElement("div");
    body.className = "pc-body";
    while (card.firstChild) body.appendChild(card.firstChild);
    card.appendChild(body);

    // Prepend image preview if available
    const image = card.dataset.image;
    if (image) {
      const preview = document.createElement("div");
      preview.className = "pc-preview";
      const img = document.createElement("img");
      img.src = image;
      img.alt = card.dataset.title + " preview";
      img.loading = "lazy";
      preview.appendChild(img);
      card.insertBefore(preview, card.firstChild);
    }

    card.addEventListener("click", () => openModal(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(card); }
    });
  });

  let expanded = false;

  btn.addEventListener("click", () => {
    expanded = !expanded;
    grid.classList.toggle("expanded", expanded);
    btn.textContent = expanded ? "Show Less" : "See All Projects";
    btn.setAttribute("aria-expanded", String(expanded));
  });
})();


// =========================================================
// ===== Project Modal =====
// =========================================================
const overlay   = document.getElementById("projectOverlay");
const modalHost = document.getElementById("projectModalHost");

function getCardGradient(card) {
  const gradients = {
    "pc-nolepath":   "linear-gradient(145deg, #6a2433, #8C3A4A, #7a3055)",
    "pc-thera":      "linear-gradient(145deg, #168a66, #1FA67A, #15907a)",
    "pc-mood":       "linear-gradient(145deg, #1a1040, #2d1b69, #3d2280)",
    "pc-insta":      "linear-gradient(145deg, #833ab4, #c13584, #e1306c)",
    "pc-network":    "linear-gradient(145deg, #0f3460, #16213e, #1a4a8a)",
    "pc-hash":       "linear-gradient(145deg, #1a3a2a, #2d6644, #1e5038)",
    "pc-bst":        "linear-gradient(145deg, #3b2a1a, #7a4a20, #5a3a10)",
    "pc-flight":     "linear-gradient(145deg, #1c2e60, #2a4494, #1e3a7a)",
    "pc-matrix":     "linear-gradient(145deg, #1a1a3e, #2d2d6a, #3a2a80)",
    "pc-calc":       "linear-gradient(145deg, #1c3a1c, #2d6b2d, #1e541e)",
    "pc-battleship": "linear-gradient(145deg, #1a2a3e, #2c4464, #243a5a)",
  };
  const variant = Array.from(card.classList).find(c => c.startsWith("pc-") && c !== "pc" && c !== "pc-hidden");
  return gradients[variant] || "linear-gradient(145deg, #1a1a2e, #2d2d4a)";
}

function openModal(card) {
  const title    = card.dataset.title || "";
  const subtitle = card.dataset.subtitle || "";
  const desc     = card.dataset.desc || "";
  const tags     = (card.dataset.tags || "").split(",").filter(Boolean);
  const github   = card.dataset.github || "";
  const demo     = card.dataset.demo || "";
  const image    = card.dataset.image || "";
  const gradient = getCardGradient(card);

  const tagsHTML  = tags.map(t => `<span class="pm-tag">${t.trim()}</span>`).join("");
  const imageHTML = image ? `<div class="pm-image"><img src="${image}" alt="${title} screenshot" loading="lazy"></div>` : "";
  const demoBtn   = demo   ? `<a class="pm-btn pm-btn-primary"   href="${demo}"   target="_blank" rel="noopener noreferrer">🔗 Live Demo</a>` : "";
  const githubBtn = github ? `<a class="pm-btn pm-btn-secondary" href="${github}" target="_blank" rel="noopener noreferrer">📦 View Code</a>` : "";

  modalHost.innerHTML = `
    <div class="project-modal-host" id="pmHost">
      <div class="pm" style="background: ${gradient};" role="dialog" aria-modal="true" aria-label="${title}">
        <button class="pm-close" id="pmClose" aria-label="Close modal">✕</button>
        ${imageHTML}
        <p class="pm-subtitle">${subtitle}</p>
        <h2 class="pm-title">${title}</h2>
        <p class="pm-desc">${desc}</p>
        <div class="pm-tags">${tagsHTML}</div>
        <div class="pm-actions">${demoBtn}${githubBtn}</div>
      </div>
    </div>
  `;

  overlay.classList.add("active");
  document.body.classList.add("modal-open");
  document.getElementById("pmClose").addEventListener("click", closeModal);
  document.getElementById("pmHost").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  setTimeout(() => document.getElementById("pmClose")?.focus(), 50);
}

function closeModal() {
  overlay.classList.remove("active");
  document.body.classList.remove("modal-open");
  modalHost.innerHTML = "";
}

overlay.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });