
const API = '/api/v1';
let configuracion = { simulatedEnabled: false };
let idempotencias = new Map();
let sesion = null;           // { token, rol, nombre, estudianteId, docenteId }
let tab = 'cursos';

const $ = (s) => document.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function icono(nombre) {
  const trazos = {
    estudiantes:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3a4 4 0 0 1 0 8"/><circle cx="9" cy="7" r="4"/>',
    cursos:'<path d="M4 3h6a3 3 0 0 1 3 3v15a4 4 0 0 0-4-3H4zm16 0h-4a3 3 0 0 0-3 3m7-3v15h-3a4 4 0 0 0-4 3"/>',
    matriculas:'<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M8 2v4m8-4v4M4 10h16m-12 5 3 3 5-5"/>',
    docentes:'<path d="m2 8 10-5 10 5-10 5zm4 3v6c4 3 8 3 12 0v-6m4-3v8"/>',
    pagos:'<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M6 15h4"/>',
    notificaciones:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    operacion:'<path d="M4 20h17M7 16V9m5 7V4m5 12v-5"/>',
    seguridad:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6zm-4 9 3 3 5-6"/>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${trazos[nombre] || trazos.cursos}</svg>`;
}

function aviso(msg, ok = true) {
  const t = $('#toast');
  t.textContent = msg; t.style.background = ok ? 'var(--verde)' : 'var(--rojo)'; t.style.display = 'block';
  clearTimeout(aviso.t); aviso.t = setTimeout(() => t.style.display = 'none', 4000);
}

async function api(metodo, ruta, cuerpo, extraHeaders = {}) {
  const r = await fetch(API + ruta, {
    method: metodo,
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json',
               ...(sesion ? { 'Authorization': 'Bearer ' + sesion.token } : {}), ...extraHeaders },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  if (r.status === 204) return null;
  const datos = await r.json().catch(() => ({}));
  if (!r.ok) {
    if (r.status === 401 && sesion) { cerrar(); aviso('Tu sesión venció, entra de nuevo', false); }
    const det = datos.errors ? ' ' + Object.values(datos.errors).flat().join(' ') : '';
    throw new Error((datos.message || 'Error ' + r.status) + det + (r.status >= 500 && datos.correlationId ? ' · Referencia: ' + datos.correlationId : ''));
  }
  return datos;
}
const lista = async (ruta) => (await api('GET', ruta)).data || [];

// ---------- Sesión ----------
function guardar() { sessionStorage.removeItem('sesion'); } // Access tokens remain in memory.
function cerrar() { sesion = null; sessionStorage.removeItem('sesion'); pintar(); }
$('#salir').onclick = cerrar;
$('#cambiar-clave').onclick = () => modal('Cambiar contraseña', [
  { id: 'passwordActual', label: 'Contraseña actual', tipo: 'password' },
  { id: 'passwordNueva', label: 'Nueva contraseña (mínimo 6 caracteres)', tipo: 'password' },
  { id: 'passwordConfirmacion', label: 'Confirmar nueva contraseña', tipo: 'password' },
], 'Actualizar contraseña', async (v) => {
  if (!v.passwordNueva || v.passwordNueva.length < 6) throw new Error('La nueva contraseña debe tener al menos 6 caracteres.');
  if (v.passwordNueva !== v.passwordConfirmacion) throw new Error('La confirmación de la nueva contraseña no coincide.');
  await api('POST', '/auth/password', v);
  aviso('Contraseña actualizada correctamente');
});
$('.marca').onclick = e => { if (sesion) { e.preventDefault(); tab = sesion.rol === 'ADMIN' ? 'estudiantes' : 'cursos'; pintar(); } };

function vistaLogin() {
  $('#main').innerHTML = `
    <section class="bienvenida-login"><span class="eyebrow">PORTAL ACADÉMICO INSTITUCIONAL</span><h1>Tu gestión universitaria,<br>en un solo lugar.</h1><p>Plataforma integrada para estudiantes, docentes y administración académica de la Universidad del Tolima.</p>
      <div class="login-servicios"><div><span>01</span><div><strong>Estudiantes</strong><p>Consulta la oferta de cursos, matricula tus asignaturas y realiza el seguimiento de tus pagos.</p></div></div><div><span>02</span><div><strong>Docentes</strong><p>Visualiza tus cursos asignados, cupos disponibles y el listado de estudiantes inscritos por periodo.</p></div></div><div><span>03</span><div><strong>Administración</strong><p>Gestiona el registro de usuarios, programación académica, recaudos y auditoría del sistema.</p></div></div></div><div class="login-pie">Universidad del Tolima <span>Sistema Integrado de Registro Académico · IDEAD</span></div></section>
    <div class="card login">
      <img class="login-logo" src="logo-ut.png?v=2" alt="Universidad del Tolima">
      <h2 class="login-titulo">Registro Académico</h2>
      <div class="login-campos">
        <div class="campo"><input id="email" type="email" placeholder="Correo institucional" aria-label="Correo institucional" autocomplete="username"></div>
        <div class="campo"><input id="pass" type="password" placeholder="Contraseña" aria-label="Contraseña" autocomplete="current-password"></div>
      </div>
      <div class="linea-roja-login" aria-hidden="true"></div>
      <button class="b btn-ingresar" id="entrar">INGRESAR</button>
      <div class="separador-login"><span>o continúa con</span></div>
      <button class="b gris" id="institucional">Acceso institucional</button>
      <div class="demo-label" style="display:${configuracion.simulatedEnabled ? 'block' : 'none'}">Cuentas de demostración</div>
      <div class="rapido" style="display:${configuracion.simulatedEnabled ? 'flex' : 'none'}">
        <button class="b gris" data-u="admin@ut.edu.co" data-p="password123">Admin</button>
        <button class="b gris" data-u="carlos.rojas@ut.edu.co" data-p="1000000002">Docente</button>
        <button class="b gris" data-u="ana.martinez@ut.edu.co" data-p="1000000001">Estudiante</button>
      </div>
    </div>`;
  document.querySelectorAll('[data-u]').forEach(b => b.onclick = () => { $('#email').value = b.dataset.u; $('#pass').value = b.dataset.p || 'password123'; });
  const entrar = async () => {
    try {
      const d = await api('POST', '/auth/login', { email: $('#email').value.trim(), password: $('#pass').value });
      sesion = { token: d.accessToken, rol: d.rol, nombre: d.nombre, estudianteId: d.estudianteId, docenteId: d.docenteId };
      guardar(); tab = sesion.rol === 'ADMIN' ? 'estudiantes' : 'cursos'; pintar();
    } catch (e) { aviso(e.message, false); }
  };
  $('#entrar').onclick = async () => { $('#entrar').disabled = true; try { await entrar(); } finally { if ($('#entrar')) $('#entrar').disabled = false; } };
  $('#institucional').onclick = iniciarIdentidad;
  $('#pass').onkeydown = (e) => e.key === 'Enter' && entrar();
}

// ---------- Estructura ----------
function pintar() {
  document.body.classList.toggle('autenticado', !!sesion);
  $('#salir').style.display = sesion ? '' : 'none';
  $('#cambiar-clave').style.display = sesion ? '' : 'none';
  $('#quien').innerHTML = sesion ? `<span class="avatar-cuenta">${esc(sesion.nombre.charAt(0))}</span><span><strong>${esc(sesion.nombre)}</strong><small>${({ADMIN:'Administrador',DOCENTE:'Docente',ESTUDIANTE:'Estudiante'})[sesion.rol] || ''}</small></span>` : '';
  if (!sesion) return vistaLogin();
  const tabs = [];
  if (sesion.rol !== 'ESTUDIANTE') tabs.push(['estudiantes', 'Estudiantes']);
  tabs.push(['cursos', 'Cursos'], ['matriculas', 'Matrículas']);
  if (sesion.rol === 'ADMIN') tabs.push(['docentes', 'Docentes']);
  if (sesion.rol !== 'DOCENTE') tabs.push(['pagos', 'Pagos']);
  tabs.push(['notificaciones', 'Avisos']);
  if (sesion.rol === 'ADMIN') tabs.push(['operacion', 'Operación']);
  const info = {
    estudiantes:['Registro de estudiantes','Administra la información de los estudiantes y sus datos académicos.'],
    cursos:['Oferta académica','Consulta y organiza los cursos disponibles para cada periodo.'],
    matriculas:['Gestión de matrículas','Acompaña el proceso de inscripción y consulta las asignaturas matriculadas.'],
    docentes:['Directorio de docentes','Gestiona los profesores que acompañan la formación académica.'],
    pagos:['Pagos y transacciones','Consulta las órdenes de pago y su historial de procesamiento.'],
    notificaciones:['Centro de avisos','Encuentra las novedades de tus procesos académicos.'],
    operacion:['Operación del sistema','Consulta los indicadores de la aplicación y la trazabilidad de sus cambios.']
  }[tab];
  $('#main').innerHTML = `<aside class="barra-lateral"><span class="nav-titulo">GESTIÓN ACADÉMICA</span><nav aria-label="Navegación principal">${tabs.map(([k, n]) => `<button data-t="${k}" class="${k === tab ? 'on' : ''}" ${k === tab ? 'aria-current="page"' : ''}>${icono(k)}<span>${n}</span>${k === tab ? '<i></i>' : ''}</button>`).join('')}</nav><div class="lateral-pie"><span class="lateral-emblema">RA</span><strong>Información conectada</strong><p>Registro, formación y seguimiento académico.</p><small>Portal universitario</small></div></aside>
    <div class="contenido"><div class="ruta-pagina">Portal académico <span>/</span> ${esc(tabs.find(t => t[0] === tab)?.[1] || '')}</div><section class="encabezado-pagina"><div><span class="eyebrow">GESTIÓN UNIVERSITARIA</span><h1>${info[0]}</h1><p>${info[1]}</p></div><span class="etiqueta-acceso">${icono('seguridad')} Acceso por rol</span></section><div id="vista"></div><footer>Registro Académico <span>Universidad del Tolima · IDEAD</span></footer></div>`;
  document.querySelectorAll('nav button').forEach(b => b.onclick = () => { tab = b.dataset.t; pintar(); });
  ({ cursos: vistaCursos, matriculas: vistaMatriculas, estudiantes: vistaEstudiantes, docentes: vistaDocentes, pagos: vistaPagos, notificaciones: vistaNotificaciones, operacion: vistaOperacion })[tab]();
}

function modal(titulo, campos, textoOk, alGuardar) {
  const registro = titulo === 'Registrar estudiante';
  $('#box').classList.toggle('form-registro', registro);
  $('#box').innerHTML = `<div class="modal-encabezado"><span class="eyebrow">${registro ? 'REGISTRO ESTUDIANTIL' : 'GESTIÓN ACADÉMICA'}</span><h3>${esc(titulo)}</h3><p class="nota">${registro ? 'Completa la información para crear la ficha del estudiante.' : 'Completa los campos y confirma para continuar.'}</p></div><div class="campos-formulario">
    ${campos.map(c => `<div class="campo"><label for="f_${c.id}">${esc(c.label)}</label>${c.opciones
      ? `<select id="f_${c.id}">${c.opciones.map(o => `<option value="${esc(o[0])}" ${String(o[0]) === String(c.valor ?? '') ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`
      : `<input id="f_${c.id}" type="${c.tipo || 'text'}" value="${esc(c.valor ?? '')}">`}</div>`).join('')}
    </div><div class="modal-acciones" style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">
      <button class="b gris" id="m_no">Cancelar</button><button class="b" id="m_ok">${esc(textoOk)}</button></div>`;
  $('#modal').style.display = 'flex';
  $('#box input, #box select')?.focus();
  $('#m_no').onclick = () => $('#modal').style.display = 'none';
  $('#m_ok').onclick = async () => {
    const v = {}; campos.forEach(c => v[c.id] = $('#f_' + c.id).value);
    const boton = $('#m_ok'); boton.disabled = true;
    try { await alGuardar(v); $('#modal').style.display = 'none'; } catch (e) { aviso(e.message, false); } finally { boton.disabled = false; }
  };
}

// ---------- Cursos ----------
async function vistaCursos() {
  const esAdmin = sesion.rol === 'ADMIN';
  const esDocente = sesion.rol === 'DOCENTE' && sesion.docenteId;
  $('#vista').innerHTML = `<div class="card">
    <div class="der"><h2 style="margin:0">${esDocente ? 'Mis cursos y catálogo' : 'Cursos'}</h2>${esAdmin ? '<button class="b" id="nuevo">+ Nuevo curso</button>' : ''}</div>
    <div class="filtros">
      ${esDocente ? `<div><label>Vista</label><select id="fd"><option value="${esc(sesion.docenteId)}">Mis cursos asignados</option><option value="">Todo el catálogo</option></select></div>` : ''}
      <div><label>Periodo</label><input id="fp" placeholder="2026-2"></div>
      <div><label>Estado</label><select id="fe"><option value="">Todos</option><option>ABIERTO</option><option>CERRADO</option></select></div>
      <div><label>Ordenar por</label><select id="fs"><option value="nombre,asc">Nombre (A-Z)</option><option value="nombre,desc">Nombre (Z-A)</option><option value="creditos,desc">Más créditos</option><option value="cupoDisponible,desc">Más cupos</option></select></div>
      <button class="b" id="buscar">Filtrar</button>
    </div><div class="scroll" id="tabla">Cargando…</div></div>`;
  const cargar = async (pagina = 1) => {
    const q = new URLSearchParams({ limit: 100, sort: $('#fs').value });
    if ($('#fp').value) q.set('periodo', $('#fp').value.trim());
    if ($('#fe').value) q.set('estado', $('#fe').value);
    if ($('#fd')?.value) q.set('docenteId', $('#fd').value);
    try {
      const [datos, misMats] = await Promise.all([
        paginaApi('/cursos?' + q, pagina),
        sesion.rol === 'ESTUDIANTE' ? lista('/matriculas?limit=100').catch(() => []) : Promise.resolve([]),
      ]);
      const cursos = datos.data;
      const matriculados = new Set(misMats.filter(m => m.estado === 'ACTIVA' && m.curso).map(m => m.curso.id));
      $('#tabla').innerHTML = !cursos.length ? '<div class="vacio">No hay cursos con esos filtros.</div>' : `<table>
        <tr><th>Código</th><th>Nombre</th><th>Créd.</th><th>Docente</th><th>Periodo</th><th>Cupos</th><th>Estado</th><th>Acciones</th></tr>
        ${cursos.map(c => {
          const puedePdf = esAdmin || (esDocente && Number(c.docente?.id) === Number(sesion.docenteId));
          return `<tr><td>${esc(c.codigo)}</td><td>${esc(c.nombre)}</td><td>${c.creditos}</td>
          <td>${c.docente ? esc(c.docente.nombres + ' ' + c.docente.apellidos) : ''}</td><td>${esc(c.periodo)}</td>
          <td>${c.cupoDisponible} / ${c.cupoMaximo}</td><td><span class="tag ${esc(c.estado)}">${esc(c.estado)}</span></td>
          <td style="white-space:nowrap">
            ${sesion.rol === 'ESTUDIANTE' && matriculados.has(c.id)
              ? '<span class="tag ACTIVA">Ya matriculado</span>'
              : (sesion.rol !== 'DOCENTE' ? `<button class="b" data-mat="${c.id}" data-per="${esc(c.periodo)}">Matricular</button>` : '')}
            ${puedePdf ? `<button class="b gris" data-pdf="${c.id}" data-cod="${esc(c.codigo)}" data-per="${esc(c.periodo)}">Lista PDF</button>` : ''}
            ${esAdmin ? `<button class="b gris" data-ed="${c.id}">Editar</button> <button class="b rojo" data-del="${c.id}">Eliminar</button>` : ''}
          </td></tr>`;
        }).join('')}</table>`;
      document.querySelectorAll('[data-mat]').forEach(b => b.onclick = () => matricular(b.dataset.mat, b.dataset.per));
      document.querySelectorAll('[data-pdf]').forEach(b => b.onclick = () => descargarListaPdf(b.dataset.pdf, b.dataset.cod, b.dataset.per, b));
      document.querySelectorAll('[data-ed]').forEach(b => b.onclick = () => formCurso(cursos.find(c => c.id == b.dataset.ed), cargar));
      paginador(datos, cargar);
      document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
        if (!confirm('¿Eliminar este curso?')) return;
        try { await api('DELETE', '/cursos/' + b.dataset.del); aviso('Curso eliminado'); cargar(); } catch (e) { aviso(e.message, false); }
      });
    } catch (e) { $('#tabla').textContent = e.message; }
  };
  $('#buscar').onclick = () => cargar();
  if ($('#fd')) $('#fd').onchange = () => cargar();
  if (esAdmin) $('#nuevo').onclick = () => formCurso(null, cargar);
  cargar();
}

async function formCurso(c, recargar) {
  const docentes = await lista('/docentes?limit=100');
  modal(c ? 'Editar curso' : 'Nuevo curso', [
    { id: 'codigo', label: 'Código', valor: c?.codigo },
    { id: 'nombre', label: 'Nombre', valor: c?.nombre },
    { id: 'creditos', label: 'Créditos (1-10)', tipo: 'number', valor: c?.creditos ?? 3 },
    { id: 'cupoMaximo', label: 'Cupo máximo', tipo: 'number', valor: c?.cupoMaximo ?? 30 },
    { id: 'periodo', label: 'Periodo (ej. 2026-2)', valor: c?.periodo ?? '2026-2' },
    { id: 'docenteId', label: 'Docente', valor: c?.docente?.id, opciones: docentes.map(d => [d.id, d.nombres + ' ' + d.apellidos]) },
    { id: 'estado', label: 'Estado', valor: c?.estado ?? 'ABIERTO', opciones: [['ABIERTO', 'ABIERTO'], ['CERRADO', 'CERRADO']] },
  ], 'Guardar', async (v) => {
    const cuerpo = { codigo: v.codigo, nombre: v.nombre, creditos: +v.creditos, cupoMaximo: +v.cupoMaximo,
                     periodo: v.periodo, docenteId: +v.docenteId, estado: v.estado };
    if (c) await api('PUT', '/cursos/' + c.id, cuerpo); else await api('POST', '/cursos', cuerpo);
    aviso(c ? 'Curso actualizado' : 'Curso creado'); recargar();
  });
}

async function matricular(cursoId, periodo) {
  const hacer = async (estudianteId) => {
    await api('POST', '/matriculas', { estudianteId: +estudianteId, cursoId: +cursoId, periodo });
    aviso('Matrícula realizada'); pintar();
  };
  if (sesion.rol === 'ESTUDIANTE') {
    try { await hacer(sesion.estudianteId); } catch (e) { aviso(e.message, false); }
  } else {
    const ests = await lista('/estudiantes?limit=100');
    modal('Matricular estudiante', [{ id: 'est', label: 'Estudiante', opciones: ests.map(e => [e.id, `${e.nombres} ${e.apellidos} (${e.documento})`]) }],
      'Matricular', (v) => hacer(v.est));
  }
}

async function descargarListaPdf(cursoId, codigo, periodo, btn) {
  if (btn) btn.disabled = true;
  try {
    const r = await fetch(`${API}/cursos/${cursoId}/lista-pdf`, {
      headers: { ...(sesion ? { 'Authorization': 'Bearer ' + sesion.token } : {}) }
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err.message || 'No se pudo generar el PDF del curso');
    }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lista_Estudiantes_${(codigo || cursoId)}_${(periodo || '2026-2')}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    aviso('Lista de estudiantes descargada en PDF');
  } catch (e) {
    aviso(e.message, false);
  } finally {
    if (btn) btn.disabled = false;
  }
}

// ---------- Matrículas ----------
async function vistaMatriculas(pagina = 1) {
  $('#vista').innerHTML = `<div class="card"><h2 style="margin-top:0">${sesion.rol === 'ESTUDIANTE' ? 'Mis matrículas' : sesion.rol === 'DOCENTE' ? 'Matrículas de mis cursos' : 'Matrículas'}</h2><div class="scroll" id="tabla">Cargando…</div></div>`;
  try {
    const datos = await paginaApi('/matriculas', pagina); const ms = datos.data;
    $('#tabla').innerHTML = !ms.length ? '<div class="vacio">No hay matrículas.</div>' : `<table>
      <tr><th>#</th><th>Estudiante</th><th>Curso</th><th>Periodo</th><th>Estado académico</th><th>Fecha</th><th>Pago</th><th></th></tr>
      ${ms.map(m => `<tr><td>${m.id}</td><td>${m.estudiante ? esc(m.estudiante.nombres + ' ' + m.estudiante.apellidos) : ''}</td>
        <td>${m.curso ? esc(m.curso.codigo + ' · ' + m.curso.nombre) : ''}</td><td>${esc(m.periodo)}</td>
        <td><span class="tag ${esc(m.estado)}">${esc(m.estado)}</span></td><td>${m.fechaMatricula ? new Date(m.fechaMatricula).toLocaleString('es-CO') : ''}</td>
        <td>${m.pago ? `<span class="tag ${esc(m.pago.estado)}">${esc(m.pago.estado)}</span>` : 'Sin orden'}</td><td>${m.estado === 'ACTIVA' && sesion.rol !== 'DOCENTE' ? `<button class="b" data-orden="${m.id}">${m.pago ? 'Ver pago' : 'Generar orden'}</button> ` : ''}${m.estado === 'ACTIVA' && sesion.rol !== 'DOCENTE' ? `<button class="b rojo" data-can="${m.id}">Cancelar</button>` : ''}</td></tr>`).join('')}</table>`;
    paginador(datos, vistaMatriculas);
    document.querySelectorAll('[data-orden]').forEach(b => b.onclick = async () => {
      b.disabled = true; try { await api('POST', '/pagos', { matriculaId: +b.dataset.orden }); tab = 'pagos'; pintar(); } catch (e) { aviso(e.message, false); b.disabled = false; }
    });
    document.querySelectorAll('[data-can]').forEach(b => b.onclick = async () => {
      if (!confirm('¿Cancelar esta matrícula?')) return;
      try { await api('DELETE', '/matriculas/' + b.dataset.can); aviso('Matrícula cancelada'); vistaMatriculas(); } catch (e) { aviso(e.message, false); }
    });
  } catch (e) { $('#tabla').textContent = e.message; }
}

// ---------- Estudiantes ----------
async function vistaEstudiantes() {
  const esAdmin = sesion.rol === 'ADMIN';
  $('#vista').innerHTML = `<div class="registro-resumen"><div class="resumen-principal"><span class="resumen-icono">${icono('estudiantes')}</span><div><span>Resultados del directorio</span><strong id="total-estudiantes">—</strong><small>Estudiantes en la consulta actual</small></div></div><div class="registro-ayuda"><span class="eyebrow">UN REGISTRO, TODA SU INFORMACIÓN</span><h3>El proceso académico comienza aquí.</h3><p>Registra los datos personales, el correo y el programa de cada estudiante.</p></div></div>
    <div class="card directorio"><div class="der"><div><h2 style="margin:0">Directorio estudiantil</h2><p class="nota">Consulta, busca y organiza las fichas de tus estudiantes.</p></div>${esAdmin ? '<button class="b" id="nuevo">+ Registrar estudiante</button>' : ''}</div>
    <div class="filtros filtros-directorio"><div><label for="fq">Buscar estudiante</label><input id="fq" placeholder="Buscar por nombre, apellido o documento"></div><button class="b gris" id="buscar">Buscar</button></div>
    <div class="scroll" id="tabla">Cargando…</div></div>`;
  const cargar = async (pagina = 1) => {
    try {
      const datos = await paginaApi('/estudiantes?q=' + encodeURIComponent($('#fq').value), pagina); const es = datos.data;
      $('#total-estudiantes').textContent = datos.meta?.total ?? es.length;
      $('#tabla').innerHTML = !es.length ? '<div class="vacio"><strong>No encontramos estudiantes en esta consulta.</strong><p>Prueba con otro nombre o documento, o registra un estudiante nuevo.</p></div>' : `<table class="tabla-estudiantes">
        <tr><th>Estudiante</th><th>Documento</th><th>Programa académico</th><th>Estado</th>${esAdmin ? '<th class="acciones-columna">Acciones</th>' : ''}</tr>
        ${es.map(e => `<tr><td><div class="persona"><span class="avatar-estudiante">${esc(e.nombres.charAt(0) + e.apellidos.charAt(0))}</span><div><strong>${esc(e.nombres + ' ' + e.apellidos)}</strong><small>${esc(e.correo)}</small></div></div></td><td class="documento">${esc(e.documento)}</td><td><span class="programa">${esc(e.programa)}</span></td>
        <td><span class="tag ${esc(e.estado)}">${esc(e.estado)}</span></td>
        ${esAdmin ? `<td><button class="b rojo" data-del="${e.id}">Eliminar</button></td>` : ''}</tr>`).join('')}</table>`;
      paginador(datos, cargar);
      document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
        if (!confirm('¿Eliminar este estudiante?')) return;
        try { await api('DELETE', '/estudiantes/' + b.dataset.del); aviso('Estudiante eliminado'); cargar(); } catch (e) { aviso(e.message, false); }
      });
    } catch (e) { $('#tabla').textContent = e.message; }
  };
  $('#buscar').onclick = () => cargar();
  $('#fq').onkeydown = e => e.key === 'Enter' && cargar();
  if (esAdmin) $('#nuevo').onclick = () => modal('Registrar estudiante', [
    { id: 'documento', label: 'Documento (será su contraseña inicial)' }, { id: 'nombres', label: 'Nombres' }, { id: 'apellidos', label: 'Apellidos' },
    { id: 'correo', label: 'Correo', tipo: 'email' },
    { id: 'programa', label: 'Programa académico', valor: 'Ingeniería de Sistemas', opciones: [
      ['Ingeniería de Sistemas', 'Ingeniería de Sistemas'],
      ['Administración Financiera', 'Administración Financiera'],
      ['Seguridad y Salud en el Trabajo', 'Seguridad y Salud en el Trabajo'],
      ['Ingeniería Agroindustrial', 'Ingeniería Agroindustrial'],
      ['Ingeniería Forestal', 'Ingeniería Forestal'],
      ['Ingeniería Agronómica', 'Ingeniería Agronómica'],
      ['Contaduría Pública', 'Contaduría Pública'],
      ['Administración de Empresas', 'Administración de Empresas'],
      ['Derecho', 'Derecho'],
      ['Medicina', 'Medicina'],
      ['Enfermería', 'Enfermería'],
      ['Arquitectura', 'Arquitectura'],
      ['Licenciatura en Ciencias Naturales', 'Licenciatura en Ciencias Naturales'],
      ['Comunicación Social y Periodismo', 'Comunicación Social y Periodismo']
    ] },
  ], 'Registrar estudiante', async (v) => { await api('POST', '/estudiantes', v); aviso('Estudiante registrado. Contraseña inicial: ' + v.documento); cargar(); });
  cargar();
}

// ---------- Docentes (solo ADMIN) ----------
async function vistaDocentes() {
  $('#vista').innerHTML = `<div class="card"><div class="der"><h2 style="margin:0">Docentes</h2><button class="b" id="nuevo">+ Nuevo docente</button></div>
    <div class="scroll" id="tabla">Cargando…</div></div>`;
  const cargar = async (pagina = 1) => {
    try {
      const datos = await paginaApi('/docentes', pagina); const ds = datos.data;
      $('#tabla').innerHTML = !ds.length ? '<div class="vacio">No hay docentes.</div>' : `<table>
        <tr><th>#</th><th>Documento</th><th>Nombre</th><th>Correo</th><th>Departamento</th><th></th></tr>
        ${ds.map(d => `<tr><td>${d.id}</td><td class="documento">${esc(d.documento || '—')}</td><td>${esc(d.nombres + ' ' + d.apellidos)}</td><td>${esc(d.correo)}</td><td>${esc(d.departamento)}</td>
        <td><button class="b rojo" data-del="${d.id}">Eliminar</button></td></tr>`).join('')}</table>`;
      paginador(datos, cargar);
      document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
        if (!confirm('¿Eliminar este docente?')) return;
        try { await api('DELETE', '/docentes/' + b.dataset.del); aviso('Docente eliminado'); cargar(); } catch (e) { aviso(e.message, false); }
      });
    } catch (e) { $('#tabla').textContent = e.message; }
  };
  $('#nuevo').onclick = () => modal('Nuevo docente', [
    { id: 'documento', label: 'Documento (será su contraseña inicial)' },
    { id: 'nombres', label: 'Nombres' }, { id: 'apellidos', label: 'Apellidos' },
    { id: 'correo', label: 'Correo', tipo: 'email' },
    { id: 'departamento', label: 'Departamento / Facultad', valor: 'Ingeniería de Sistemas', opciones: [
      ['Ingeniería de Sistemas', 'Ingeniería de Sistemas'],
      ['Ciencias Económicas y Administrativas', 'Ciencias Económicas y Administrativas'],
      ['Ciencias Básicas', 'Ciencias Básicas'],
      ['Ciencias de la Educación', 'Ciencias de la Educación'],
      ['Ciencias de la Salud', 'Ciencias de la Salud'],
      ['Ciencias Agropecuarias y Forestales', 'Ciencias Agropecuarias y Forestales'],
      ['Ciencias Sociales y Jurídicas', 'Ciencias Sociales y Jurídicas'],
      ['Arquitectura y Diseño', 'Arquitectura y Diseño']
    ] },
  ], 'Crear', async (v) => { await api('POST', '/docentes', v); aviso('Docente creado. Contraseña inicial: ' + (v.documento || 'password123')); cargar(); });
  cargar();
}

async function paginaApi(ruta, pagina = 1) {
  const url = new URL(API + ruta, location.origin);
  url.searchParams.set('page', pagina);
  url.searchParams.set('limit', 15);
  return api('GET', url.pathname.slice(API.length) + url.search);
}

function paginador(datos, cargar) {
  $('#paginacion')?.remove();
  const meta = datos.meta || datos;
  if (!meta.last_page || meta.last_page <= 1) return;
  const el = document.createElement('div'); el.id = 'paginacion'; el.className = 'paginacion';
  el.innerHTML = `<button class="b gris" id="anterior" ${meta.current_page <= 1 ? 'disabled' : ''}>Anterior</button>
    <span>Página ${esc(meta.current_page)} de ${esc(meta.last_page)}</span>
    <button class="b gris" id="siguiente" ${meta.current_page >= meta.last_page ? 'disabled' : ''}>Siguiente</button>`;
  $('#tabla').parentElement.append(el);
  $('#anterior').onclick = () => cargar(meta.current_page - 1);
  $('#siguiente').onclick = () => cargar(meta.current_page + 1);
}

const dinero = (valor, moneda) => new Intl.NumberFormat('es-CO', {style: 'currency', currency: moneda || 'COP'}).format(Number(valor));

async function vistaPagos(pagina = 1, estado = '') {
  $('#vista').innerHTML = `<div class="card"><h2>Pagos de matrículas</h2>
    <p class="nota">${configuracion.paymentsDriver === 'mercadopago' ? (configuracion.mercadoPagoTestMode ? 'Mercado Pago · entorno de pruebas. Usa exclusivamente la cuenta compradora y las tarjetas de prueba.' : 'El pago se realiza en el checkout de Mercado Pago.') : configuracion.simulatedEnabled ? 'Demostración: no se cobran fondos reales. La tarifa es de ejemplo y se calcula en el servidor.' : 'Consulta de órdenes y estado financiero.'} Una matrícula ACTIVA no implica pago aprobado.</p>
    <div class="filtros"><div><label for="pestado">Estado</label><select id="pestado"><option value="">Todos</option>${['PENDIENTE','APROBADO','RECHAZADO','REEMBOLSADO'].map(x => `<option ${x === estado ? 'selected' : ''}>${x}</option>`).join('')}</select></div><button class="b" id="pfiltrar">Filtrar</button></div>
    <p class="nota">Para generar una orden, abre Matrículas y selecciona Generar orden.</p><div id="tabla" class="scroll">Cargando…</div></div>`;
  $('#pfiltrar').onclick = () => vistaPagos(1, $('#pestado').value);
  try {
    const datos = await paginaApi('/pagos' + (estado ? '?estado=' + encodeURIComponent(estado) : ''), pagina);
    $('#tabla').innerHTML = !datos.data.length ? '<p class="vacio">No hay pagos en esta consulta.</p>' : `<table><tr><th>Orden</th><th>Matrícula y curso</th><th>Valor</th><th>Estado</th><th>Proveedor</th><th>Acciones</th></tr>
      ${datos.data.map(p => `<tr><td>#${p.id}</td><td>#${p.matriculaId} · ${esc(p.matricula?.curso?.nombre || '')}</td><td>${esc(dinero(p.valor,p.moneda))}</td>
      <td><span class="tag ${esc(p.estado)}">${esc(p.estado)}</span></td><td>${esc(p.proveedor)}${p.simulado ? ' (simulación)' : ''}</td>
      <td><button class="b gris" data-historia="${p.id}">Historial</button>
      ${p.requiereRevision ? '<span class="tag PENDIENTE">Revisión administrativa</span>' : ''}
      ${p.proveedor === 'mercadopago' ? `${p.matricula?.estado === 'ACTIVA' && p.estado === 'PENDIENTE' && !p.requiereRevision ? `<button class="b" data-mp="${p.id}">Pagar con Mercado Pago</button>` : ''} <button class="b gris" data-sync="${p.id}">Consultar estado</button>` : ''}
      ${p.simulado && configuracion.simulatedEnabled && p.matricula?.estado === 'ACTIVA' && ['PENDIENTE','RECHAZADO'].includes(p.estado) ? `<button class="b" data-pagar="${p.id}">Simular pago</button>` : ''}
      ${p.simulado && configuracion.simulatedEnabled && sesion.rol === 'ADMIN' && p.estado === 'APROBADO' ? `<button class="b rojo" data-reembolso="${p.id}">Reembolsar</button>` : ''}</td></tr>`).join('')}</table>`;
    paginador(datos, p => vistaPagos(p, estado));
    document.querySelectorAll('[data-mp]').forEach(b => b.onclick = () => {
      const pago = datos.data.find(x => String(x.id) === b.dataset.mp);
      if (pago) abrirCheckoutBrick(pago, () => vistaPagos(pagina, estado));
    });
    document.querySelectorAll('[data-sync]').forEach(b => b.onclick = async () => {
      b.disabled = true;
      try { await api('POST', `/pagos/${b.dataset.sync}/sincronizar`, {}); aviso('Estado consultado directamente con Mercado Pago'); vistaPagos(pagina,estado); }
      catch(e) { aviso(e.message,false); b.disabled=false; }
    });
    document.querySelectorAll('[data-historia]').forEach(b => b.onclick = () => historialPago(b.dataset.historia).catch(e => aviso(e.message, false)));
    document.querySelectorAll('[data-pagar]').forEach(b => b.onclick = () => modal('Pago simulado · sin cobro real', [
      { id:'resultado', label:'Resultado de demostración', opciones:[['APROBADO','Aprobar'],['RECHAZADO','Rechazar'],['ERROR','Simular indisponibilidad']] }
    ], 'Simular', async v => {
      await accionPago(b.dataset.pagar, 'procesar', v.resultado); aviso('Resultado de simulación registrado'); vistaPagos(pagina,estado);
    }));
    document.querySelectorAll('[data-reembolso]').forEach(b => b.onclick = async () => {
      if (!confirm('¿Registrar un reembolso simulado de esta orden?')) return;
      b.disabled = true;
      try { await accionPago(b.dataset.reembolso, 'reembolsar'); aviso('Reembolso simulado registrado'); vistaPagos(pagina,estado); }
      catch(e) { aviso(e.message,false); b.disabled=false; }
    });
  } catch(e) { if ($('#tabla')) $('#tabla').textContent=e.message; }
}

async function abrirCheckoutBrick(pago, alFinalizar) {
  if (!configuracion.mercadoPagoPublicKey || typeof window.MercadoPago !== 'function') {
    return aviso('Falta configurar MP_PUBLIC_KEY o cargar el SDK de Mercado Pago', false);
  }
  if (window.mpCardBrickController) {
    try { await window.mpCardBrickController.unmount(); } catch (_) {}
    window.mpCardBrickController = null;
  }
  $('#box').classList.remove('form-registro');
  $('#box').innerHTML = `<div class="modal-encabezado"><span class="eyebrow">CHECKOUT API · MERCADO PAGO</span><h3>Pagar orden #${esc(pago.id)}</h3><p class="nota">Total a pagar: <strong>${esc(dinero(pago.valor, pago.moneda))}</strong>. Tus datos de tarjeta se tokenizan directamente con Mercado Pago.</p></div>
    <div id="mp-brick-container"></div>
    <div class="modal-acciones" style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">
      <button class="b gris" id="mp_cerrar">Cancelar</button></div>`;
  $('#modal').style.display = 'flex';
  const cerrarBrick = async () => {
    if (window.mpCardBrickController) {
      try { await window.mpCardBrickController.unmount(); } catch (_) {}
      window.mpCardBrickController = null;
    }
    $('#modal').style.display = 'none';
  };
  $('#mp_cerrar').onclick = cerrarBrick;
  try {
    const mp = new window.MercadoPago(configuracion.mercadoPagoPublicKey, { locale: 'es-CO' });
    window.mpCardBrickController = await mp.bricks().create('cardPayment', 'mp-brick-container', {
      initialization: { amount: Number(pago.valor) },
      customization: { visual: { style: { theme: 'default' } }, paymentMethods: { maxInstallments: 12 } },
      callbacks: {
        onReady: () => {},
        onSubmit: async (cardFormData) => {
          const r = await api('POST', `/pagos/${pago.id}/checkout`, cardFormData);
          await cerrarBrick();
          if (r.estado === 'APROBADO') aviso('Pago aprobado en Mercado Pago');
          else if (r.mpStatus === 'rejected') aviso('Pago rechazado (' + (r.mpStatusDetail || 'revisa los datos de la tarjeta') + ')', false);
          else aviso('Estado del pago: ' + (r.mpStatus || r.estado));
          alFinalizar();
        },
        onError: (err) => {
          aviso(err?.message || 'No se pudo procesar el formulario de Mercado Pago', false);
        },
      },
    });
  } catch (e) {
    await cerrarBrick();
    aviso(e.message || 'Error iniciando Checkout Brick', false);
  }
}

async function accionPago(id, accion, resultado) {
  const intento = `${id}:${accion}:${resultado || ''}`;
  if (!idempotencias.has(intento)) idempotencias.set(intento, crypto.randomUUID());
  const r = await api('POST', `/pagos/${id}/${accion}`, resultado ? {resultado} : {}, { 'Idempotency-Key':idempotencias.get(intento) });
  idempotencias.delete(intento);
  return r;
}

async function historialPago(id) {
  const p = await api('GET', '/pagos/' + id);
  $('#box').classList.add('form-registro');
  $('#box').innerHTML = `<div class="modal-encabezado"><span class="eyebrow">TRAZABILIDAD FINANCIERA · ${esc((p.proveedor || 'SOAP').toUpperCase())}</span><h3>Historial de orden #${esc(p.id)}</h3><p class="nota">Valor: <strong>${esc(dinero(p.valor,p.moneda))}</strong> · Estado actual: <span class="tag ${esc(p.estado)}">${esc(p.estado)}</span></p></div>
    ${(p.transacciones || []).map(t => `<div style="border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;margin-bottom:14px;background:#fafafa">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px">
        <strong>${esc(t.accion)}</strong>
        <span class="tag ${esc(t.estado)}">${esc(t.estado)}</span>
      </div>
      <div style="font-size:12px;color:#52525b;margin-bottom:8px">
        Fecha: ${esc(new Date(t.fecha).toLocaleString('es-CO'))} · Referencia bancaria: <code>${esc(t.referencia)}</code>
      </div>
      ${t.soapXml ? `<details open style="margin-top:8px"><summary style="cursor:pointer;font-size:11.5px;font-weight:600;color:var(--rojo-ut)">Mensaje XML SOAP 1.2 (WSDL / WS-Security)</summary><pre style="margin:8px 0 0;padding:12px;background:#1e1e24;color:#f4f4f5;border-radius:8px;font-size:11px;line-height:1.45;overflow-x:auto;font-family:Consolas,monospace">${esc(t.soapXml)}</pre></details>` : ''}
    </div>`).join('') || '<p class="vacio" style="padding:20px">La orden aún no tiene transacciones procesadas.</p>'}
    <div class="modal-acciones" style="display:flex;justify-content:flex-end"><button class="b" id="cerrar-historia">Cerrar</button></div>`;
  $('#modal').style.display = 'flex';
  $('#cerrar-historia').onclick = () => $('#modal').style.display = 'none';
}

async function vistaNotificaciones(pagina = 1) {
  const etiquetas = {
    'matricula.creada': ['Matrícula académica registrada', 'ACTIVA'],
    'matricula.cancelada': ['Matrícula cancelada', 'CANCELADA'],
    'pago.aprobado': ['Pago de matrícula aprobado', 'APROBADO'],
    'pago.rechazado': ['Intento de pago rechazado', 'RECHAZADO'],
    'pago.reembolsado': ['Reembolso de pago procesado', 'REEMBOLSADO'],
  };
  $('#vista').innerHTML = '<div class="card"><h2>Avisos</h2><p class="nota" style="margin-bottom:16px">Notificaciones generadas por tus procesos académicos y financieros.</p><div id="tabla" class="scroll">Cargando…</div></div>';
  try {
    const datos = await paginaApi('/notificaciones', pagina);
    $('#tabla').innerHTML = !datos.data.length ? '<p class="vacio">Aún no hay avisos entregados.</p>' : `<table>
      <tr><th>Evento</th><th>Tipo</th><th>Referencia</th><th>Fecha</th></tr>
      ${datos.data.map(n => {
        const [titulo, tag] = etiquetas[n.tipo] || [n.tipo, 'ACTIVO'];
        return `<tr><td><strong>${esc(titulo)}</strong></td><td><span class="tag ${esc(tag)}">${esc(n.tipo)}</span></td><td>Recurso #${esc(n.resource_id)}</td><td>${n.created_at ? esc(new Date(n.created_at).toLocaleString('es-CO')) : ''}</td></tr>`;
      }).join('')}</table>`;
    paginador(datos,vistaNotificaciones);
  } catch(e) { if ($('#tabla')) $('#tabla').textContent=e.message; }
}

async function vistaOperacion() {
  $('#vista').innerHTML='<div id="tabla">Cargando…</div>';
  try {
    const [m,a] = await Promise.all([api('GET','/metricas'), api('GET','/auditoria?limit=20')]);
    const rutas = m.porRuta || [];
    $('#tabla').innerHTML=`
      <div class="resumen" style="margin-bottom:20px">
        <div class="card" style="margin-bottom:0;border-left:4px solid var(--rojo-ut)"><span class="nota">Solicitudes hoy</span><h2 style="font-size:28px;margin:6px 0 0">${esc(m.solicitudes)}</h2></div>
        <div class="card" style="margin-bottom:0;border-left:4px solid ${m.errores5xx > 0 ? '#b91c1c' : '#1f7a4c'}"><span class="nota">Errores 5xx</span><h2 style="font-size:28px;margin:6px 0 0">${esc(m.errores5xx)}</h2></div>
        <div class="card" style="margin-bottom:0;border-left:4px solid var(--rojo-ut)"><span class="nota">Latencia promedio</span><h2 style="font-size:28px;margin:6px 0 0">${esc(m.duracionPromedioMs)} ms</h2></div>
        <div class="card" style="margin-bottom:0;border-left:4px solid var(--rojo-ut)"><span class="nota">Latencia máxima</span><h2 style="font-size:28px;margin:6px 0 0">${esc(m.duracionMaximaMs ?? 0)} ms</h2></div>
      </div>
      <div class="card">
        <h2>Métricas de rendimiento por endpoint</h2>
        <p class="nota" style="margin-bottom:16px">${esc(m.nota)}</p>
        <div class="scroll">
          ${!rutas.length ? '<p class="vacio">Sin métricas registradas hoy.</p>' : `<table><tr><th>Método</th><th>Ruta</th><th>Código HTTP</th><th>Solicitudes</th><th>Promedio (ms)</th><th>Máximo (ms)</th></tr>
          ${rutas.map(r => `<tr><td><span class="tag ACTIVO">${esc(r.method)}</span></td><td><code>${esc(r.route)}</code></td><td><span class="tag ${r.status >= 400 ? 'RECHAZADO' : 'APROBADO'}">${esc(r.status)}</span></td><td>${esc(r.requests)}</td><td>${esc(r.requests ? Math.round((r.total_ms / r.requests) * 100) / 100 : 0)} ms</td><td>${esc(r.max_ms)} ms</td></tr>`).join('')}</table>`}
        </div>
      </div>
      <div class="card">
        <h2>Registro de auditoría</h2>
        <p class="nota" style="margin-bottom:16px">Se muestran los últimos 20 eventos académicos y financieros con su identificador de correlación.</p>
        <div class="scroll">
          <table><tr><th>Fecha</th><th>Actor</th><th>Acción</th><th>Recurso</th><th>Correlación</th></tr>${a.data.map(e => `<tr><td>${esc(e.created_at)}</td><td>${esc(e.actor_id ? 'Usuario #' + e.actor_id : 'Sistema')}</td><td><span class="tag ACTIVA">${esc(e.action)}</span></td><td>${esc(e.resource)} #${esc(e.resource_id)}</td><td><small>${esc(e.correlation_id || '')}</small></td></tr>`).join('')}</table>
        </div>
      </div>`;
  } catch(e) { if ($('#tabla')) $('#tabla').textContent=e.message; }
}

function aceptarSesion(d) {
  sesion={token:d.accessToken,rol:d.rol,nombre:d.nombre,estudianteId:d.estudianteId,docenteId:d.docenteId};
  guardar(); tab=sesion.rol === 'ADMIN' ? 'estudiantes' : 'cursos'; pintar();
}

async function iniciarIdentidad() {
  try {
    const b64 = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    const nuevoFlujo = async () => {
      const verifier = b64(crypto.getRandomValues(new Uint8Array(32)));
      const challenge = b64(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))));
      const d = await api('POST','/auth/oidc/inicio',{codeChallenge:challenge});
      const f = {state:d.state,verifier,created:Date.now(),simulado:d.simulado,authorizationUrl:d.authorizationUrl};
      sessionStorage.setItem('oidc',JSON.stringify(f));
      return f;
    };
    let flow = await nuevoFlujo();
    if (flow.simulado) {
      modal('Identidad simulada · desarrollo', [
        {id:'email',label:'Cuenta local usada para simular al proveedor',tipo:'email',valor:$('#email')?.value},
        {id:'password',label:'Contraseña de la cuenta local',tipo:'password'}
      ], 'Autenticar simulación', async v => {
        if (!flow || Date.now() - flow.created > 240000) flow = await nuevoFlujo();
        let result;
        try {
          result = await api('POST','/auth/oidc/simulada',{...v,state:flow.state});
        } catch (err) {
          if (/vencido|inválido|código/i.test(err.message)) {
            flow = await nuevoFlujo();
            result = await api('POST','/auth/oidc/simulada',{...v,state:flow.state});
          } else {
            throw err;
          }
        }
        await completarIdentidad(result.code,flow);
      });
    } else if (flow.authorizationUrl && new URL(flow.authorizationUrl).protocol === 'https:') location.assign(flow.authorizationUrl);
    else throw new Error('El proveedor institucional no está configurado.');
  } catch(e) { aviso(e.message,false); }
}

async function completarIdentidad(code,flow) {
  if (!flow || Date.now()-flow.created>1800000) throw new Error('El inicio institucional venció. Vuelve a intentarlo.');
  try { aceptarSesion(await api('POST','/auth/oidc/intercambio',{code,state:flow.state,codeVerifier:flow.verifier})); }
  finally { sessionStorage.removeItem('oidc'); }
}

async function inicio() {
  sessionStorage.removeItem('sesion');
  try { configuracion=await api('GET','/configuracion'); } catch(e) { aviso('No se pudo consultar la configuración del servidor.',false); }
  pintar();
  const url=new URL(location.href);
  if (url.searchParams.has('mp_return')) {
    // Return parameters are display hints only, never a confirmation of payment.
    ['mp_return','payment_id','collection_id','collection_status','status','external_reference','preference_id','merchant_order_id','processing_mode','merchant_account_id','site_id'].forEach(k => url.searchParams.delete(k));
    history.replaceState(null,'',url.pathname+url.search+url.hash);
    aviso('Regresaste de Mercado Pago. Inicia sesión y abre Pagos → Consultar estado para verificar el resultado.');
  }
  if (url.searchParams.has('code') || url.searchParams.has('error')) {
    const code=url.searchParams.get('code'),state=url.searchParams.get('state'),error=url.searchParams.get('error');
    url.searchParams.delete('code'); url.searchParams.delete('state'); url.searchParams.delete('error');url.searchParams.delete('error_description');
    history.replaceState(null,'',url.pathname+url.search+url.hash);
    try {
      const flow=JSON.parse(sessionStorage.getItem('oidc'));
      if (error || !flow || flow.state!==state) throw new Error('El proveedor no completó el acceso o el estado no coincide.');
      await completarIdentidad(code,flow);
    } catch(e) { sessionStorage.removeItem('oidc');aviso(e.message,false); }
  }
}
inicio();

