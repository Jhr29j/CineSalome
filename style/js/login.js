(() => {
  const API = window.CINE_API_URL || 'http://127.0.0.1:8000';

  // ── Elementos del formulario principal ────────────────────────────────────
  const form      = document.getElementById('authForm');
  const message   = document.getElementById('formMessage');
  const title     = document.getElementById('formTitle');
  const subtitle  = document.getElementById('formSubtitle');
  const submit    = document.getElementById('submitButton');
  const forgotLink = document.getElementById('forgotLink');
  let mode = 'login';

  // Guarda temporalmente los datos del registro hasta que el código sea verificado
  let _pendingRegData = null;

  // ── Ojito de contraseña principal ─────────────────────────────────────────
  initPasswordToggle('password', 'togglePassword', 'eyeIcon', 'eyeOffIcon');

  function initPasswordToggle(inputId, btnId, eyeOnId, eyeOffId) {
    const input   = document.getElementById(inputId);
    const btn     = document.getElementById(btnId);
    const eyeOn   = document.getElementById(eyeOnId);
    const eyeOff  = document.getElementById(eyeOffId);
    if (!input || !btn) return;
    btn.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      eyeOn.style.display  = show ? 'none' : '';
      eyeOff.style.display = show ? '' : 'none';
      btn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });
  }

  // ── Tabs de modo ──────────────────────────────────────────────────────────
  const fields = [...document.querySelectorAll('[data-field]')];

  const setMode = next => {
    mode = next;
    document.querySelectorAll('.auth-tab').forEach(tab =>
      tab.classList.toggle('active', tab.dataset.mode === mode)
    );
    fields.forEach(field => field.classList.toggle('hidden', mode !== 'register'));
    document.getElementById('name').required       = mode === 'register';
    document.getElementById('listNumber').required = mode === 'register';
    document.getElementById('grade').required      = mode === 'register';
    document.getElementById('technique').required  = mode === 'register';
    document.getElementById('password').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
    document.getElementById('password').minLength = mode === 'login' ? 1 : 8;
    title.textContent    = mode === 'login' ? 'Bienvenido de nuevo' : 'Reserva tu lugar';
    subtitle.textContent = mode === 'login'
      ? 'Inicia sesión para continuar tu recorrido.'
      : 'Regístrate para estudiar y participar en Cine Salomé.';
    submit.innerHTML = mode === 'login'
      ? 'Entrar a la experiencia <span>→</span>'
      : 'Crear cuenta y entrar <span>→</span>';
    message.textContent  = '';
    forgotLink.style.display = mode === 'login' ? '' : 'none';

    // ── Animación suave de aparición al cambiar tab ──────────────────────
    const _animEls = [form, title, subtitle];
    _animEls.forEach(el => { el.classList.remove('tab-anim'); void el.offsetWidth; el.classList.add('tab-anim'); });
    setTimeout(() => _animEls.forEach(el => el.classList.remove('tab-anim')), 400);
  };

  document.querySelectorAll('.auth-tab').forEach(tab =>
    tab.addEventListener('click', () => setMode(tab.dataset.mode))
  );

  // ── Cargar selects de técnica y grado ────────────────────────────────────
  async function fillSelect(path, id, label) {
    try {
      const response = await fetch(`${API}/api/cursos/${path}`);
      if (!response.ok) throw new Error();
      const items = await response.json();
      const select = document.getElementById(id);
      items.forEach(item => {
        const option = document.createElement('option');
        option.value = item[label.id];
        option.textContent = item[label.name];
        select.append(option);
      });
    } catch {
      message.textContent = 'No se pudo cargar el catálogo. Verifica que el backend esté encendido.';
    }
  }
  fillSelect('tecnicas', 'technique', { id: 'ID_TECNICA', name: 'NOMBRE_TECNICA' });
  fillSelect('grados',   'grade',     { id: 'ID_GRADO',   name: 'NOMBRE_GRADO'   });

  // ── Helper: guardar sesión y redirigir ────────────────────────────────────
  function saveAndRedirect(result) {
    sessionStorage.setItem('cineSalomeToken', result.access_token);
    sessionStorage.setItem('cineSalomeUser', JSON.stringify(result.user));
    window.location.assign(new URL('index.html', window.location.href).href);
  }

  // ── Submit del formulario principal ───────────────────────────────────────
  form.addEventListener('submit', async event => {
    event.preventDefault();
    message.textContent = '';
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form).entries());

    if (mode === 'login') {
      submit.disabled = true;
      submit.textContent = 'Conectando…';
      try {
        const response = await fetch(`${API}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.detail || 'No se pudo completar la solicitud.');
        saveAndRedirect(result);
      } catch (error) {
        message.textContent = error.message || 'No se pudo conectar con el servidor.';
      } finally {
        submit.disabled = false;
        submit.innerHTML = 'Entrar a la experiencia <span>→</span>';
      }
    } else {
      data.NUMERO_DE_LISTA = Number(data.NUMERO_DE_LISTA);
      data.ID_TECNICA      = Number(data.ID_TECNICA);
      data.ID_GRADO        = Number(data.ID_GRADO);
      _pendingRegData      = data;

      submit.disabled  = true;
      submit.textContent = 'Enviando código…';
      try {
        const response = await fetch(`${API}/api/email/registro/enviar-codigo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.CORREO, name: data.NOMBRE_COMPLETO }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.detail || 'No se pudo enviar el código.');
        openVerifyModal(data.CORREO);
      } catch (error) {
        message.textContent = error.message || 'No se pudo enviar el código de verificación.';
      } finally {
        submit.disabled  = false;
        submit.innerHTML = 'Crear cuenta y entrar <span>→</span>';
      }
    }
  });

  // ════════════════════════════════════════════════════════════════════════
  // MODAL: Verificación de correo para registro
  // ════════════════════════════════════════════════════════════════════════
  const verifyModal      = document.getElementById('verifyModal');
  const verifyEmailDisp  = document.getElementById('verifyEmailDisplay');
  const verifyCodeInput  = document.getElementById('verifyCode');
  const verifyMsg        = document.getElementById('verifyMessage');
  const verifyConfirmBtn = document.getElementById('verifyConfirmBtn');
  const verifyCancelBtn  = document.getElementById('verifyCancelBtn');
  const resendRegCodeBtn = document.getElementById('resendRegCodeBtn');

  function openVerifyModal(email) {
    verifyEmailDisp.textContent = email;
    verifyCodeInput.value = '';
    verifyMsg.textContent = '';
    verifyMsg.style.color = '';
    verifyModal.classList.add('open');
    setTimeout(() => verifyCodeInput.focus(), 300);
  }

  function closeVerifyModal() {
    verifyModal.classList.remove('open');
    _pendingRegData = null;
  }

  verifyCancelBtn.addEventListener('click', closeVerifyModal);

  verifyConfirmBtn.addEventListener('click', async () => {
    const code = verifyCodeInput.value.trim();
    if (code.length !== 6) { verifyMsg.textContent = 'El código debe tener 6 dígitos.'; return; }
    if (!_pendingRegData) { closeVerifyModal(); return; }
    verifyMsg.textContent = '';
    verifyConfirmBtn.disabled = true;
    verifyConfirmBtn.textContent = 'Verificando…';
    try {
      const body = {
        email:            _pendingRegData.CORREO,
        code,
        NOMBRE_COMPLETO:  _pendingRegData.NOMBRE_COMPLETO,
        NUMERO_DE_LISTA:  _pendingRegData.NUMERO_DE_LISTA,
        ID_TECNICA:       _pendingRegData.ID_TECNICA,
        ID_GRADO:         _pendingRegData.ID_GRADO,
        CONTRASEÑA:       _pendingRegData['CONTRASEÑA'],
      };
      const response = await fetch(`${API}/api/email/registro/verificar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || 'Código incorrecto.');
      saveAndRedirect(result);
    } catch (error) {
      verifyMsg.textContent = error.message || 'No se pudo verificar el código.';
    } finally {
      verifyConfirmBtn.disabled = false;
      verifyConfirmBtn.innerHTML = 'Verificar →';
    }
  });

  // Reenvío con cooldown de 30 s
  function setupResend(btn, msgEl, getEmailFn, getNameFn, purpose) {
    btn.addEventListener('click', async () => {
      const email = getEmailFn();
      if (!email) return;
      btn.disabled = true;
      btn.textContent = 'Enviando…';
      try {
        const endpoint = purpose === 'registro'
          ? `${API}/api/email/registro/enviar-codigo`
          : `${API}/api/email/password/enviar-codigo`;
        const bodyObj = purpose === 'registro'
          ? { email, name: getNameFn() }
          : { email };
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyObj),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.detail || 'No se pudo reenviar.');
        msgEl.textContent = '✓ Código reenviado. Revisa tu bandeja.';
        msgEl.style.color = '#6ee7b7';
      } catch (error) {
        msgEl.textContent = error.message;
        msgEl.style.color = '';
      }
      // Habilitar reenvío otra vez después de 30 s
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'Reenviar código';
        if (msgEl.style.color === 'rgb(110, 231, 183)') {
          msgEl.textContent = '';
          msgEl.style.color = '';
        }
      }, 30000);
    });
  }

  setupResend(
    resendRegCodeBtn, verifyMsg,
    () => _pendingRegData?.CORREO,
    () => _pendingRegData?.NOMBRE_COMPLETO,
    'registro'
  );

  verifyCodeInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); verifyConfirmBtn.click(); }
  });

  // ════════════════════════════════════════════════════════════════════════
  // MODAL: Recuperar contraseña
  // ════════════════════════════════════════════════════════════════════════
  const forgotModal      = document.getElementById('forgotModal');
  const forgotEmailInput = document.getElementById('forgotEmail');
  const forgotEmailDisp  = document.getElementById('forgotEmailDisplay');
  const forgotCodeInput  = document.getElementById('forgotCode');
  const forgotStep1Msg   = document.getElementById('forgotStep1Message');
  const forgotStep2Msg   = document.getElementById('forgotStep2Message');
  const forgotStep3Msg   = document.getElementById('forgotStep3Message');
  const forgotSendBtn    = document.getElementById('forgotSendBtn');
  const forgotVerifyBtn  = document.getElementById('forgotVerifyBtn');
  const forgotBackBtn    = document.getElementById('forgotBackBtn');
  const forgotCancelBtn  = document.getElementById('forgotCancelBtn');
  const forgotResetBtn   = document.getElementById('forgotResetBtn');
  const resendResetBtn   = document.getElementById('resendResetCodeBtn');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPassInput = document.getElementById('confirmPassword');

  let _resetEmail = '';
  let _resetCode  = '';

  initPasswordToggle('newPassword',     'toggleNewPassword',     'eyeIconNew',     'eyeOffIconNew');
  initPasswordToggle('confirmPassword', 'toggleConfirmPassword', 'eyeIconConfirm', 'eyeOffIconConfirm');

  function setForgotStep(n) {
    [1,2,3].forEach(i =>
      document.getElementById(`forgotStep${i}`).classList.toggle('active', i === n)
    );
  }

  function openForgotModal() {
    forgotEmailInput.value = '';
    forgotCodeInput.value  = '';
    newPasswordInput.value = '';
    confirmPassInput.value = '';
    [forgotStep1Msg, forgotStep2Msg, forgotStep3Msg].forEach(el => { el.textContent = ''; el.style.color = ''; });
    setForgotStep(1);
    forgotModal.classList.add('open');
    setTimeout(() => forgotEmailInput.focus(), 300);
  }

  function closeForgotModal() {
    forgotModal.classList.remove('open');
    _resetEmail = '';
    _resetCode  = '';
  }

  forgotLink.addEventListener('click', e => { e.preventDefault(); openForgotModal(); });
  forgotCancelBtn.addEventListener('click', closeForgotModal);

  // Paso 1 → enviar código
  forgotSendBtn.addEventListener('click', async () => {
    const email = forgotEmailInput.value.trim().toLowerCase();
    if (!email || !/\S+@\S+\.\S+/.test(email)) { forgotStep1Msg.textContent = 'Ingresa un correo válido.'; return; }
    forgotStep1Msg.textContent = '';
    forgotSendBtn.disabled = true;
    forgotSendBtn.textContent = 'Enviando…';
    try {
      const response = await fetch(`${API}/api/email/password/enviar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || 'No se pudo enviar el código.');
      _resetEmail = email;
      forgotEmailDisp.textContent = email;
      setForgotStep(2);
      setTimeout(() => forgotCodeInput.focus(), 100);
    } catch (error) {
      forgotStep1Msg.textContent = error.message || 'No se pudo enviar el código.';
    } finally {
      forgotSendBtn.disabled = false;
      forgotSendBtn.innerHTML = 'Enviar código →';
    }
  });

  forgotBackBtn.addEventListener('click', () => setForgotStep(1));

  // Paso 2 → verificar código
  forgotVerifyBtn.addEventListener('click', async () => {
    const code = forgotCodeInput.value.trim();
    if (code.length !== 6) { forgotStep2Msg.textContent = 'El código debe tener 6 dígitos.'; return; }
    forgotStep2Msg.textContent = '';
    forgotVerifyBtn.disabled = true;
    forgotVerifyBtn.textContent = 'Verificando…';
    try {
      const response = await fetch(`${API}/api/email/password/verificar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: _resetEmail, code }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || 'Código incorrecto o expirado.');
      _resetCode = code;
      setForgotStep(3);
      setTimeout(() => newPasswordInput.focus(), 100);
    } catch (error) {
      forgotStep2Msg.textContent = error.message;
    } finally {
      forgotVerifyBtn.disabled = false;
      forgotVerifyBtn.innerHTML = 'Verificar →';
    }
  });

  setupResend(
    resendResetBtn, forgotStep2Msg,
    () => _resetEmail,
    () => null,
    'reset'
  );

  forgotCodeInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); forgotVerifyBtn.click(); }
  });

  // Paso 3 → restablecer contraseña y AUTO-LOGIN
  forgotResetBtn.addEventListener('click', async () => {
    const newPass = newPasswordInput.value;
    const confirm = confirmPassInput.value;
    forgotStep3Msg.textContent = '';
    forgotStep3Msg.style.color = '';
    if (newPass.length < 8) { forgotStep3Msg.textContent = 'La contraseña debe tener al menos 8 caracteres.'; return; }
    if (newPass !== confirm) { forgotStep3Msg.textContent = 'Las contraseñas no coinciden.'; return; }
    forgotResetBtn.disabled = true;
    forgotResetBtn.textContent = 'Cambiando…';
    try {
      const response = await fetch(`${API}/api/email/password/restablecer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: _resetEmail, code: _resetCode, new_password: newPass }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || 'No se pudo cambiar la contraseña.');

      // ─ Auto-login inmediato ───────────────────────────────────────────────
      forgotStep3Msg.textContent = '✓ Contraseña cambiada. Iniciando sesión…';
      forgotStep3Msg.style.color = '#6ee7b7';
      try {
        const loginResponse = await fetch(`${API}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ CORREO: _resetEmail, CONTRASEÑA: newPass }),
        });
        const loginResult = await loginResponse.json().catch(() => ({}));
        if (loginResponse.ok) {
          setTimeout(() => saveAndRedirect(loginResult), 900);
          return;
        }
      } catch {}
      // Si el auto-login falla por alguna razón, cerrar modal y dejar que inicie sesión normal
      setTimeout(closeForgotModal, 1800);
    } catch (error) {
      forgotStep3Msg.textContent = error.message;
    } finally {
      forgotResetBtn.disabled = false;
      forgotResetBtn.innerHTML = 'Cambiar contraseña →';
    }
  });

  // Cerrar modales con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (verifyModal.classList.contains('open')) closeVerifyModal();
      if (forgotModal.classList.contains('open')) closeForgotModal();
    }
  });
})();
