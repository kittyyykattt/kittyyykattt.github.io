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

  // Close drawer when clicking a link
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
    const href = a.getAttribute("href");
    const isActive = href === `#${activeId}`;
    a.classList.toggle("active", isActive);
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

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function seedParticles() {
  if (!canvas) return;
  const count = Math.round(Math.min(90, Math.max(45, window.innerWidth / 18)));
  particles = Array.from({ length: count }, () => ({
    x: rand(0, window.innerWidth),
    y: rand(0, window.innerHeight),
    r: rand(1.2, 3.2),
    vx: rand(-0.35, 0.35),
    vy: rand(-0.25, 0.25),
  }));
}

function step() {
  if (!canvas || !ctx) return;

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // dots
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -20) p.x = window.innerWidth + 20;
    if (p.x > window.innerWidth + 20) p.x = -20;
    if (p.y < -20) p.y = window.innerHeight + 20;
    if (p.y > window.innerHeight + 20) p.y = -20;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.40)";
    ctx.fill();
  }

  // lines
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i];
      const b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d2 = dx * dx + dy * dy;
      const max = 140;

      if (d2 < max * max) {
        const d = Math.sqrt(d2);
        const t = 1 - d / max;
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

const cards = document.querySelectorAll(".project-card");
const overlay = document.getElementById("projectOverlay");
const modalHostRoot = document.getElementById("projectModalHost");

let activeHost = null;

function closeModal() {
  if (!activeHost) return;

  modalHostRoot.innerHTML = "";
  overlay.classList.remove("active");
  document.body.classList.remove("modal-open");

  activeHost = null;
}

cards.forEach((card) => {
  const openModal = () => {
    if (activeHost) return;

    // clone the card
    const clone = card.cloneNode(true);
    clone.classList.add("project-modal-card");
    clone.classList.remove("project-card");

    // add a close button to the clone
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "project-close";
    closeBtn.setAttribute("aria-label", "Close project details");
    closeBtn.innerHTML = "✕";
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeModal();
    });

    clone.prepend(closeBtn);

    // host (full screen)
    const host = document.createElement("div");
    host.className = "project-modal-host";
    host.appendChild(clone);
    modalHostRoot.appendChild(host);

    // show overlay + lock scroll
    overlay.classList.add("active");
    document.body.classList.add("modal-open");

    // click outside the card closes (host covers whole screen)
    host.addEventListener("click", (e) => {
      if (e.target === host) closeModal();
    });

    activeHost = host;
  };

  card.addEventListener("click", (e) => {
    // if user clicked a link inside the card, don't open modal
    if (e.target.closest("a")) return;
    openModal();
  });

  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter") openModal();
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
