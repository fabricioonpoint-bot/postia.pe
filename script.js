/* =========================================================
   CONFIGURACIÓN — edita solo este bloque
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
  social: {
    instagram: "",
    facebook: "",
    tiktok: "",
    linkedin: "",
  },
};

const SUCCESS_MESSAGE =
  "¡Listo! Recibimos tus datos. Te contactaremos pronto para darte acceso a la beta de POST IA.";
const ERROR_MESSAGE =
  "No pudimos enviar tus datos. Revisa tu conexión e inténtalo nuevamente.";

/* ========================================================= */

if (window.lucide) {
  window.lucide.createIcons();
}

/* ---------- Animación al hacer scroll ---------- */
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
}

/* ---------- Menú móvil ---------- */
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#mainNav");

function setMenu(open) {
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  document.body.classList.toggle("menu-open", open);
}

menuToggle?.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});
mainNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

/* ---------- Header con fondo al hacer scroll ---------- */
const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Demo: cambiar formato Post / Historia ---------- */
const formatButtons = document.querySelectorAll("[data-format]");
const socialPreview = document.querySelector("[data-preview-format]");

formatButtons.forEach((button) => {
  button.addEventListener("click", () => {
    formatButtons.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-pressed", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");
    socialPreview.dataset.previewFormat = button.dataset.format;
  });
});

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
if (visibleSocial > 0) {
  document.querySelector(".social-fallback")?.remove();
}

/* ---------- Formulario de acceso anticipado ---------- */
const form = document.querySelector("#earlyAccessForm");
const statusMessage = document.querySelector("#formStatus");
const submitButton = form.querySelector('button[type="submit"]');
const submitLabel = submitButton.querySelector("span");
const defaultLabel = submitLabel.textContent;

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

  if (!CONFIG.googleAppsScriptUrl) {
    console.table(payload);
    console.info("Formulario en modo demostración: falta googleAppsScriptUrl en CONFIG.");
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
