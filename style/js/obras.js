/* ─────────────────────────────────────────────
   obras.js — Acordeón Interactivo de las 8 Obras
   ───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.work-card');

  cards.forEach(card => {
    const header = card.querySelector('.work-header');
    if (header) {
      header.addEventListener('click', () => {
        const isActive = card.classList.contains('active');

        // Cerrar todos los demás para mantener orden cinematográfico
        cards.forEach(c => {
          c.classList.remove('active');
          c.querySelector('.work-header')?.setAttribute('aria-expanded', 'false');
        });

        // Si no estaba activo, abrirlo suavemente hacia abajo
        if (!isActive) {
          card.classList.add('active');
          header.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // Abrir la primera obra por defecto para invitar a la lectura
  if (cards.length > 0) {
    cards[0].classList.add('active');
    cards[0].querySelector('.work-header')?.setAttribute('aria-expanded', 'true');
  }
});
