(() => {
  const API = window.CINE_API_URL || 'http://127.0.0.1:8000';
  const form = document.getElementById('authForm');
  const message = document.getElementById('formMessage');
  const title = document.getElementById('formTitle');
  const subtitle = document.getElementById('formSubtitle');
  const submit = document.getElementById('submitButton');
  let mode = 'login';
  const fields = [...document.querySelectorAll('[data-field]')];
  const setMode = next => {
    mode = next;
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.mode === mode));
    fields.forEach(field => field.classList.toggle('hidden', mode !== 'register'));
    document.getElementById('name').required = mode === 'register';
    document.getElementById('listNumber').required = mode === 'register';
    document.getElementById('grade').required = mode === 'register';
    document.getElementById('technique').required = mode === 'register';
    document.getElementById('password').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
    document.getElementById('password').minLength = mode === 'login' ? 1 : 8;
    title.textContent = mode === 'login' ? 'Bienvenido de nuevo' : 'Reserva tu lugar';
    subtitle.textContent = mode === 'login' ? 'Inicia sesión para continuar tu recorrido.' : 'Regístrate para estudiar y participar en Cine Salomé.';
    submit.innerHTML = mode === 'login' ? 'Entrar a la experiencia <span>→</span>' : 'Crear cuenta y entrar <span>→</span>';
    message.textContent = '';
  };
  document.querySelectorAll('.auth-tab').forEach(tab => tab.addEventListener('click', () => setMode(tab.dataset.mode)));
  async function fillSelect(path, id, label) {
    try {
      const response = await fetch(`${API}/api/cursos/${path}`);
      if (!response.ok) throw new Error();
      const items = await response.json();
      const select = document.getElementById(id);
      items.forEach(item => { const option = document.createElement('option'); option.value = item[label.id]; option.textContent = item[label.name]; select.append(option); });
    } catch { message.textContent = 'No se pudo cargar el catálogo. Verifica que el backend esté encendido.'; }
  }
  fillSelect('tecnicas', 'technique', {id:'ID_TECNICA', name:'NOMBRE_TECNICA'});
  fillSelect('grados', 'grade', {id:'ID_GRADO', name:'NOMBRE_GRADO'});
  form.addEventListener('submit', async event => {
    event.preventDefault(); message.textContent = '';
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    if (mode === 'register') { data.NUMERO_DE_LISTA = Number(data.NUMERO_DE_LISTA); data.ID_TECNICA = Number(data.ID_TECNICA); data.ID_GRADO = Number(data.ID_GRADO); }
    submit.disabled = true; submit.textContent = 'Conectando…';
    try {
      const response = await fetch(`${API}/api/auth/${mode === 'login' ? 'login' : 'registro'}`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || 'No se pudo completar la solicitud.');
      sessionStorage.setItem('cineSalomeToken', result.access_token);
      sessionStorage.setItem('cineSalomeUser', JSON.stringify(result.user));
      window.location.assign(new URL('index.html', window.location.href).href);
    } catch (error) { message.textContent = error.message || 'No se pudo conectar con el servidor. Comprueba que el backend esté activo.'; }
    finally { submit.disabled = false; submit.innerHTML = mode === 'login' ? 'Entrar a la experiencia <span>→</span>' : 'Crear cuenta y entrar <span>→</span>'; }
  });
})();
