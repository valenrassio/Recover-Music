// Contenido editable desde la planilla de la banda: repertorio, fechas y sugerencias de temas.
(() => {
  const API = window.RM_CONFIG?.sheetsApi;
  if (!API) return; // sin planilla conectada queda el contenido fijo de index.html

  // --- Leer fechas y repertorio --------------------------------------------
  fetch(API)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((datos) => {
      pintarRepertorio(datos.repertorio);
      // La cuenta regresiva (js/countdown.js) toma la lista de fechas desde este evento.
      document.dispatchEvent(new CustomEvent('rm:fechas', { detail: datos.fechas || [] }));
    })
    .catch(() => { /* si falla, queda lo que ya está en la página */ });

  const escapar = (texto) => String(texto).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

  function pintarRepertorio(lados) {
    if (!lados || !lados.A?.length) return;
    let numero = 0;
    for (const lado of ['A', 'B']) {
      const lista = document.querySelector(`[data-lado="${lado}"]`);
      const contador = document.querySelector(`[data-count="${lado}"]`);
      const temas = lados[lado] || [];
      if (!lista) continue;
      lista.innerHTML = temas.map((t) => {
        numero += 1;
        return `<li class="track"><span class="track__n">${String(numero).padStart(2, '0')}</span>`
          + `<span class="track__info"><span class="track__title">${escapar(t.tema)}</span>`
          + `<span class="track__artist">${escapar(t.artista.toUpperCase())}</span></span>`
          + `<span class="track__time">${escapar(t.duracion)}</span></li>`;
      }).join('');
      if (contador) contador.textContent = `${temas.length} ${temas.length === 1 ? 'TEMA' : 'TEMAS'}${contador.dataset.suffix || ''}`;
    }
  }

  // --- Sugerencias de temas ------------------------------------------------
  const form = document.querySelector('[data-suggest]');
  const enlace = document.querySelector('[data-suggest-fallback]');
  if (!form) return;

  form.hidden = false;
  if (enlace) enlace.hidden = true;

  const nota = form.querySelector('[data-suggest-note]');
  const boton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(form));
    if (!datos.tema.trim()) {
      nota.textContent = 'Escribí el nombre del tema.';
      form.tema.focus();
      return;
    }

    boton.disabled = true;
    nota.textContent = 'Enviando…';
    try {
      // text/plain evita el pedido previo de permisos (CORS) que el script de Google no responde.
      const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(datos) });
      const respuesta = await r.json();
      if (!respuesta.ok) throw new Error(respuesta.error);
      form.reset();
      nota.textContent = '¡Gracias! Le llegó a la banda.';
    } catch {
      nota.textContent = 'No se pudo enviar. Probá de nuevo en un rato.';
    } finally {
      boton.disabled = false;
    }
  });
})();
