// Cuenta regresiva a la próxima fecha. La fecha se cambia en index.html (data-countdown).
(() => {
  const DURACION_SHOW_HORAS = 5; // durante este tiempo después del inicio se muestra "ES HOY"

  const reloj = document.querySelector('[data-countdown]');
  if (!reloj) return;

  const seccion = reloj.closest('section');
  const inicio = new Date(reloj.dataset.countdown).getTime();
  if (Number.isNaN(inicio)) return;
  const fin = inicio + DURACION_SHOW_HORAS * 3600 * 1000;

  const campos = {
    d: reloj.querySelector('[data-unit="d"]'),
    h: reloj.querySelector('[data-unit="h"]'),
    m: reloj.querySelector('[data-unit="m"]'),
    s: reloj.querySelector('[data-unit="s"]'),
  };
  const hoy = seccion.querySelector('[data-today]');

  const poner = (el, valor) => {
    const texto = String(valor).padStart(2, '0');
    if (el.textContent === texto) return;
    el.textContent = texto;
    el.classList.remove('is-tick');
    void el.offsetWidth; // reinicia la animación
    el.classList.add('is-tick');
  };

  let timer;
  const actualizar = () => {
    const ahora = Date.now();

    if (ahora >= fin) {          // ya pasó: se oculta hasta que se cargue una fecha nueva
      seccion.hidden = true;
      clearInterval(timer);
      return;
    }
    if (ahora >= inicio) {       // es el día y la hora del show
      reloj.hidden = true;
      if (hoy) hoy.hidden = false;
      return;
    }

    let resto = Math.floor((inicio - ahora) / 1000);
    const dias = Math.floor(resto / 86400); resto %= 86400;
    const horas = Math.floor(resto / 3600); resto %= 3600;
    poner(campos.d, dias);
    poner(campos.h, horas);
    poner(campos.m, Math.floor(resto / 60));
    poner(campos.s, resto % 60);
  };

  actualizar();
  timer = setInterval(actualizar, 1000);
})();
