(() => {
  const token = () => sessionStorage.getItem('cineSalomeToken');
  const user = () => {
    try {
      return JSON.parse(sessionStorage.getItem('cineSalomeUser') || 'null');
    } catch {
      return null;
    }
  };
  const logout = () => {
    sessionStorage.removeItem('cineSalomeToken');
    sessionStorage.removeItem('cineSalomeUser');
    location.replace('./');
  };

  window.CineAuth = { token, user, logout };

  if (!token() || user()?.role !== 'admin') {
    logout();
    return;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const adminLogoutBtn = document.getElementById('adminLogout');
    if (adminLogoutBtn) {
      const nav = adminLogoutBtn.closest('nav');
      const currentUser = user() || {};
      const fullName = currentUser.NOMBRE_COMPLETO || currentUser.name || currentUser.USUARIO || 'Administrador';
      const email = currentUser.CORREO || '';

      const wrapper = document.createElement('div');
      wrapper.className = 'user-menu-wrapper';
      wrapper.id = 'adminUserMenuWrapper';

      wrapper.innerHTML = `
        <button class="user-menu-btn" id="adminUserMenuBtn" type="button" aria-expanded="false" aria-haspopup="true" aria-label="Menú de perfil">
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

        <div class="user-dropdown-menu" id="adminUserDropdownMenu" role="menu" aria-label="Opciones de administrador">
          <div class="user-dropdown-header">
            <div class="dropdown-avatar-circle" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="dropdown-user-details">
              <strong class="dropdown-user-name" title="${fullName}">${fullName}</strong>
              <span class="dropdown-user-role">Administrador</span>
              ${email ? `<span class="dropdown-user-email" title="${email}">${email}</span>` : ''}
            </div>
          </div>

          <div class="user-dropdown-divider"></div>

          <div class="user-dropdown-body">
            <a href="../index.html" class="user-dropdown-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Ver sitio web</span>
            </a>

            <button type="button" class="user-dropdown-logout" id="dropdownAdminLogout">
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

      adminLogoutBtn.replaceWith(wrapper);

      const trigger = wrapper.querySelector('#adminUserMenuBtn');
      const dropdown = wrapper.querySelector('#adminUserDropdownMenu');
      const logoutBtn = wrapper.querySelector('#dropdownAdminLogout');

      const toggleDropdown = (state) => {
        const willOpen = typeof state === 'boolean' ? state : !dropdown.classList.contains('show');
        dropdown.classList.toggle('show', willOpen);
        trigger.classList.toggle('active', willOpen);
        trigger.setAttribute('aria-expanded', String(willOpen));
      };

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown();
      });

      document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
          toggleDropdown(false);
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') toggleDropdown(false);
      });

      logoutBtn.addEventListener('click', logout);
    }
  });
})();