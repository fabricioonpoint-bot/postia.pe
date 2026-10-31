/* =========================================================
   CONFIGURACIÓN: edita solo este bloque
   ========================================================= */
const CONFIG = {
  // Web App de Google Apps Script que guarda los registros en Google Sheets
  googleAppsScriptUrl:
    "https://script.google.com/macros/s/AKfycbxXMrzEDOykRBifgB-wo-5s0cpvo9stwFHvka60E34YB2SMOak9ZU1zTATzosRtowi55A/exec",

  // Número de WhatsApp con código de país, solo dígitos (ej. "51999999999").
  // Si queda vacío, el botón flotante de WhatsApp no se muestra.
  whatsappNumber: "",
  whatsappMessage: "Hola, quiero saber más sobre POST IA para mi negocio.",

  // Enlaces a redes sociales. Las que queden vacías se ocultan del footer.
  social: { instagram: "", facebook: "", tiktok: "", linkedin: "" },
};

const SUCCESS_MESSAGE = "¡Listo! Recibimos tus datos. Te escribiremos para darte acceso a la beta de POST IA.";
const ERROR_MESSAGE = "No pudimos enviar tus datos. Revisa tu conexión e inténtalo de nuevo.";

/* ========================================================= */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

if (window.lucide) window.lucide.createIcons();

/* ---------------------------------------------------------
   Isotipo oficial (Manual de identidad v1.0)
   Tarjeta con esquina recortada + obturador de 6 hojas + chispa.
   Las tres posiciones de las hojas vienen de la lámina "El clic".
   --------------------------------------------------------- */
const TILE = "M112 0H322C344 0 360 7 375 22L490 137C505 152 512 168 512 190V400C512 462 462 512 400 512H112C50 512 0 462 0 400V112C0 50 50 0 112 0Z";
const SPARK = "M248 213.6C251.8 252.9 259.0 260.1 298.4 264C259.0 267.8 251.8 275.0 248 314.4C244.1 275.0 236.9 267.8 197.6 264C236.9 260.1 244.1 252.9 248 213.6Z";
const BLADES = {
  open: [
    [248.0, 358.1, 161.5, 408.0, 80.0, 261.1], [166.5, 311.0, 80.0, 261.1, 166.5, 117.1],
    [166.5, 217.0, 166.5, 117.1, 334.5, 120.0], [248.0, 169.9, 334.5, 120.0, 416.0, 266.9],
    [329.5, 217.0, 416.0, 266.9, 329.5, 410.9], [329.5, 311.0, 329.5, 410.9, 161.5, 408.0],
  ],
  mid: [
    [234.6, 297.1, 88.8, 317.6, 121.9, 152.9], [212.6, 269.0, 121.9, 152.9, 281.1, 99.3],
    [226.0, 235.8, 281.1, 99.3, 407.2, 210.4], [261.4, 230.9, 407.2, 210.4, 374.1, 375.1],
    [283.4, 259.0, 374.1, 375.1, 214.9, 428.7], [270.0, 292.2, 214.9, 428.7, 88.8, 317.6],
  ],
  closed: [
    [247.6, 264.5, 82.5, 235.3, 190.1, 106.3], [247.4, 263.9, 190.1, 106.3, 355.6, 135.0],
    [247.8, 263.4, 355.6, 135.0, 413.5, 292.7], [248.4, 263.5, 413.5, 292.7, 305.9, 421.7],
    [248.6, 264.1, 305.9, 421.7, 140.4, 393.0], [248.2, 264.6, 140.4, 393.0, 82.5, 235.3],
  ],
};
const bladePath = (p) => `M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${p[2].toFixed(1)} ${p[3].toFixed(1)}A168 168 0 0 1 ${p[4].toFixed(1)} ${p[5].toFixed(1)}Z`;
const SVG_NS = "http://www.w3.org/2000/svg";

function buildIsotipo() {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 512 512");
  svg.setAttribute("class", "isotipo");
  svg.setAttribute("aria-hidden", "true");
  const blades = BLADES.open
    .map((p, i) => `<path class="blade" d="${bladePath(p)}" fill="${i % 2 ? "#67E8F9" : "#22D3EE"}" stroke="#7C3AED" stroke-width="11" stroke-linejoin="round"/>`)
    .join("");
  svg.innerHTML = `<path d="${TILE}" fill="#7C3AED"/><g clip-path="url(#lensClip)">${blades}</g><path class="spark" d="${SPARK}" fill="#FFFFFF"/>`;
  return svg;
}
document.querySelectorAll("[data-isotipo]").forEach((el) => el.appendChild(buildIsotipo()));

