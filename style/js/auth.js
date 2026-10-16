(() => {
  const TOKEN_KEY = 'cineSalomeToken';
  const USER_KEY = 'cineSalomeUser';
  
  const token = () => sessionStorage.getItem(TOKEN_KEY);
  const user = () => {
    try {
      return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  };
  
  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    const inAdmin = location.pathname.includes('/admin/');
    location.href = inAdmin ? '../login.html' : 'login.html';
  };

  window.CineAuth = { token, user, logout, TOKEN_KEY, USER_KEY };

  const path = location.pathname.split('/').pop() || 'index.html';
  if (path === 'login.html') {
    if (token() && (user()?.role === 'student' || user()?.role === 'admin')) {
      location.replace('index.html');
    }
    return;
  }

  // Si no hay sesión válida o rol permitido, cerrar sesión
  if (!token() || !user() || (user().role !== 'student' && user().role !== 'admin')) {
    logout();
    return;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');
    if (!nav || document.getElementById('userMenuWrapper')) return;

    const currentUser = user() || {};
    const fullName = currentUser.NOMBRE_COMPLETO || currentUser.name || (currentUser.role === 'admin' ? 'Administrador' : 'Estudiante');
    const email = currentUser.CORREO || currentUser.email || '';
    const roleText = currentUser.role === 'admin' ? 'Administrador' : 'Estudiante';
    const isAdmin = currentUser.role === 'admin';

    const inAdmin = location.pathname.includes('/admin/');
    const panelUrl = inAdmin ? 'panel.html' : 'admin/panel.html';

    const wrapper = document.createElement('div');
    wrapper.className = 'user-menu-wrapper';
    wrapper.id = 'userMenuWrapper';

    wrapper.innerHTML = `
      <button class="user-menu-btn" id="userMenuBtn" type="button" aria-expanded="false" aria-haspopup="true" aria-label="Menú de perfil">
        <span class="user-avatar-badge" aria-hidden="true">
          <svg class="avatar-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </span>
        <span class="user-display-name">${fullName}</span>
        <svg class="user-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <div class="user-dropdown-menu" id="userDropdownMenu" role="menu" aria-label="Opciones de usuario">
        <div class="user-dropdown-header">
          <div class="dropdown-avatar-circle" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="dropdown-user-details">
            <strong class="dropdown-user-name" title="${fullName}">${fullName}</strong>
            <span class="dropdown-user-role">${roleText}</span>
            ${email ? `<span class="dropdown-user-email" title="${email}">${email}</span>` : ''}
          </div>
        </div>

        <div class="user-dropdown-divider"></div>

        <div class="user-dropdown-body">
          ${isAdmin ? `
            <a href="${panelUrl}" class="user-dropdown-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Panel de Control</span>
            </a>
          ` : ''}

          <button type="button" class="user-dropdown-logout" id="cineLogout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    `;

    // Ubicar siempre en el extremo derecho de la barra de navegación
    nav.appendChild(wrapper);

    const trigger = wrapper.querySelector('#userMenuBtn');
    const dropdown = wrapper.querySelector('#userDropdownMenu');
    const logoutBtn = wrapper.querySelector('#cineLogout');

    const toggleDropdown = (state) => {
      const willOpen = typeof state === 'boolean' ? state : !dropdown.classList.contains('show');
      dropdown.classList.toggle('show', willOpen);
      trigger.classList.toggle('active', willOpen);
      trigger.setAttribute('aria-expanded', String(willOpen));
    };

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleDropdown();
    });

    document.addEventListener('click', (event) => {
      if (!wrapper.contains(event.target)) {
        toggleDropdown(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        toggleDropdown(false);
      }
    });

    logoutBtn.addEventListener('click', (event) => {
      event.preventDefault();
      logout();
    });
  });
})();
