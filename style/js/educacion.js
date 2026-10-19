/* ─────────────────────────────────────────────
   educacion.js — Tabs del Currículo Hostosiano
   ───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.curr-tab');
  const panes = document.querySelectorAll('.curr-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = 'pane-' + tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
});