const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Cierra y abre el obturador como una cámara (0,6 s según el manual). */
function shutter(svg, duration = 600) {
  if (!svg || reduceMotion) return Promise.resolve();
  const paths = svg.querySelectorAll(".blade");
  const spark = svg.querySelector(".spark");
  const frames = [BLADES.open, BLADES.mid, BLADES.closed, BLADES.mid, BLADES.open];
  return new Promise((resolve) => {
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const pos = easeInOut(t) * (frames.length - 1);
      const i = Math.min(frames.length - 2, Math.floor(pos));
      const local = pos - i;
      paths.forEach((path, b) => {
        const from = frames[i][b];
        const to = frames[i + 1][b];
        path.setAttribute("d", bladePath(from.map((v, k) => lerp(v, to[k], local))));
      });
      // La chispa se apaga al cerrar y aparece con un pequeño rebote al abrir
      const s = t < 0.5 ? 1 - t * 2 : Math.min(1.25, (t - 0.5) * 2.5);
      spark.style.transform = `scale(${t >= 1 ? 1 : s}) rotate(${t * 90}deg)`;
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    }
    requestAnimationFrame(tick);
  });
}

/* Producto de ejemplo (polo coral del manual) */
const productTpl = document.querySelector("#productTpl");
document.querySelectorAll("[data-product]").forEach((slot) => slot.appendChild(productTpl.content.cloneNode(true)));

/* ---------------------------------------------------------
   Carga inicial: el logo hace "clic" y la página se abre
   --------------------------------------------------------- */
const iris = document.querySelector("#iris");
const irisMark = iris.querySelector(".isotipo");

async function intro() {
  if (reduceMotion) {
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
    return;
  }
  await wait(250);
  await shutter(irisMark, 650);
  document.body.classList.remove("is-loading");
  iris.classList.add("is-opening");
  setTimeout(() => document.body.classList.add("is-ready"), 120);
  setTimeout(() => iris.classList.remove("is-opening"), 650);
}
if (document.readyState === "complete") intro();
else window.addEventListener("load", intro, { once: true });
// Seguridad: si algo tarda, la página se muestra igual
setTimeout(() => {
  if (document.body.classList.contains("is-loading")) {
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
  }
}, 3000);

/* ---------------------------------------------------------
   Transición entre secciones: iris que se cierra y se abre
   --------------------------------------------------------- */
let irisBusy = false;
async function irisTo(target, x, y) {
  if (irisBusy) return;
  if (reduceMotion) {
    target.scrollIntoView();
    return;
  }
  irisBusy = true;
  iris.style.setProperty("--ix", `${x}px`);
  iris.style.setProperty("--iy", `${y}px`);
  iris.classList.remove("is-opening");
  iris.classList.add("is-closing");
  await wait(420);
  const top = target.getBoundingClientRect().top + window.scrollY - (target.id === "inicio" ? 0 : 64);
  window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
  await shutter(irisMark, 520);
  iris.classList.remove("is-closing");
  iris.classList.add("is-opening");
  await wait(640);
  iris.classList.remove("is-opening");
  irisBusy = false;
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href");
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    setMenu(false);
    const rect = link.getBoundingClientRect();
    irisTo(target, event.clientX || rect.left + rect.width / 2, event.clientY || rect.top + rect.height / 2);
    history.replaceState(null, "", id);
  });
});

/* ---------- Menú móvil ---------- */
const menuToggle = document.querySelector(".menu-toggle");
function setMenu(open) {
  if (!menuToggle) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  document.body.classList.toggle("menu-open", open);
}
menuToggle?.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

/* ---------- Header y sección activa ---------- */
const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 30);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const navLinks = [...document.querySelectorAll(".main-nav a:not(.nav-cta)")];
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === `#${entry.target.id}`)));
    });
  },
  { rootMargin: "-45% 0px -50% 0px" },
);
["en-accion", "modulos", "esencia", "registro"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) sectionObserver.observe(el);
});

