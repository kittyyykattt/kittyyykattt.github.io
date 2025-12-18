const root = document.documentElement;

const toggleBtn = document.getElementById("themeToggle");
const closeBtn = document.getElementById("themeClose");
const card = document.getElementById("themeCard");
const dots = document.querySelectorAll(".theme-dot");
const reset = document.getElementById("themeReset");

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("theme", theme);
}

function clearTheme() {
  delete root.dataset.theme;
  localStorage.removeItem("theme");
}

toggleBtn?.addEventListener("click", () => {
  const open = toggleBtn.getAttribute("aria-expanded") === "true";
  toggleBtn.setAttribute("aria-expanded", String(!open));
  card.hidden = open;
});

closeBtn?.addEventListener("click", () => {
  toggleBtn.setAttribute("aria-expanded", "false");
  card.hidden = true;
});

dots.forEach(dot => {
  dot.addEventListener("click", () => setTheme(dot.dataset.theme));
});

reset?.addEventListener("click", clearTheme);

const saved = localStorage.getItem("theme");
if (saved) setTheme(saved);

document.getElementById("year").textContent = new Date().getFullYear();

