// Formulario de contratación: arma el mensaje y lo abre en WhatsApp.
(() => {
  const WHATSAPP = '5492236692392';
  const WHATSAPP_LEGIBLE = '+54 9 223 669-2392';

  // Campo del formulario → etiqueta en el mensaje. Los marcados como `siempre` se envían aunque estén vacíos.
  const CAMPOS = [
    { name: 'nombre', label: 'Nombre' },
    { name: 'contacto', label: 'Contacto' },
    { name: 'evento', label: 'Evento', siempre: true },
    { name: 'formato', label: 'Formato', siempre: true },
    { name: 'fecha', label: 'Fecha' },
    { name: 'lugar', label: 'Lugar' },
    { name: 'musica', label: 'No puede faltar' },
  ];

  const form = document.getElementById('pedido');
  if (!form) return;
  const nota = form.querySelector('[data-nota]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const datos = new FormData(form);

    const lineas = ['Hola Recover Music! Quiero consultar por una fecha.'];
    for (const { name, label, siempre } of CAMPOS) {
      const valor = String(datos.get(name) ?? '').trim();
      if (valor || siempre) lineas.push(`${label}: ${valor}`);
    }

    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lineas.join('\n'))}`;
    window.open(url, '_blank', 'noopener');

    if (nota) nota.textContent = `Si WhatsApp no se abrió, escribinos al ${WHATSAPP_LEGIBLE}.`;
  });
})();
