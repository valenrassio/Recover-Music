// Menú lateral para celular: abre/cierra el panel y bloquea el scroll de fondo.
(() => {
  const header = document.querySelector('.site-header');
  const button = header?.querySelector('.menu-btn');
  if (!button) return;

  const isOpen = () => header.classList.contains('open');

  const setOpen = (open) => {
    header.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };

  button.addEventListener('click', () => setOpen(!isOpen()));

  document.addEventListener('click', (e) => {
    if (!isOpen()) return;
    // Un link del menú navega y cierra; cualquier toque fuera del panel también cierra.
    if (e.target.closest('.site-nav a') || !e.target.closest('.site-nav, .menu-btn')) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      setOpen(false);
      button.focus();
    }
  });
})();
