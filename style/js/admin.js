(() => {
  const API = window.CINE_API_URL || 'http://127.0.0.1:8000';
  const $ = id => document.getElementById(id);
  let students = [], techniques = [], grades = [];
  const headers = () => ({ Authorization: `Bearer ${window.CineAuth?.token() || ''}`, 'Content-Type': 'application/json' });
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  $('adminLogout')?.addEventListener('click', () => window.CineAuth.logout());
  $('refreshButton').addEventListener('click', loadData);
  $('searchInput').addEventListener('input', render);
  ['gradeFilter','techFilter','attendanceFilter'].forEach(id => $(id).addEventListener('change', render));
  $('exportButton').addEventListener('click', exportCsv);

  async function getJson(path, options = {}) {
    const response = await fetch(`${API}${path}`, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) { window.CineAuth.logout(); throw new Error('Sesión vencida'); }
    if (!response.ok) throw new Error(data.detail || 'No se pudo completar la solicitud');
    return data;
  }
  async function loadData() {
    $('statusMessage').textContent = 'Actualizando…';
    $('studentsTable').innerHTML = '<tr><td colspan="6" class="table-message">Cargando registros…</td></tr>';
    try {
      const results = await Promise.all([
        getJson('/api/admin/estudiantes'),
        getJson('/api/cursos/tecnicas'),
        getJson('/api/cursos/grados')
      ]);
      students = results[0]; techniques = results[1]; grades = results[2];
      populateFilter('techFilter', techniques, 'ID_TECNICA', 'NOMBRE_TECNICA', 'Todas las técnicas');
      populateFilter('gradeFilter', grades, 'ID_GRADO', 'NOMBRE_GRADO', 'Todos los grados');
      render(); $('statusMessage').textContent = 'Datos actualizados';
    } catch (error) {
      $('studentsTable').innerHTML = `<tr><td colspan="6" class="table-message">${esc(error.message)}. Comprueba el backend, Supabase y la sesión.</td></tr>`;
      $('statusMessage').textContent = 'No se pudo conectar';
    }
  }
  function populateFilter(id, items, idKey, nameKey, placeholder) {
    const select = $(id), current = select.value;
    select.replaceChildren(new Option(placeholder, ''));
    items.forEach(item => select.add(new Option(item[nameKey], String(item[idKey]))));
    if ([...select.options].some(option => option.value === current)) select.value = current;
  }
  const techniqueName = id => techniques.find(item => String(item.ID_TECNICA) === String(id))?.NOMBRE_TECNICA || `Técnica ${id ?? '—'}`;
  const gradeName = id => grades.find(item => String(item.ID_GRADO) === String(id))?.NOMBRE_GRADO || `Grado ${id ?? '—'}`;
  function filtered() {
    const query = $('searchInput').value.trim().toLocaleLowerCase('es');
    return students.filter(student => {
      const haystack = [student.ID_ESTUDIANTE, student.NUMERO_DE_LISTA, student.NOMBRE_COMPLETO, student.CORREO, techniqueName(student.ID_TECNICA), gradeName(student.ID_GRADO)].join(' ').toLocaleLowerCase('es');
      return (!query || haystack.includes(query)) && (!$('gradeFilter').value || String(student.ID_GRADO) === $('gradeFilter').value) && (!$('techFilter').value || String(student.ID_TECNICA) === $('techFilter').value) && (!$('attendanceFilter').value || String(Boolean(student.ASISTIO)) === $('attendanceFilter').value);
    });
  }
  function render() {
    const list = filtered();
    $('totalCount').textContent = students.length;
    $('presentCount').textContent = students.filter(student => student.ASISTIO).length;
    $('pendingCount').textContent = students.filter(student => !student.ASISTIO).length;
    $('resultCount').textContent = `${list.length} de ${students.length} participantes`;
    if (!list.length) { $('studentsTable').innerHTML = '<tr><td colspan="6" class="table-message">No hay resultados para estos filtros.</td></tr>'; return; }
    $('studentsTable').innerHTML = list.map(student => {
      const present = Boolean(student.ASISTIO);
      return `<tr>
        <td><strong>#${esc(student.ID_ESTUDIANTE)}</strong><span class="muted">Lista: ${esc(student.NUMERO_DE_LISTA)}</span></td>
        <td><span class="student-name">${esc(student.NOMBRE_COMPLETO)}</span><span class="muted">${esc(student.CORREO)}</span></td>
        <td>${esc(student.CORREO)}</td>
        <td>${esc(gradeName(student.ID_GRADO))}<span class="muted">${esc(techniqueName(student.ID_TECNICA))}</span></td>
        <td><span class="attendance ${present ? 'present' : 'pending'}">${present ? 'PRESENTE' : 'PENDIENTE'}</span></td>
        <td><button class="row-action ${present ? 'undo' : ''}" data-attendance="${esc(student.ID_ESTUDIANTE)}">${present ? 'Deshacer' : 'Validar boleta ✓'}</button></td>
      </tr>`;
    }).join('');
    $('studentsTable').querySelectorAll('[data-attendance]').forEach(button => button.addEventListener('click', () => markAttendance(button.dataset.attendance, button)));
  }
  async function markAttendance(id, button) {
    const previous = button.textContent; button.disabled = true; button.textContent = 'Guardando…';
    try {
      const result = await getJson(`/api/admin/estudiantes/${encodeURIComponent(id)}/asistencia`, { method: 'POST' });
      const student = students.find(item => String(item.ID_ESTUDIANTE) === String(id));
      if (student) student.ASISTIO = result.ASISTIO;
      render(); $('statusMessage').textContent = result.ASISTIO ? `Asistencia validada para el registro #${id}` : `Asistencia revertida para el registro #${id}`;
    } catch (error) { $('statusMessage').textContent = error.message; button.disabled = false; button.textContent = previous; }
  }
  function exportCsv() {
    const list = filtered();
    if (!list.length) { $('statusMessage').textContent = 'No hay datos para exportar.'; return; }
    const columns = ['ID_ESTUDIANTE','NOMBRE_COMPLETO','NUMERO_DE_LISTA','CORREO','GRADO','TECNICA','ASISTIO'];
    const rows = list.map(s => [s.ID_ESTUDIANTE,s.NOMBRE_COMPLETO,s.NUMERO_DE_LISTA,s.CORREO,gradeName(s.ID_GRADO),techniqueName(s.ID_TECNICA),s.ASISTIO ? 'Sí' : 'No']);
    const csv = [columns, ...rows].map(row => row.map(value => `"${String(value ?? '').replace(/"/g,'""')}"`).join(',')).join('\r\n');
    const blob = new Blob(['\ufeff' + csv], {type:'text/csv;charset=utf-8;'}), url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'cine-salome-participantes.csv'; link.click(); URL.revokeObjectURL(url);
  }
  loadData();
})();
