const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxXMrzEDOykRBifgB-wo-5s0cpvo9stwFHvka60E34YB2SMOak9ZU1zTATzosRtowi55A/exec";
const SUCCESS_MESSAGE =
  "Gracias por registrarte. Te contactaremos pronto para participar en el lanzamiento de POST IA.";

const form = document.querySelector("#earlyAccessForm");
const statusMessage = document.querySelector("#formStatus");
const submitButton = form.querySelector('button[type="submit"]');
const submitLabel = submitButton.querySelector("span");

if (window.lucide) {
  window.lucide.createIcons();
}

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

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const formatButtons = document.querySelectorAll("[data-format]");
const socialPreview = document.querySelector("[data-preview-format]");

formatButtons.forEach((button) => {
  button.addEventListener("click", () => {
    formatButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    socialPreview.dataset.previewFormat = button.dataset.format;
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.reportValidity()) {
    return;
  }

  const formValues = Object.fromEntries(new FormData(form).entries());
  const payload = {
    nombre: formValues.fullName,
    empresa: formValues.businessName,
    tipo_negocio: formValues.businessType,
    whatsapp: formValues.whatsapp,
    correo: formValues.email,
    maneja_redes: formValues.socialManagement,
    fecha_envio: new Date().toISOString(),
    origen: "Landing POST IA",
  };

  statusMessage.className = "form-status";
  statusMessage.textContent = "";
  submitButton.disabled = true;
  submitLabel.textContent = "Enviando...";

  if (!GOOGLE_APPS_SCRIPT_URL) {
    await new Promise((resolve) => window.setTimeout(resolve, 550));
    console.table(payload);
    console.info(
      "Formulario en modo demostración. Añade la URL del despliegue de Apps Script en GOOGLE_APPS_SCRIPT_URL.",
    );
    showSuccess(SUCCESS_MESSAGE);
    return;
  }

  try {
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    showSuccess(SUCCESS_MESSAGE);
  } catch (error) {
    statusMessage.classList.add("error");
    statusMessage.textContent =
      "No pudimos enviar tus datos. Revisa tu conexión e inténtalo nuevamente.";
    submitButton.disabled = false;
    submitLabel.textContent = "Reservar acceso anticipado";
  }
});

function showSuccess(message) {
  statusMessage.classList.add("success");
  statusMessage.textContent = message;
  form.reset();
  submitButton.disabled = false;
  submitLabel.textContent = "Reservar acceso anticipado";
}
