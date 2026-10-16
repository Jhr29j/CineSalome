const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? '×' : '☰';
  });
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = '☰';
  }));
}

// Observador de elementos dinámicos que aparecen con el scroll
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

// Efecto dinámico en la barra de navegación al hacer scroll y botón subir
const backTop = document.getElementById('backTop');
const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
  const isScrolled = window.scrollY > 25;
  if (nav) nav.classList.toggle('scrolled', isScrolled);
  if (backTop) backTop.classList.toggle('show', window.scrollY > 380);
}, { passive: true });

if (backTop) {
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