/* ---------- Luz del hero que sigue al cursor ---------- */
const heroEl = document.querySelector(".hero");
const heroLight = heroEl.querySelector(".hero-light");
if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  heroEl.addEventListener("pointermove", (e) => {
    const r = heroEl.getBoundingClientRect();
    heroLight.style.setProperty("--mx", `${((e.clientX - r.left) / r.width - 0.7) * 120}px`);
    heroLight.style.setProperty("--my", `${((e.clientY - r.top) / r.height - 0.3) * 120}px`);
  });
}

/* ---------------------------------------------------------
   Pieza 9:16: se reproduce como el video de la marca
   --------------------------------------------------------- */
const reel = document.querySelector("#reel");
const scenes = [...reel.querySelectorAll(".reel-scene")];
const bars = [...reel.querySelectorAll(".reel-progress i")];
const DURATIONS = [1900, 1800, 3800, 2600];
let sceneIndex = 0;
let sceneStart = 0;
let paused = reduceMotion;
let reelVisible = true;

function showScene(i) {
  scenes.forEach((s, k) => s.classList.toggle("is-active", k === i));
  bars.forEach((b, k) => b.style.setProperty("--p", k < i ? "100%" : "0%"));
  sceneIndex = i;
  sceneStart = performance.now();
  const logo = scenes[i].querySelector(".reel-logo .isotipo");
  if (logo) setTimeout(() => shutter(logo, 650), i === 0 ? 900 : 300);
}
function reelLoop(now) {
  if (!paused && reelVisible && !document.hidden) {
    const elapsed = now - sceneStart;
    const p = Math.min(100, (elapsed / DURATIONS[sceneIndex]) * 100);
    bars[sceneIndex].style.setProperty("--p", `${p}%`);
    if (elapsed >= DURATIONS[sceneIndex]) showScene((sceneIndex + 1) % scenes.length);
  } else {
    sceneStart = now - (parseFloat(bars[sceneIndex].style.getPropertyValue("--p")) / 100 || 0) * DURATIONS[sceneIndex];
  }
  requestAnimationFrame(reelLoop);
}
if (reduceMotion) {
  showScene(2);
  bars.forEach((b) => b.style.setProperty("--p", "100%"));
} else {
  showScene(0);
  requestAnimationFrame(reelLoop);
}
const reelToggle = reel.querySelector(".reel-toggle");
reelToggle.addEventListener("click", () => {
  paused = !paused;
  reelToggle.setAttribute("aria-label", paused ? "Reproducir animación" : "Pausar animación");
  reelToggle.innerHTML = `<i data-lucide="${paused ? "play" : "pause"}"></i>`;
  window.lucide?.createIcons();
});
new IntersectionObserver(([e]) => (reelVisible = e.isIntersecting)).observe(reel);

/* ---------------------------------------------------------
   La app en acción: el teléfono cambia de pantalla al bajar
   --------------------------------------------------------- */
const phone = document.querySelector("#tourPhone");
const screens = [...phone.querySelectorAll(".screen")];
const steps = [...document.querySelectorAll(".tour-step")];
const dots = [...document.querySelectorAll(".tour-dots button")];
let currentScreen = 0;
let screenTimer;

function countUp(scope) {
  scope.querySelectorAll("[data-count]").forEach((el) => {
    const end = Number(el.dataset.count);
    if (reduceMotion) return void (el.textContent = end);
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / 1100);
      el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

function setScreen(i) {
  if (i === currentScreen) return;
  const prev = screens[currentScreen];
  const next = screens[i];
  clearTimeout(screenTimer);
  screens.forEach((s) => s.classList.remove("is-entering", "is-leaving"));
  prev.classList.remove("is-active");
  prev.classList.add("is-leaving");
  next.classList.add("is-entering");
  if (i === 2) {
    // "¡Clic!": la foto se convierte en propuesta
    phone.classList.remove("is-clicking");
    void phone.offsetWidth;
    phone.classList.add("is-clicking");
  }
  countUp(next);
  screenTimer = setTimeout(() => {
    prev.classList.remove("is-leaving");
    next.classList.remove("is-entering");
    next.classList.add("is-active");
  }, 760);
  currentScreen = i;
  phone.dataset.screen = i;
  steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
  dots.forEach((d, k) => d.setAttribute("aria-selected", String(k === i)));
}

// Se observa el título de cada paso (no la caja completa) para que la pantalla
// cambie justo cuando el texto llega a la zona de lectura.
const stepObserver = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && setScreen(Number(e.target.closest(".tour-step").dataset.step))),
  // En celular el teléfono ocupa la parte de arriba: la zona de lectura queda debajo
  { rootMargin: window.matchMedia("(max-width: 1020px)").matches ? "-60% 0px -15% 0px" : "-35% 0px -40% 0px" },
);
steps.forEach((s) => stepObserver.observe(s.querySelector("h3")));
dots.forEach((dot) =>
  dot.addEventListener("click", () => {
    const step = steps[Number(dot.dataset.go)];
    step.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    setScreen(Number(dot.dataset.go));
  }),
);
countUp(screens[0]);

