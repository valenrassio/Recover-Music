// Cuenta regresiva a la próxima fecha.
// Arranca con la fecha escrita en index.html (data-countdown). Si la planilla está conectada,
// js/contenido.js manda la lista de fechas con el evento "rm:fechas" y se usa esa.
(() => {
  const DURACION_SHOW_HORAS = 5; // durante este tiempo después del inicio se muestra "¡HOY TOCAMOS!"
  const ZONA = 'America/Argentina/Buenos_Aires';

  const reloj = document.querySelector('[data-countdown]');
  if (!reloj) return;

  const seccion = reloj.closest('section');
  const hoy = seccion.querySelector('[data-today]');
  const titulo = seccion.querySelector('[data-show-eyebrow]');
  const texto = seccion.querySelector('[data-show-text]');
  const mapa = seccion.querySelector('[data-show-map]');
  const campos = {
    d: reloj.querySelector('[data-unit="d"]'),
    h: reloj.querySelector('[data-unit="h"]'),
    m: reloj.querySelector('[data-unit="m"]'),
    s: reloj.querySelector('[data-unit="s"]'),
  };

  // `fija`: la fecha viene del HTML y sus textos ya están escritos.
  let fechas = [{ inicio: reloj.dataset.countdown, fija: true }];
  let actual = null;

  const ms = (fecha) => new Date(fecha.inicio).getTime();
  const terminada = (fecha, ahora) => ahora >= ms(fecha) + DURACION_SHOW_HORAS * 3600 * 1000;

  function describir(fecha) {
    const partes = Object.fromEntries(new Intl.DateTimeFormat('es-AR', {
      timeZone: ZONA, weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date(fecha.inicio)).map((p) => [p.type, p.value]));

    const hora = partes.minute === '00' ? `${Number(partes.hour)} H` : `${partes.hour}:${partes.minute} H`;
    titulo.textContent = ['PRÓXIMA FECHA', `${partes.weekday} ${partes.day} de ${partes.month}`, hora, fecha.lugar]
      .filter(Boolean).join(' · ').toUpperCase();

    texto.textContent = fecha.texto
      || (fecha.lugar ? `Tocamos en vivo en ${fecha.lugar}. Vení temprano, traé a tus amigos y cantá con nosotros.`
                      : 'Falta poco para el próximo show. Seguinos en Instagram para todos los detalles.');

    mapa.hidden = !fecha.lugar && !fecha.mapa;
    mapa.href = fecha.mapa || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${fecha.lugar} La Plata`)}`;
  }

  const poner = (el, valor) => {
    const t = String(valor).padStart(2, '0');
    if (el.textContent === t) return;
    el.textContent = t;
    el.classList.remove('is-tick');
    void el.offsetWidth; // reinicia la animación
    el.classList.add('is-tick');
  };

  function actualizar() {
    const ahora = Date.now();
    const proxima = fechas.find((f) => !Number.isNaN(ms(f)) && !terminada(f, ahora));

    seccion.hidden = !proxima;
    if (!proxima) return;

    if (proxima !== actual) {
      actual = proxima;
      if (!proxima.fija) describir(proxima);
    }

    const enCurso = ahora >= ms(proxima);
    reloj.hidden = enCurso;
    if (hoy) hoy.hidden = !enCurso;
    if (enCurso) return;

    let resto = Math.floor((ms(proxima) - ahora) / 1000);
    poner(campos.d, Math.floor(resto / 86400)); resto %= 86400;
    poner(campos.h, Math.floor(resto / 3600)); resto %= 3600;
    poner(campos.m, Math.floor(resto / 60));
    poner(campos.s, resto % 60);
  }

  document.addEventListener('rm:fechas', (e) => {
    fechas = e.detail;
    actual = null;
    actualizar();
  });

  actualizar();
  setInterval(actualizar, 1000);
})();
