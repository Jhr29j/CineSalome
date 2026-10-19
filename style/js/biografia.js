/* ─────────────────────────────────────────────
   biografia.js — Dinamismo e Interactividad
   ───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Flip cards: soporte para click/touch en móviles
  const flipCards = document.querySelectorAll('.flip-card');
  flipCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });

  // 2. Parallax suave en el retrato biográfico
  const portrait = document.querySelector('.bio-portrait-img');
  if (portrait) {
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY;
      if (scrollPos < 800) {
        portrait.style.transform = `translateY(${scrollPos * 0.08}px)`;
      }
    }, { passive: true });
  }
});
