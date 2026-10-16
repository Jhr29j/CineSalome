(() => {
  const TOKEN_KEY='cineSalomeToken', USER_KEY='cineSalomeUser';
  const token=()=>sessionStorage.getItem(TOKEN_KEY);
  const user=()=>{try{return JSON.parse(sessionStorage.getItem(USER_KEY)||'null')}catch{return null}};
  const logout=()=>{sessionStorage.removeItem(TOKEN_KEY);sessionStorage.removeItem(USER_KEY);location.href='login.html'};
  window.CineAuth={token,user,logout,TOKEN_KEY,USER_KEY};
  const path=location.pathname.split('/').pop()||'index.html';
  if(path==='login.html'){if(token()&&user()?.role==='student')location.replace('index.html');return;}
  if(!token()||user()?.role!=='student'){logout();return;}
  document.addEventListener('DOMContentLoaded',()=>{const nav=document.querySelector('nav');if(!nav||document.getElementById('cineLogout'))return;const area=document.createElement('div');area.className='session-actions';const label=document.createElement('span');label.className='session-name';label.textContent=user()?.NOMBRE_COMPLETO||'Estudiante';const button=document.createElement('button');button.id='cineLogout';button.className='logout-button';button.type='button';button.textContent='Salir';button.addEventListener('click',logout);area.append(label,button);nav.append(area);});
})();
