(() => {
  const API    = window.CINE_API_URL || 'http://127.0.0.1:8000';
  const form   = document.getElementById('adminLoginForm');
  const msg    = document.getElementById('adminMessage');
  const button = document.getElementById('adminSubmit');

  // Redirigir si ya hay sesión de admin activa
  const existing = sessionStorage.getItem('cineSalomeUser');
  try {
    const u = JSON.parse(existing || 'null');
    if (sessionStorage.getItem('cineSalomeToken') && u?.role === 'admin') {
      if (u.DEBE_CAMBIAR_CONTRASENA) {
        showForcedChangeModal();
      } else {
        location.replace('panel.html');
      }
    }
  } catch {}

  // ── Ojito de contraseña ───────────────────────────────────────────────────
  const passwordInput  = document.getElementById('password');
  const toggleBtn      = document.getElementById('toggleAdminPassword');
  const eyeIcon        = document.getElementById('adminEyeIcon');
  const eyeOffIcon     = document.getElementById('adminEyeOffIcon');

  toggleBtn.addEventListener('click', () => {
    const show = passwordInput.type === 'password';
    passwordInput.type       = show ? 'text' : 'password';
    eyeIcon.style.display    = show ? 'none' : '';
    eyeOffIcon.style.display = show ? '' : 'none';
    toggleBtn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });

  // ── Submit del formulario de login ────────────────────────────────────────
  form.addEventListener('submit', async e => {
    e.preventDefault();
    msg.textContent = '';
    if (!form.reportValidity()) return;

    button.disabled    = true;
    button.textContent = 'Verificando…';

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch(`${API}/api/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || 'No se pudo iniciar sesión');

      sessionStorage.setItem('cineSalomeToken', result.access_token);
      sessionStorage.setItem('cineSalomeUser', JSON.stringify(result.user));

      if (result.user?.DEBE_CAMBIAR_CONTRASENA) {
        showForcedChangeModal();
      } else {
        location.replace('panel.html');
      }
    } catch (error) {
      msg.textContent = error.message || 'No se pudo conectar con la API.';
    } finally {
      button.disabled    = false;
      button.textContent = 'Entrar al panel';
    }
  });

  // ── Modal de cambio de contraseña forzado ─────────────────────────────────
  function showForcedChangeModal() {
    // Crear el modal dinámicamente si no existe
    if (!document.getElementById('forcedChangeModal')) {
      const overlay = document.createElement('div');
      overlay.id = 'forcedChangeModal';
      overlay.className = 'modal-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.innerHTML = `
        <div class="modal-box">
          <p class="modal-kicker">Seguridad</p>
          <h2>Crea tu contraseña propia</h2>
          <p>Tu cuenta fue configurada por el administrador principal. Por seguridad, debes establecer tu propia contraseña antes de continuar.</p>
          <div class="form-field" style="margin-bottom:10px;">
            <label for="fcNewPwd" style="font-size:11px;font-weight:800;letter-spacing:.05em;color:#c5b5b7;">Nueva contraseña</label>
            <div class="password-wrapper">
              <input type="password" id="fcNewPwd" minlength="8" placeholder="Mínimo 8 caracteres" style="padding-right:44px;"/>
              <button type="button" id="fcToggle1" class="password-toggle" aria-label="Mostrar contraseña">
                <svg id="fcEye1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg id="fcEye1Off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>
          <div class="form-field" style="margin-bottom:14px;">
            <label for="fcConfirmPwd" style="font-size:11px;font-weight:800;letter-spacing:.05em;color:#c5b5b7;">Confirmar contraseña</label>
            <div class="password-wrapper">
              <input type="password" id="fcConfirmPwd" minlength="8" placeholder="Repite la contraseña" style="padding-right:44px;"/>
              <button type="button" id="fcToggle2" class="password-toggle" aria-label="Mostrar contraseña">
                <svg id="fcEye2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg id="fcEye2Off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>
          <div class="form-error" id="fcMsg" aria-live="polite"></div>
          <div class="modal-actions">
            <button type="button" class="btn btn-primary" id="fcSaveBtn" style="flex:1">Guardar y entrar →</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);

      // Ojitos del modal forzado
      setupEye('fcNewPwd',     'fcToggle1', 'fcEye1', 'fcEye1Off');
      setupEye('fcConfirmPwd', 'fcToggle2', 'fcEye2', 'fcEye2Off');

      document.getElementById('fcSaveBtn').addEventListener('click', saveForced);
    }

    document.getElementById('forcedChangeModal').classList.add('open');
    setTimeout(() => document.getElementById('fcNewPwd').focus(), 300);
  }

  function setupEye(inputId, btnId, onId, offId) {
    const inp = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    const on  = document.getElementById(onId);
    const off = document.getElementById(offId);
    btn.addEventListener('click', () => {
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      on.style.display  = show ? 'none' : '';
      off.style.display = show ? '' : 'none';
    });
  }

  async function saveForced() {
    const newPwd     = document.getElementById('fcNewPwd').value;
    const confirmPwd = document.getElementById('fcConfirmPwd').value;
    const fcMsg      = document.getElementById('fcMsg');
    const saveBtn    = document.getElementById('fcSaveBtn');
    fcMsg.textContent = '';

    if (newPwd.length < 8) { fcMsg.textContent = 'La contraseña debe tener al menos 8 caracteres.'; return; }
    if (newPwd !== confirmPwd) { fcMsg.textContent = 'Las contraseñas no coinciden.'; return; }

    saveBtn.disabled    = true;
    saveBtn.textContent = 'Guardando…';

    const token = sessionStorage.getItem('cineSalomeToken');
    try {
      const response = await fetch(`${API}/api/admin/administradores/cambiar-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nueva_contrasena: newPwd }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || 'No se pudo guardar la contraseña.');

      // Actualizar el flag en sesión
      try {
        const u = JSON.parse(sessionStorage.getItem('cineSalomeUser') || '{}');
        u.DEBE_CAMBIAR_CONTRASENA = false;
        sessionStorage.setItem('cineSalomeUser', JSON.stringify(u));
      } catch {}

      fcMsg.textContent  = '✓ Contraseña guardada. Entrando al panel…';
      fcMsg.style.color  = '#6ee7b7';
      setTimeout(() => location.replace('panel.html'), 1200);
    } catch (error) {
      fcMsg.textContent = error.message;
      saveBtn.disabled    = false;
      saveBtn.innerHTML   = 'Guardar y entrar →';
    }
  }
})();