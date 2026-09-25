(() => {
  const store = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
    },
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  };
  const profile = store.get('jambeli_profile', { name: 'Maria Cedeno', email: 'admin@jambeli.edu.ec', role: 'Administradora', photo: '' });
  const entryTime = localStorage.getItem('jambeli_entry_time') || '07:30';
  localStorage.setItem('jambeli_entry_time', entryTime);
  const today = () => new Date().toISOString().slice(0, 10);
  const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const initialsFor = name => name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
  const attendanceRows = () => store.get('jambeli_attendance', []);
  const show = message => window.showToast ? window.showToast(message) : alert(message);

  const style = document.createElement('style');
  style.textContent = '.enhancement-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.profile-form{display:grid;gap:12px}.profile-header{display:flex;align-items:center;gap:18px;margin-bottom:20px}.photo-button{cursor:pointer}.history-summary{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}@media(max-width:700px){.enhancement-grid{grid-template-columns:1fr}.profile-header{align-items:flex-start;flex-direction:column}}';
  document.head.appendChild(style);

  function createView(name, title, content) {
    const section = document.createElement('section');
    section.id = `${name}View`;
    section.className = 'view-section d-none';
    section.innerHTML = `<section class="panel"><div class="panel-header"><div><h2 class="panel-title">${title}</h2><p class="panel-subtitle">Gestiona la informacion del sistema</p></div></div>${content}</section>`;
    document.querySelector('main').appendChild(section);
    return section;
  }

  const links = [
    ['history', 'clock-history', 'Historial'],
    ['schedule', 'calendar2-week', 'Horarios'],
    ['profile', 'person-circle', 'Mi perfil']
  ];
  const sidebarFooter = document.querySelector('.sidebar-footer');
  links.forEach(([view, icon, label]) => {
    const button = document.createElement('button');
    button.className = 'side-link'; button.dataset.view = view;
    button.innerHTML = `<i class="bi bi-${icon}"></i><span>${label}</span>`;
    sidebarFooter.before(button);
  });

  const historyView = createView('history', 'Historial completo', '<div class="history-filters"><input class="form-control" id="historySearch" placeholder="Buscar estudiante"><input class="form-control" id="historyDate" type="date"><select class="form-select" id="historyCourse"><option value="">Todos los cursos</option></select></div><div class="table-wrap"><table class="table"><thead><tr><th>Estudiante</th><th>Curso</th><th>Fecha</th><th>Entrada</th><th>Estado</th></tr></thead><tbody id="historyRows"></tbody></table></div>');
  const scheduleView = createView('schedule', 'Horarios', '<div class="enhancement-grid"><div class="schedule-card"><h3 class="panel-title">Jornada academica</h3><p class="panel-subtitle">La regla se aplica a cada escaneo QR.</p><div class="row g-3 mt-2"><div class="col-sm-6"><label class="form-label small">Hora de entrada</label><input id="entryTime" type="time" class="form-control"></div><div class="col-sm-6"><label class="form-label small">Hora de salida</label><input id="exitTime" type="time" class="form-control" value="13:00"></div></div><button id="saveSchedule" class="btn btn-primary mt-3"><i class="bi bi-check2 me-1"></i>Guardar horario</button></div><div class="status-message"><i class="bi bi-shield-check me-2"></i>Entrada hasta la hora configurada: <strong id="scheduleSummary"></strong><br><small class="d-block mt-2">Despues de esa hora el sistema marca ATRASADO automaticamente.</small></div></div>');
  const profileView = createView('profile', 'Mi perfil', '<div class="profile-header"><div class="profile-photo-wrap"><div id="profilePhoto" class="profile-photo"></div><label class="profile-photo-edit" for="photoInput" title="Cambiar foto"><i class="bi bi-camera"></i></label><input id="photoInput" type="file" accept="image/jpeg,image/png,image/webp"></div><div><h3 id="profileNameHeading" class="panel-title mb-1"></h3><p id="profileRole" class="panel-subtitle"></p></div></div><form id="profileForm" class="profile-form" autocomplete="off"><label class="form-label small mb-0">Nombre completo<input id="profileName" class="form-control" required></label><label class="form-label small mb-0">Correo electronico<input id="profileEmail" type="email" class="form-control" required></label><label class="form-label small mb-0">Nueva contrasena<input id="profilePassword" type="password" class="form-control" minlength="6" placeholder="Dejar vacia para conservarla"></label><button class="btn btn-primary" type="submit"><i class="bi bi-person-check me-1"></i>Guardar cambios</button></form>');

  function renderProfile() {
    document.querySelector('#profileName').value = profile.name;
    document.querySelector('#profileEmail').value = profile.email;
    document.querySelector('#profileNameHeading').textContent = profile.name;
    document.querySelector('#profileRole').textContent = profile.role;
    const photo = document.querySelector('#profilePhoto');
    photo.innerHTML = profile.photo ? `<img class="profile-photo" src="${profile.photo}" alt="Foto de perfil">` : initialsFor(profile.name);
    document.querySelector('.profile strong').textContent = profile.name;
    document.querySelector('.profile span').textContent = profile.role;
    document.querySelector('.avatar').textContent = initialsFor(profile.name);
  }
  function renderHistory() {
    const search = document.querySelector('#historySearch').value.toLowerCase();
    const date = document.querySelector('#historyDate').value;
    const course = document.querySelector('#historyCourse').value;
    const rows = attendanceRows().filter(item => (!search || item.name.toLowerCase().includes(search)) && (!date || item.date === date) && (!course || item.course === course));
    document.querySelector('#historyRows').innerHTML = rows.length ? rows.map(item => `<tr><td><div class="student-cell"><div class="student-pic">${escapeHtml(item.initials || initialsFor(item.name))}</div>${escapeHtml(item.name)}</div></td><td>${escapeHtml(item.course)}</td><td>${escapeHtml(item.date || '-')}</td><td>${escapeHtml(item.time)}</td><td><span class="${item.status === 'Tardanza' ? 'badge-late' : 'badge-present'}">${escapeHtml(item.status)}</span></td></tr>`).join('') : '<tr><td colspan="5" class="text-center text-secondary py-4">No hay registros para estos filtros.</td></tr>';
  }
  function renderCoursesFilter() {
    const select = document.querySelector('#historyCourse');
    const courses = [...new Set(attendanceRows().map(item => item.course).filter(Boolean))];
    select.innerHTML = '<option value="">Todos los cursos</option>' + courses.map(course => `<option>${escapeHtml(course)}</option>`).join('');
  }

  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
    const target = document.querySelector(`#${button.dataset.view}View`);
    if (target) { document.querySelectorAll('.view-section').forEach(view => view.classList.add('d-none')); target.classList.remove('d-none'); }
    document.querySelectorAll('.side-link').forEach(link => link.classList.toggle('active', link.dataset.view === button.dataset.view));
    const titles = { history: 'Historial completo', schedule: 'Horarios', profile: 'Mi perfil' };
    if (titles[button.dataset.view]) document.querySelector('#viewTitle').textContent = titles[button.dataset.view];
    if (button.dataset.view === 'history') { renderCoursesFilter(); renderHistory(); }
  }));
  ['historySearch', 'historyDate', 'historyCourse'].forEach(id => document.querySelector(`#${id}`).addEventListener('input', renderHistory));
  document.querySelector('#entryTime').value = entryTime;
  document.querySelector('#scheduleSummary').textContent = entryTime;
  document.querySelector('#saveSchedule').addEventListener('click', () => { const value = document.querySelector('#entryTime').value || '07:30'; localStorage.setItem('jambeli_entry_time', value); document.querySelector('#scheduleSummary').textContent = value; show('Horario guardado correctamente.'); });
  document.querySelector('#photoInput').addEventListener('change', event => { const file = event.target.files[0]; if (!file || file.size > 2000000) { show('Selecciona una imagen de maximo 2 MB.'); return; } const reader = new FileReader(); reader.onload = () => { profile.photo = reader.result; store.set('jambeli_profile', profile); renderProfile(); show('Foto de perfil guardada correctamente.'); }; reader.readAsDataURL(file); });
  document.querySelector('#profileForm').addEventListener('submit', event => { event.preventDefault(); profile.name = document.querySelector('#profileName').value.trim(); profile.email = document.querySelector('#profileEmail').value.trim(); if (!profile.name || !profile.email) return show('Completa nombre y correo.'); store.set('jambeli_profile', profile); renderProfile(); show('Perfil actualizado correctamente.'); });
  renderProfile();
})();
