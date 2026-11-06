// Pestañas INPUT / OUTPUT del rider técnico. Sin JavaScript se ven las dos tablas una debajo de la otra.
(() => {
  const lista = document.querySelector('[data-tabs]');
  if (!lista) return;

  const pestanas = [...lista.querySelectorAll('[role="tab"]')];
  const panel = (tab) => document.getElementById(tab.getAttribute('aria-controls'));

  const elegir = (elegida) => {
    for (const tab of pestanas) {
      const activa = tab === elegida;
      tab.setAttribute('aria-selected', String(activa));
      tab.tabIndex = activa ? 0 : -1;
      panel(tab).hidden = !activa;
    }
  };

  pestanas.forEach((tab) => tab.addEventListener('click', () => elegir(tab)));

  // Flechas izquierda/derecha para moverse entre pestañas con el teclado
  lista.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = pestanas.indexOf(document.activeElement);
    const siguiente = pestanas[(i + (e.key === 'ArrowRight' ? 1 : -1) + pestanas.length) % pestanas.length];
    elegir(siguiente);
    siguiente.focus();
  });

  elegir(pestanas[0]);
})();
