// Movimiento de la página: ecualizador, aparición al hacer scroll y brillo del vidrio.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Ecualizador de la portada -------------------------------------------
  // Alto de cada barra (%) y duración del rebote (s); el retraso varía para que no se muevan juntas.
  const ALTOS = [18, 30, 52, 40, 70, 84, 62, 44, 76, 58, 36, 50, 80, 66, 48, 28, 42, 72, 84, 60, 38, 54, 78, 64, 46, 30, 22, 40, 68, 80];
  const DURACIONES = [.58, .66, .42, .42, .42, .5, .66, .5, .66, .74, .5, .74, .74, .42, .42, .5, .5, .74, .9, .74, .5, .74, .74, .5, .74, .58, .66, .5, .9, .42];

  const barras = () => ALTOS.map((alto, i) => {
    const delay = (1.4 + ((i * 37) % 60) / 100).toFixed(2);
    return `<i style="--h:${alto}%;--d:${DURACIONES[i]}s;--delay:${delay}s"></i>`;
  }).join('');

  document.querySelectorAll('[data-eq]').forEach((eq) => {
    eq.querySelectorAll('.eq__row').forEach((fila) => { fila.innerHTML = barras(); });
  });

  // --- Aparición al hacer scroll -------------------------------------------
  // Los hijos de [data-stagger] aparecen uno detrás de otro.
  document.querySelectorAll('[data-stagger]').forEach((grupo) => {
    [...grupo.children].forEach((hijo, i) => {
      hijo.setAttribute('data-reveal', '');
      hijo.style.setProperty('--i', i);
    });
  });

  const revelar = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revelar.forEach((el) => el.classList.add('is-in'));
  } else {
    const observer = new IntersectionObserver((entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        entrada.target.classList.add('is-in');
        observer.unobserve(entrada.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revelar.forEach((el) => observer.observe(el));
  }

  // --- Brillo del vidrio que sigue al mouse --------------------------------
  if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;

  document.addEventListener('pointermove', (e) => {
    const vidrio = e.target.closest?.('.glass');
    if (!vidrio) return;
    const r = vidrio.getBoundingClientRect();
    vidrio.style.setProperty('--mx', `${e.clientX - r.left}px`);
    vidrio.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });
})();
