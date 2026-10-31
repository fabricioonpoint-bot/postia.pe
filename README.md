# POST IA — Landing

Landing pública de POST IA, el agente de marketing con IA para MYPES.

**Enlace público:** https://fabricioonpoint-bot.github.io/postia.pe/

## Publicar con GitHub Pages

1. En este repositorio, abre **Settings → Pages**.
2. En **Source**, elige **Deploy from a branch**.
3. Selecciona la rama `main` y la carpeta `/ (root)`, y pulsa **Save**.
4. En unos minutos la página queda disponible en el enlace de arriba.

El archivo `.nojekyll` ya está incluido para que GitHub Pages sirva los archivos tal cual.

## Configuración rápida

Todo lo editable está al inicio de `script.js`, en el bloque `CONFIG`:

| Campo | Para qué sirve |
| --- | --- |
| `googleAppsScriptUrl` | Web App de Google Apps Script que guarda los registros del formulario en Google Sheets. |
| `whatsappNumber` | Número con código de país, solo dígitos (ej. `51999999999`). Si se llena, aparece el botón flotante de WhatsApp. |
| `whatsappMessage` | Mensaje que se precarga al abrir WhatsApp. |
| `social` | Enlaces a Instagram, Facebook, TikTok y LinkedIn. Los que queden vacíos no se muestran en el footer. |

## Archivos

- `index.html` — estructura y contenido
- `styles.css` — estilos (colores y tipografías en `:root`)
- `script.js` — configuración, menú móvil, demo y formulario
- `post-ia-agent-hero.webp` — imagen principal
- `mode21-barberia.webp` — publicación de ejemplo en la demo
- `og-image.jpg` — imagen que aparece al compartir el enlace (WhatsApp, Facebook, LinkedIn)
- `favicon.svg` — ícono de la pestaña
- `.nojekyll`

## Formulario

Envía nombre, negocio, tipo de negocio, WhatsApp, correo y cómo maneja sus redes al Apps Script configurado. Como Apps Script no permite leer la respuesta desde otro dominio, la confirmación se muestra cuando la petición sale correctamente; revisa la hoja de cálculo para confirmar los registros.

## Caché

`index.html` carga `styles.css`, `script.js`, el favicon y la imagen para compartir con `?v=AAAAMMDDHHMM`. Cuando cambies alguno de esos archivos, actualiza ese número para que los visitantes vean la versión nueva sin borrar caché.
