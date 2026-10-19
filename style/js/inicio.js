/* ─────────────────────────────────────────────
   inicio.js — Dinamismo de la página de inicio
   ───────────────────────────────────────────── */

/* 1. CITAS ROTATIVAS (fragmentos reales de sus poemas) */
const CITAS = [
  { texto: "¡Oh, patria! ¡oh, dulce patria! en ti me inspiro, en ti contemplo la virtud y el bien.", obra: "— A la patria (1874)" },
  { texto: "Ave del bosque, ¿adónde vas volando?\n¿Dónde está tu nido, di, dónde reposas?", obra: "— El ave y el nido (1876)" },
  { texto: "¡Qué importa que la muerte me rodee si vivo en el recuerdo de mi pueblo!", obra: "— Sombras (1887)" },
  { texto: "Yo tengo fe en el porvenir brillante que nos augura la razón serena.", obra: "— Mi ofrenda a la patria (1883)" },
  { texto: "Educar es sembrar en tierra fértil la semilla del bien para la patria.", obra: "— Pensamiento atribuido" },
  { texto: "Ruinas que fuisteis un tiempo moradas del genio y del arte, ¿qué voces guardáis?", obra: "— Ruinas (1876)" },
];

let citaActual = 0;
let citaTimer = null;

function mostrarCita(idx, animado = true) {
  const el = document.getElementById('quoteText');
  const obra = document.getElementById('quoteObra');
  const dots = document.getElementById('quoteDots');
  if (!el || !obra || !dots) return;

  const cita = CITAS[idx];

  if (animado) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
    obra.style.opacity = '0';
    setTimeout(() => {
      el.textContent = cita.texto;
      obra.textContent = cita.obra;
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      obra.style.transition = 'opacity 0.6s ease 0.2s';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      obra.style.opacity = '1';
    }, 350);
  } else {
    el.textContent = cita.texto;
    obra.textContent = cita.obra;
  }

  // Actualizar dots
  dots.innerHTML = '';
  CITAS.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'qdot' + (i === idx ? ' active' : '');
    dot.setAttribute('aria-label', `Cita ${i + 1}`);
    dot.addEventListener('click', () => { clearInterval(citaTimer); mostrarCita(i); iniciarRotacion(i); });
    dots.appendChild(dot);
  });
}

function iniciarRotacion(desde = 0) {
  citaActual = desde;
  mostrarCita(citaActual, citaActual !== 0);
  citaTimer = setInterval(() => {
    citaActual = (citaActual + 1) % CITAS.length;
    mostrarCita(citaActual);
  }, 5500);
}

/* 2. CIFRAS Y VALORES HISTÓRICOS */
function animarContador(el) {
  const target = parseInt(el.dataset.target, 10);
  el.textContent = target;
}

/* 3. PARTÍCULAS DE GRANO CINEMATOGRÁFICO (Canvas) */
function iniciarGrano() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'heroGrain';
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0.04;z-index:1;';
  hero.style.position = 'relative';
  hero.insertBefore(canvas, hero.firstChild);

  const ctx = canvas.getContext('2d');
  let frame = 0;

  function resize() {
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function drawGrain() {
    frame++;
    if (frame % 2 !== 0) { requestAnimationFrame(drawGrain); return; } // 30fps
    const { width, height } = canvas;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255;
      data[i] = v; data[i+1] = v; data[i+2] = v; data[i+3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(drawGrain);
  }
  drawGrain();
}

/* 4. PARALLAX SUAVE EN EL RETRATO */
function iniciarParallaxHero() {
  const portrait = document.querySelector('.portrait-frame');
  if (!portrait) return;
  window.addEventListener('scroll', () => {
    const offset = window.scrollY * 0.22;
    portrait.style.transform = `translateY(${offset}px)`;
  }, { passive: true });
}

/* 5. INICIALIZAR TODO AL CARGAR */
document.addEventListener('DOMContentLoaded', () => {
  // Citas: arrancar cuando la sección sea visible
  const quoteSection = document.querySelector('.quote-section');
  if (quoteSection) {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        iniciarRotacion(0);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(quoteSection);
  }

  // Contadores: disparar al entrar en viewport
  const statNums = document.querySelectorAll('.stat-number');
  if (statNums.length) {
    const obsCount = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animarContador(e.target);
          obsCount.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    statNums.forEach(n => obsCount.observe(n));
  }

  // Grano cinematográfico
  iniciarGrano();

  // Parallax retrato
  iniciarParallaxHero();
});
