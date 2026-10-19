/* ─────────────────────────────────────────────
   linea-tiempo.js — Barra de Progreso y Efectos
   ───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  const progressBar = document.getElementById('timelineProgress');
  const timeline = document.getElementById('timeline');

  if (progressBar && timeline) {
    window.addEventListener('scroll', () => {
      const rect = timeline.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calcular qué porcentaje de la línea de tiempo ha recorrido el usuario
      const totalHeight = timeline.offsetHeight;
      const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (totalHeight + windowHeight * 0.5)));
      
      progressBar.style.width = `${progress * 100}%`;
    }, { passive: true });
  }
});
