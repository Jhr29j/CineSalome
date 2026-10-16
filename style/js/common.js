const menuToggle=document.getElementById('menuToggle');
const navLinks=document.getElementById('navLinks');
if(menuToggle&&navLinks){menuToggle.addEventListener('click',()=>{const open=navLinks.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open));menuToggle.textContent=open?'×':'☰';});navLinks.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{navLinks.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');menuToggle.textContent='☰';}));}
const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(element=>revealObserver.observe(element));
const backTop=document.getElementById('backTop');
if(backTop){window.addEventListener('scroll',()=>backTop.classList.toggle('show',window.scrollY>380));backTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));}
