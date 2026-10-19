/* ─────────────────────────────────────────────
   aportes.js — Animación de Contadores de Impacto
   ───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  const nums = document.querySelectorAll('.impacto-num');
  if (!nums.length) return;

  function animar(el) {
    const target = parseInt(el.dataset.target, 10);
    el.textContent = target;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animar(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  nums.forEach(n => observer.observe(n));
});
