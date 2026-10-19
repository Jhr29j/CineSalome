(() => {
  const API = window.CINE_API_URL || 'http://127.0.0.1:8000';
  const $ = id => document.getElementById(id);
  let students = [], techniques = [], grades = [];
  let autoRefreshTimer = null;
  const AUTO_REFRESH_MS = 30_000; // 30 segundos

  const headers = () => ({
    Authorization: `Bearer ${window.CineAuth?.token() || ''}`,
    'Content-Type': 'application/json',
  });

  const esc = value =>
    String(value ?? '').replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );

  // ── Logout ─────────────────────────────────────────────────────────────────
  $('adminLogout')?.addEventListener('click', () => window.CineAuth.logout());
  $('refreshButton').addEventListener('click', () => loadData(true));

  // ════════════════════════════════════════════════════════════════════════════
  // PESTAÑAS (en el navbar)
  // ════════════════════════════════════════════════════════════════════════════
  const TAB_MAP = {
    participants: { panel: 'panelParticipants' },
    pending:      { panel: 'panelPending'      },
    admins:       { panel: 'panelAdmins'       },
  };

  function switchTab(tabName) {
    // Botones en el nav (admin-nav-tab)
    document.querySelectorAll('.admin-nav-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    // Paneles de contenido
    Object.entries(TAB_MAP).forEach(([name, ids]) => {
      $(ids.panel)?.classList.toggle('active', name === tabName);
    });

    // ── Filtrar stat-cards según la pestaña ────────────────────────────────
    const statsGrid = $('statsGrid');
    if (statsGrid) {
      const cards = statsGrid.querySelectorAll('[data-visible-on]');
      let visibleCount = 0;
      cards.forEach(card => {
        const tabs = card.dataset.visibleOn.split(' ');
        const show = tabs.includes(tabName);
        card.style.display = show ? '' : 'none';
        if (show) visibleCount++;
      });
      // Si no hay ninguna card visible (ej: en admins), ocultar la sección entera
      statsGrid.style.display = visibleCount === 0 ? 'none' : '';
      // Ajustar el grid: si solo hay 2 cards visibles cambiar a 2 columnas
      statsGrid.style.gridTemplateColumns = visibleCount === 2
        ? 'repeat(2, minmax(0, 1fr))'
        : '';
    }

    if (tabName === 'pending') {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  }


  document.querySelectorAll('.admin-nav-tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  function startAutoRefresh() {
    stopAutoRefresh();
    autoRefreshTimer = setInterval(() => loadData(false), AUTO_REFRESH_MS);
  }

  function stopAutoRefresh() {
    if (autoRefreshTimer) { clearInterval(autoRefreshTimer); autoRefreshTimer = null; }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // API helper
  // ════════════════════════════════════════════════════════════════════════════
  async function getJson(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: { ...headers(), ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) { window.CineAuth.logout(); throw new Error('Sesión vencida'); }
    if (!response.ok) throw new Error(data.detail || 'No se pudo completar la solicitud');
    return data;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CARGAR DATOS
  // ════════════════════════════════════════════════════════════════════════════
  async function loadData(showSpinner = true) {
    if (showSpinner) {
      $('statusMessage').textContent = 'Actualizando…';
      $('studentsTable').innerHTML   = '<tr><td colspan="5" class="table-message">Cargando registros…</td></tr>';
      $('pendingTable').innerHTML    = '<tr><td colspan="5" class="table-message">Cargando…</td></tr>';
      $('approvedTable').innerHTML   = '<tr><td colspan="5" class="table-message">Cargando…</td></tr>';
    }
    try {
      const [studentsData, techniquesData, gradesData] = await Promise.all([
        getJson('/api/admin/estudiantes'),
        getJson('/api/cursos/tecnicas'),
        getJson('/api/cursos/grados'),
      ]);
      students   = studentsData;
      techniques = techniquesData;
      grades     = gradesData;
      populateFilter('techFilter',  techniques, 'ID_TECNICA', 'NOMBRE_TECNICA', 'Todas las técnicas');
      populateFilter('gradeFilter', grades,     'ID_GRADO',   'NOMBRE_GRADO',   'Todos los grados');
      renderAll();
      $('statusMessage').textContent    = 'Datos actualizados';
      $('pendingStatusMsg').textContent = `Última actualización: ${new Date().toLocaleTimeString('es')}`;
    } catch (error) {
      $('studentsTable').innerHTML = `<tr><td colspan="5" class="table-message">${esc(error.message)}. Comprueba el backend, Supabase y la sesión.</td></tr>`;
      $('statusMessage').textContent = 'No se pudo conectar';
    }
  }

  function renderAll() {
    renderDirectory();
    renderPending();
    updateStats();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ════════════════════════════════════════════════════════════════════════════
  function populateFilter(id, items, idKey, nameKey, placeholder) {
    const select = $(id), current = select.value;
    select.replaceChildren(new Option(placeholder, ''));
    items.forEach(item => select.add(new Option(item[nameKey], String(item[idKey]))));
    if ([...select.options].some(o => o.value === current)) select.value = current;
  }

  const techniqueName = id =>
    techniques.find(t => String(t.ID_TECNICA) === String(id))?.NOMBRE_TECNICA || `Técnica ${id ?? '—'}`;

  const gradeName = id =>
    grades.find(g => String(g.ID_GRADO) === String(id))?.NOMBRE_GRADO || `Grado ${id ?? '—'}`;

  function updateStats() {
    const approved = students.filter(s => s.ASISTIO);
    const pending  = students.filter(s => !s.ASISTIO);
    $('totalCount').textContent   = students.length;
    $('presentCount').textContent = approved.length;
    $('pendingCount').textContent = pending.length;

    // Badge en la pestaña "Pendientes"
    const badge = $('pendingBadge');
    badge.textContent = pending.length;
    badge.style.display = pending.length > 0 ? '' : 'none';

    // El punto rojo parpadea solo si hay pendientes
    const dot = $('pendingDot');
    dot.style.display = pending.length > 0 ? '' : 'none';
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PESTAÑA 1: DIRECTORIO COMPLETO
  // ════════════════════════════════════════════════════════════════════════════
  $('searchInput').addEventListener('input', renderDirectory);
  ['gradeFilter', 'techFilter', 'attendanceFilter'].forEach(id =>
    $(id).addEventListener('change', renderDirectory)
  );
  $('exportButton').addEventListener('click', exportCsv);

  function filteredStudents() {
    const query = $('searchInput').value.trim().toLocaleLowerCase('es');
    return students.filter(s => {
      const hay = [s.ID_ESTUDIANTE, s.NUMERO_DE_LISTA, s.NOMBRE_COMPLETO, s.CORREO,
        techniqueName(s.ID_TECNICA), gradeName(s.ID_GRADO)].join(' ').toLocaleLowerCase('es');
      return (
        (!query || hay.includes(query)) &&
        (!$('gradeFilter').value || String(s.ID_GRADO) === $('gradeFilter').value) &&
        (!$('techFilter').value  || String(s.ID_TECNICA) === $('techFilter').value) &&
        (!$('attendanceFilter').value || String(Boolean(s.ASISTIO)) === $('attendanceFilter').value)
      );
    });
  }

  function renderDirectory() {
    const list = filteredStudents();
    $('resultCount').textContent = `${list.length} de ${students.length} participantes`;
    if (!list.length) {
      $('studentsTable').innerHTML = '<tr><td colspan="5" class="table-message">No hay resultados para estos filtros.</td></tr>';
      return;
    }
    $('studentsTable').innerHTML = list.map(s => {
      const approved = Boolean(s.ASISTIO);
      return `<tr>
        <td><strong>#${esc(s.ID_ESTUDIANTE)}</strong><span class="muted">Lista: ${esc(s.NUMERO_DE_LISTA)}</span></td>
        <td><span class="student-name">${esc(s.NOMBRE_COMPLETO)}</span><span class="muted">${esc(s.CORREO)}</span></td>
        <td>${esc(s.CORREO)}</td>
        <td>${esc(gradeName(s.ID_GRADO))}<span class="muted">${esc(techniqueName(s.ID_TECNICA))}</span></td>
        <td><span class="attendance ${approved ? 'present' : 'pending'}">${approved ? 'APROBADA' : 'PENDIENTE'}</span></td>
      </tr>`;
    }).join('');
  }

  function exportCsv() {
    const list = filteredStudents();
    if (!list.length) { $('statusMessage').textContent = 'No hay datos para exportar.'; return; }
    const columns = ['ID_ESTUDIANTE','NOMBRE_COMPLETO','NUMERO_DE_LISTA','CORREO','GRADO','TECNICA','BOLETA_APROBADA'];
    const rows = list.map(s => [s.ID_ESTUDIANTE, s.NOMBRE_COMPLETO, s.NUMERO_DE_LISTA, s.CORREO,
      gradeName(s.ID_GRADO), techniqueName(s.ID_TECNICA), s.ASISTIO ? 'Sí' : 'No']);
    const csv = [columns, ...rows].map(row =>
      row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
    ).join('\r\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'cine-salome-participantes.csv'; link.click();
    URL.revokeObjectURL(url);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PESTAÑA 2: PENDIENTES DE BOLETA
  // ════════════════════════════════════════════════════════════════════════════
  function pendingRow(s, isApproved) {
    const action = isApproved
      ? `<button class="row-action undo" data-toggle="${esc(s.ID_ESTUDIANTE)}">Desaprobar</button>`
      : `<button class="row-action" data-toggle="${esc(s.ID_ESTUDIANTE)}">Aprobar boleta ✓</button>`;
    return `<tr>
      <td><strong>#${esc(s.ID_ESTUDIANTE)}</strong><span class="muted">Lista: ${esc(s.NUMERO_DE_LISTA)}</span></td>
      <td><span class="student-name">${esc(s.NOMBRE_COMPLETO)}</span><span class="muted">${esc(s.CORREO)}</span></td>
      <td>${esc(s.CORREO)}</td>
      <td>${esc(gradeName(s.ID_GRADO))}<span class="muted">${esc(techniqueName(s.ID_TECNICA))}</span></td>
      <td>${action}</td>
    </tr>`;
  }

  function renderPending() {
    // Orden: los más nuevos primero (ID mayor = más reciente)
    const pending  = [...students].filter(s => !s.ASISTIO).sort((a, b) => b.ID_ESTUDIANTE - a.ID_ESTUDIANTE);
    const approved = [...students].filter(s => s.ASISTIO).sort((a, b)  => b.ID_ESTUDIANTE - a.ID_ESTUDIANTE);

    $('pendingTable').innerHTML = pending.length
      ? pending.map(s => pendingRow(s, false)).join('')
      : '<tr><td colspan="5" class="table-message">¡Sin pendientes! Todas las boletas están aprobadas.</td></tr>';

    $('approvedTable').innerHTML = approved.length
      ? approved.map(s => pendingRow(s, true)).join('')
      : '<tr><td colspan="5" class="table-message">Aún no hay boletas aprobadas.</td></tr>';

    // Bind de botones
    ['pendingTable', 'approvedTable'].forEach(tbodyId => {
      $(tbodyId).querySelectorAll('[data-toggle]').forEach(btn => {
        btn.addEventListener('click', () => toggleAttendance(btn.dataset.toggle, btn));
      });
    });
  }

  async function toggleAttendance(id, button) {
    const prev = button.textContent;
    button.disabled = true;
    button.textContent = 'Guardando…';
    try {
      const result = await getJson(`/api/admin/estudiantes/${encodeURIComponent(id)}/asistencia`, { method: 'POST' });
      const student = students.find(s => String(s.ID_ESTUDIANTE) === String(id));
      if (student) student.ASISTIO = result.ASISTIO;
      renderAll();
      $('statusMessage').textContent = result.ASISTIO
        ? `✓ Boleta aprobada para el registro #${id}`
        : `Boleta desaprobada para el registro #${id}`;
    } catch (error) {
      $('statusMessage').textContent = error.message;
      button.disabled = false;
      button.textContent = prev;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PESTAÑA 3: ADMINISTRADORES
  // ════════════════════════════════════════════════════════════════════════════
  const accountForm  = $('adminAccountForm');
  const adminMessage = $('adminAccountMessage');
  let adminAccounts  = [];

  // Ojito de contraseña en el formulario de admin
  const adminPwdInput = $('adminPassword');
  const togglePwdBtn  = $('toggleAdminPwd');
  const pwdEyeOn      = $('pwdEyeOn');
  const pwdEyeOff     = $('pwdEyeOff');
  togglePwdBtn.addEventListener('click', () => {
    const show = adminPwdInput.type === 'password';
    adminPwdInput.type       = show ? 'text' : 'password';
    pwdEyeOn.style.display   = show ? 'none' : '';
    pwdEyeOff.style.display  = show ? '' : 'none';
    togglePwdBtn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });

  $('cancelAdminEdit').addEventListener('click', resetAdminForm);
  accountForm.addEventListener('submit', saveAdminAccount);

  async function loadAdmins() {
    try {
      adminAccounts = await getJson('/api/admin/administradores');
      renderAdmins();
    } catch (error) {
      $('adminsTable').innerHTML = `<tr><td colspan="6" class="table-message">${esc(error.message)}</td></tr>`;
    }
  }

  function renderAdmins() {
    if (!adminAccounts.length) {
      $('adminsTable').innerHTML = '<tr><td colspan="6" class="table-message">No hay administradores registrados.</td></tr>';
      return;
    }
    $('adminsTable').innerHTML = adminAccounts.map(a => `
      <tr>
        <td>${esc(a.NOMBRE_COMPLETO)}</td>
        <td><strong>${esc(a.USUARIO)}</strong></td>
        <td>${esc(a.CORREO)}</td>
        <td><span class="attendance ${a.ACTIVO ? 'present' : 'pending'}">${a.ACTIVO ? 'ACTIVO' : 'INACTIVO'}</span></td>
        <td>${a.FECHA_CREACION ? new Date(a.FECHA_CREACION).toLocaleDateString('es') : '—'}</td>
        <td><button class="row-action" data-edit-admin="${esc(a.ID_ADMIN)}">Editar</button></td>
      </tr>`).join('');

    $('adminsTable').querySelectorAll('[data-edit-admin]').forEach(btn =>
      btn.addEventListener('click', () => editAdmin(btn.dataset.editAdmin))
    );
  }

  function editAdmin(id) {
    const account = adminAccounts.find(a => String(a.ID_ADMIN) === String(id));
    if (!account) return;
    $('editAdminId').value     = account.ID_ADMIN;
    $('adminName').value       = account.NOMBRE_COMPLETO;
    $('adminUsername').value   = account.USUARIO;
    $('adminEmail').value      = account.CORREO;
    $('adminPassword').value   = '';
    $('adminPassword').required = false;
    $('adminActive').checked   = Boolean(account.ACTIVO);
    $('saveAdminButton').textContent = 'Guardar cambios';
    $('cancelAdminEdit').hidden = false;
    const label = $('adminPasswordLabel').querySelector('label') || $('adminPasswordLabel');
    const firstChild = $('adminPasswordLabel').firstChild;
    if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
      firstChild.textContent = 'Nueva contraseña (opcional) ';
    }
    showAdminMsg(`Editando cuenta: ${account.CORREO}`, 'info');
    accountForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function resetAdminForm() {
    accountForm.reset();
    $('editAdminId').value      = '';
    $('adminActive').checked    = true;
    $('adminPassword').required = true;
    $('saveAdminButton').textContent = 'Crear administrador';
    $('cancelAdminEdit').hidden = true;
    const firstChild = $('adminPasswordLabel').firstChild;
    if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
      firstChild.textContent = 'Contraseña temporal ';
    }
    adminMessage.textContent = '';
    adminMessage.className   = 'admin-account-message';
  }

  function showAdminMsg(text, type = 'error') {
    adminMessage.textContent = text;
    adminMessage.className   = `admin-account-message ${type === 'success' ? 'success' : type === 'info' ? '' : 'error'}`;
  }

  async function saveAdminAccount(event) {
    event.preventDefault();
    adminMessage.textContent = '';
    const id       = $('editAdminId').value;
    const password = $('adminPassword').value;

    if (!id && password.length < 8) { showAdminMsg('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (password && password.length < 8) { showAdminMsg('La nueva contraseña debe tener al menos 8 caracteres.'); return; }

    const payload = {
      NOMBRE_COMPLETO: $('adminName').value.trim(),
      USUARIO:         $('adminUsername').value.trim(),
      CORREO:          $('adminEmail').value.trim(),
      ACTIVO:          $('adminActive').checked,
    };
    if (password) payload['CONTRASEÑA'] = password;

    const button = $('saveAdminButton');
    button.disabled    = true;
    button.textContent = 'Guardando…';

    try {
      if (id) {
        await getJson(`/api/admin/administradores/${encodeURIComponent(id)}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showAdminMsg('✓ Administrador actualizado correctamente.', 'success');
      } else {
        await getJson('/api/admin/administradores', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showAdminMsg('✓ Administrador creado correctamente.', 'success');
      }
      resetAdminForm();
      await loadAdmins();
    } catch (error) {
      showAdminMsg(error.message);
    } finally {
      button.disabled    = false;
      button.textContent = $('editAdminId').value ? 'Guardar cambios' : 'Crear administrador';
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // INICIO
  // ════════════════════════════════════════════════════════════════════════════
  switchTab('participants'); // inicializa visibilidad de stat-cards
  loadData(true);
  loadAdmins();
})();