/* ---------- Revelado de secciones ---------- */
const mark = (selector, cls) => document.querySelectorAll(selector).forEach((el) => el.classList.add(cls));
mark(".tour-head, .modules-head, .essence h2, .register-copy > h2, .register-copy > p", "reveal");
mark(".module-list, .essence-grid, .register-copy ul", "reveal-stagger");
mark(".modules, .register", "wipe");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08 },
);
document.querySelectorAll(".reveal, .reveal-stagger, .wipe").forEach((el) => revealObserver.observe(el));

/* ---------- Luz que sigue al cursor en los módulos ---------- */
document.querySelectorAll(".module").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--x", `${e.clientX - r.left}px`);
    card.style.setProperty("--y", `${e.clientY - r.top}px`);
  });
});

/* ---------- El logo del header hace clic al pasar el cursor ---------- */
const brandLogo = document.querySelector(".site-header .brand .isotipo");
document.querySelector(".site-header .brand").addEventListener("pointerenter", () => shutter(brandLogo, 600));
document.querySelectorAll(".button-shutter").forEach((btn) =>
  btn.addEventListener("pointerenter", () => shutter(btn.querySelector(".isotipo"), 600)),
);

/* ---------- WhatsApp y redes sociales ---------- */
const whatsappDigits = CONFIG.whatsappNumber.replace(/\D/g, "");
const whatsappButton = document.querySelector("#whatsappFloat");
if (whatsappDigits && whatsappButton) {
  whatsappButton.href = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(CONFIG.whatsappMessage)}`;
  whatsappButton.hidden = false;
}
let visibleSocial = 0;
document.querySelectorAll("[data-social]").forEach((link) => {
  const url = CONFIG.social[link.dataset.social];
  if (url) {
    link.href = url;
    visibleSocial += 1;
  } else {
    link.remove();
  }
});
if (visibleSocial > 0) document.querySelector(".social-fallback")?.remove();

/* ---------- Formulario de acceso anticipado ---------- */
const form = document.querySelector("#earlyAccessForm");
const statusMessage = document.querySelector("#formStatus");
const submitButton = form.querySelector('button[type="submit"]');
const submitLabel = submitButton.querySelector("span");
const defaultLabel = submitLabel.textContent;
const formMark = form.querySelector(".form-mark .isotipo");

function setStatus(type, message) {
  statusMessage.className = `form-status ${type}`;
  statusMessage.textContent = message;
}
function setSending(sending) {
  submitButton.disabled = sending;
  submitLabel.textContent = sending ? "Enviando..." : defaultLabel;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusMessage.className = "form-status";
  statusMessage.textContent = "";
  if (!form.reportValidity()) return;

  const values = Object.fromEntries(new FormData(form).entries());
  const payload = {
    nombre: values.fullName.trim(),
    empresa: values.businessName.trim(),
    tipo_negocio: values.businessType,
    whatsapp: values.whatsapp.trim(),
    correo: values.email.trim(),
    maneja_redes: values.socialManagement,
    fecha_envio: new Date().toISOString(),
    origen: "Landing POST IA",
  };

  setSending(true);
  shutter(formMark, 600);

  if (!CONFIG.googleAppsScriptUrl) {
    console.table(payload);
    setStatus("success", SUCCESS_MESSAGE);
    form.reset();
    setSending(false);
    return;
  }

  try {
    // Apps Script no devuelve cabeceras CORS: se envía en modo "no-cors"
    // (la respuesta no se puede leer, pero la petición sí llega a la hoja).
    await fetch(CONFIG.googleAppsScriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    setStatus("success", SUCCESS_MESSAGE);
    form.reset();
  } catch (error) {
    setStatus("error", ERROR_MESSAGE);
  } finally {
    setSending(false);
  }
});
