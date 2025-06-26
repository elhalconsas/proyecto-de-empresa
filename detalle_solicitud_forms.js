let solicitudActual = null;
let modoEdicion = false;
let diagnosticoEntries = [];
let mantenimientoEntries = [];
let etapaActual = 'informacion';
function validarNumerico(valor) {
  return /^\d+$/.test(valor);
}

function validarCorreo(correo) {
  return /@unal\.edu\.co$/.test(correo);
}

document.addEventListener('DOMContentLoaded', function () {
  const numeroCaso = localStorage.getItem('detalleActual');
  const solicitudes = JSON.parse(localStorage.getItem('enProceso')) || [];
  solicitudActual = solicitudes.find(s => s.numeroCaso === numeroCaso);

  if (solicitudActual) {
    // Restaurar estado de la solicitud
    if (solicitudActual.etapaActual) {
      etapaActual = solicitudActual.etapaActual;
    }
    
    if (solicitudActual.diagnosticoEntries) {
      diagnosticoEntries = solicitudActual.diagnosticoEntries;
    }
    
    if (solicitudActual.mantenimientoEntries) {
      mantenimientoEntries = solicitudActual.mantenimientoEntries;
    }
    
    // Inicializar UI
    inicializarUI();
    
    // Configurar eventos
    configurarEventos();
  }
});

function inicializarUI() {
   if (!solicitudActual.estado) {
    solicitudActual.estado = 'Asignada';
  }
  mostrarResumen(solicitudActual);
  mostrarInfoSolicitud(solicitudActual);
  mostrarDiagnosticoEntries();
  mostrarMantenimientoEntries();
  
  // Mostrar la etapa actual
  mostrarEtapa(etapaActual);
  
  // Actualizar indicadores de etapas
  actualizarIndicadoresEtapas();
}

function configurarEventos() {
  // Botones de navegación
  document.getElementById('btnContinuarDiagnostico').addEventListener('click', () => mostrarEtapa('diagnostico'));
  document.getElementById('btnVolverInformacion').addEventListener('click', () => mostrarEtapa('informacion'));
  document.getElementById('btnContinuarMantenimiento').addEventListener('click', () => mostrarEtapa('mantenimiento'));
  document.getElementById('btnVolverDiagnostico').addEventListener('click', () => mostrarEtapa('diagnostico'));
  document.getElementById('btnContinuarInforme').addEventListener('click', () => mostrarEtapa('informe'));
  document.getElementById('btnVolverMantenimiento').addEventListener('click', () => mostrarEtapa('mantenimiento'));
  document.getElementById('btnFinalizarProceso').addEventListener('click', finalizarProceso);
  
  // Botones de acciones
  document.getElementById('btnEditar').addEventListener('click', habilitarEdicion);
  document.getElementById('btnSaltarMantenimiento').addEventListener('click', saltarAMantenimiento);
  
  // Configurar formularios
  document.getElementById('formDiagnostico').addEventListener('submit', guardarDiagnostico);
  document.getElementById('formMantenimiento').addEventListener('submit', guardarMantenimiento);
  
  // Configurar previsualización de imágenes
  document.getElementById('imagenesDiagnostico').addEventListener('change', function(e) {
    previewImages(e.target.files, 'previewDiagnostico');
  });
  
  document.getElementById('imagenesMantenimiento').addEventListener('change', function(e) {
    previewImages(e.target.files, 'previewMantenimiento');
  });
  
  // Botones de etapas
  document.getElementById('btnEtapaInformacion').addEventListener('click', () => mostrarEtapa('informacion'));
  document.getElementById('btnEtapaDiagnostico').addEventListener('click', () => mostrarEtapa('diagnostico'));
  document.getElementById('btnEtapaMantenimiento').addEventListener('click', () => mostrarEtapa('mantenimiento'));
  document.getElementById('btnEtapaInforme').addEventListener('click', () => mostrarEtapa('informe'));
}

function mostrarResumen(solicitud) {
  const resumen = document.getElementById('tablaDetalleResumen');
  resumen.innerHTML = '';

  const fila = resumen.insertRow();
  fila.insertCell(0).textContent = solicitud.numeroCaso;
  fila.insertCell(1).textContent = solicitud.tecnicoAsignado || 'No asignado';
  
  // Celda de estado con badge
  const estadoCell = fila.insertCell(2);
  const badge = document.createElement('span');
  badge.className = 'badge bg-warning text-dark';
  badge.textContent = solicitud.estado;
  estadoCell.appendChild(badge);
  
  fila.insertCell(3).textContent = solicitud.fechaInicio;

  // Calcular tiempo transcurrido en días y horas
  const fechaInicio = new Date(solicitud.fechaInicio);
  const hoy = new Date();
  const diffMs = hoy - fechaInicio;
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  const tiempoCell = fila.insertCell(4);
  tiempoCell.innerHTML = `
    <div>${diffDays} días</div>
    <div>${diffHours} horas</div>
  `;
}

function mostrarInfoSolicitud(solicitud) {
  const contenedor = document.getElementById('infoSolicitud');
  contenedor.innerHTML = `
    <div class="row">
      <div class="col-md-6"><strong>Número de Solicitud:</strong> ${solicitud.numeroSolicitud}</div>
      <div class="col-md-6"><strong>Fecha de Solicitud:</strong> ${solicitud.fechaSolicitud}</div>
    </div>
    <div class="row mt-2">
      <div class="col-md-6"><strong>Laboratorio:</strong> ${solicitud.nombreLaboratorio}</div>
      <div class="col-md-6"><strong>Bloque:</strong> ${solicitud.bloque}</div>
    </div>
    <div class="row mt-2">
      <div class="col-md-6"><strong>Facultad:</strong> ${solicitud.facultad}</div>
      <div class="col-md-6"><strong>Salón:</strong> ${solicitud.salon}</div>
    </div>
    <div class="row mt-2">
      <div class="col-md-6"><strong>Correo Electrónico:</strong> ${solicitud.correoElectronico}</div>
      <div class="col-md-6"><strong>Contacto:</strong> ${solicitud.numeroContacto}</div>
    </div>
    <div class="row mt-2">
      <div class="col-md-6"><strong>Número de Equipo:</strong> ${solicitud.numEquipo}</div>
      <div class="col-md-6"><strong>Placa del Equipo:</strong> ${solicitud.placaEquipo}</div>
    </div>
    <div class="row mt-2">
      <div class="col-md-6"><strong>Nombre del equipo:</strong> ${solicitud.ordenTrabajo || 'N/A'}</div>
      <div class="col-md-6"><strong>Tipo de Equipo:</strong> ${solicitud.tipoEquipo}</div>
    </div>
    <div class="row mt-3">
      <div class="col-12"><strong>Descripción del Problema:</strong><br>${solicitud.descripcionProblema}</div>
    </div>
  `;
}

function mostrarEtapa(etapa) {
  etapaActual = etapa;
  
  // Actualizar estado según la etapa
  switch(etapa) {
    case 'diagnostico':
      solicitudActual.estado = 'En diagnostico';
      break;
    case 'mantenimiento':
      solicitudActual.estado = 'En mantenimiento';
      break;
    case 'informe':
      solicitudActual.estado = 'En informe';
      break;
  }
  
  
  // Ocultar todas las secciones
  document.getElementById('informacionSection').classList.add('collapse');
  document.getElementById('diagnosticoSection').classList.add('collapse');
  document.getElementById('mantenimientoSection').classList.add('collapse');
  document.getElementById('informeSection').classList.add('collapse');
  
  // Mostrar la sección activa
  document.getElementById(`${etapa}Section`).classList.remove('collapse');
  
  // Si es la etapa de informe, generar el resumen
  if (etapa === 'informe') {
    generarResumenInforme();
  }
  
  // Actualizar estado en solicitud
  solicitudActual.etapaActual = etapaActual;
  actualizarEnStorage();
  
  // Actualizar el resumen con el nuevo estado
  mostrarResumen(solicitudActual);
  
  // Actualizar indicadores
  actualizarIndicadoresEtapas();
}

function actualizarIndicadoresEtapas() {
  // Actualizar estado de los botones de etapas
  const etapas = ['informacion', 'diagnostico', 'mantenimiento', 'informe'];
  
  etapas.forEach((etapa, index) => {
    const btn = document.getElementById(`btnEtapa${etapa.charAt(0).toUpperCase() + etapa.slice(1)}`);
    btn.classList.remove('etapa-activa', 'etapa-completa');
    
    if (etapa === etapaActual) {
      btn.classList.add('etapa-activa');
    }
    
    if (index < etapas.indexOf(etapaActual)) {
      btn.classList.add('etapa-completa');
    }
  });
}

function habilitarEdicion() {
  modoEdicion = true;
  const contenedor = document.getElementById('infoSolicitud');
  contenedor.innerHTML = `
    <form id="formEdicion">
      <div class="row">
        <div class="col-md-6"><strong>Número de Solicitud:</strong> ${solicitudActual.numeroSolicitud}</div>
        <div class="col-md-6"><strong>Fecha de Solicitud:</strong> ${solicitudActual.fechaSolicitud}</div>
      </div>
      <div class="row mt-2">
        <div class="col-md-6">
          <label class="form-label">Laboratorio:</label>
          <input type="text" class="form-control" value="${solicitudActual.nombreLaboratorio}" id="editLaboratorio">
        </div>
        <div class="col-md-6">
          <label class="form-label">Bloque:</label>
          <input type="text" class="form-control" value="${solicitudActual.bloque}" id="editBloque">
        </div>
      </div>
      <div class="row mt-2">
        <div class="col-md-6">
          <label class="form-label">Facultad:</label>
          <select class="form-select" id="editFacultad">
            <option value="Ciencias" ${solicitudActual.facultad === 'Ciencias' ? 'selected' : ''}>Ciencias</option>
            <option value="Ciencias Agrarias" ${solicitudActual.facultad === 'Ciencias Agrarias' ? 'selected' : ''}>Ciencias Agrarias</option>
            <option value="Minas" ${solicitudActual.facultad === 'Minas' ? 'selected' : ''}>Minas</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Salón:</label>
          <input type="text" class="form-control" value="${solicitudActual.salon}" id="editSalon">
        </div>
      </div>
      <div class="row mt-2">
        <div class="col-md-6">
          <label class="form-label">Correo Electrónico:</label>
          <input type="email" class="form-control" value="${solicitudActual.correoElectronico}" id="editCorreo">
        </div>
        <div class="col-md-6">
          <label class="form-label">Contacto:</label>
          <input type="text" class="form-control" value="${solicitudActual.numeroContacto}" id="editContacto">
        </div>
      </div>
      <div class="row mt-2">
        <div class="col-md-6">
          <label class="form-label">Número de Equipo:</label>
          <input type="text" class="form-control" value="${solicitudActual.numEquipo}" id="editNumEquipo">
        </div>
        <div class="col-md-6">
          <label class="form-label">Placa del Equipo:</label>
          <input type="text" class="form-control" value="${solicitudActual.placaEquipo}" id="editPlaca">
        </div>
      </div>
      <div class="row mt-2">
        <div class="col-md-6">
          <label class="form-label">Nombre del equipo:</label>
          <input type="text" class="form-control" value="${solicitudActual.ordenTrabajo || ''}" id="editOrden">
        </div>
        <div class="col-md-6">
          <label class="form-label">Tipo de Equipo:</label>
          <select class="form-select" id="editTipoEquipo">
            <option value="medicion_control" ${solicitudActual.tipoEquipo === 'medicion_control' ? 'selected' : ''}>Equipos de Medición y Control</option>
            <option value="opticos" ${solicitudActual.tipoEquipo === 'opticos' ? 'selected' : ''}>Instrumentos Ópticos</option>
            <option value="electricos" ${solicitudActual.tipoEquipo === 'electricos' ? 'selected' : ''}>Equipos Eléctricos</option>
            <option value="calentamiento" ${solicitudActual.tipoEquipo === 'calentamiento' ? 'selected' : ''}>Equipos de Calentamiento</option>
            <option value="herramientas" ${solicitudActual.tipoEquipo === 'herramientas' ? 'selected' : ''}>Herramientas</option>
            <option value="tecnologia_computacion" ${solicitudActual.tipoEquipo === 'tecnologia_computacion' ? 'selected' : ''}>Tecnología y Computación</option>
            <option value="refrigeracion" ${solicitudActual.tipoEquipo === 'refrigeracion' ? 'selected' : ''}>Equipos de Refrigeración</option>
            <option value="mecanicos" ${solicitudActual.tipoEquipo === 'mecanicos' ? 'selected' : ''}>Equipos Mecánicos</option>
            <option value="accesorios_laboratorio" ${solicitudActual.tipoEquipo === 'accesorios_laboratorio' ? 'selected' : ''}>Accesorios de Laboratorio</option>
            <option value="componentes_electronicos" ${solicitudActual.tipoEquipo === 'componentes_electronicos' ? 'selected' : ''}>Componentes Electrónicos</option>
            <option value="limpieza" ${solicitudActual.tipoEquipo === 'limpieza' ? 'selected' : ''}>Equipos de Limpieza</option>
            <option value="equipos_laboratorio" ${solicitudActual.tipoEquipo === 'equipos_laboratorio' ? 'selected' : ''}>Equipos de Laboratorio</option>
            <option value="otros" ${solicitudActual.tipoEquipo === 'otros' ? 'selected' : ''}>Otros</option>
          </select>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-12">
          <label class="form-label">Descripción del Problema:</label>
          <textarea class="form-control" rows="4" id="editDescripcion">${solicitudActual.descripcionProblema}</textarea>
        </div>
      </div>
      <div class="d-flex justify-content-end mt-3 gap-2">
        <button type="button" class="btn btn-secondary" id="btnCancelarEdicion">Cancelar</button>
        <button type="button" class="btn btn-success" id="btnGuardarEdicion">Guardar</button>
      </div>
    </form>
  `;
  
  document.getElementById('btnCancelarEdicion').addEventListener('click', cancelarEdicion);
  document.getElementById('btnGuardarEdicion').addEventListener('click', guardarEdicion);
   document.getElementById('editNumEquipo').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '');
  });
  
  document.getElementById('editPlaca').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '');
  });
  
  document.getElementById('editContacto').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '');
  });
  
  document.getElementById('editCorreo').addEventListener('change', function(e) {
    if (!this.value.endsWith('@unal.edu.co')) {
      alert('Por favor ingrese un correo institucional (@unal.edu.co)');
      this.focus();
    }
  });
}

function guardarEdicion() {
  const correo = document.getElementById('editCorreo').value;
  const numEquipo = document.getElementById('editNumEquipo').value;
  const placaEquipo = document.getElementById('editPlaca').value;
  const contacto = document.getElementById('editContacto').value;
  
  if (!validarCorreo(correo)) {
    alert('El correo debe ser institucional (@unal.edu.co)');
    return;
  }
  
  if (!validarNumerico(numEquipo)) {
    alert('Número de equipo debe ser numérico');
    return;
  }
  
  if (!validarNumerico(placaEquipo)) {
    alert('Placa del equipo debe ser numérica');
    return;
  }
  
  if (!validarNumerico(contacto)) {
    alert('Número de contacto debe ser numérico');
    return;
  }
  
  if (!confirm('¿Estás seguro de guardar los cambios?')) {
    return;
  }
  solicitudActual.nombreLaboratorio = document.getElementById('editLaboratorio').value;
  solicitudActual.bloque = document.getElementById('editBloque').value;
  solicitudActual.facultad = document.getElementById('editFacultad').value;
  solicitudActual.salon = document.getElementById('editSalon').value;
  solicitudActual.correoElectronico = document.getElementById('editCorreo').value;
  solicitudActual.numeroContacto = document.getElementById('editContacto').value;
  solicitudActual.numEquipo = document.getElementById('editNumEquipo').value;
  solicitudActual.placaEquipo = document.getElementById('editPlaca').value;
  solicitudActual.ordenTrabajo = document.getElementById('editOrden').value;
  solicitudActual.tipoEquipo = document.getElementById('editTipoEquipo').value;
  solicitudActual.descripcionProblema = document.getElementById('editDescripcion').value;

  // Actualizar localStorage
  actualizarEnStorage();

  // Volver a modo visualización
  modoEdicion = false;
  mostrarInfoSolicitud(solicitudActual);
  mostrarResumen(solicitudActual);
}

function cancelarEdicion() {
  modoEdicion = false;
  mostrarInfoSolicitud(solicitudActual);
}

function previewImages(files, previewId) {
  const preview = document.getElementById(previewId);
  preview.innerHTML = '';
  
  for (const file of files) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.classList.add('image-preview');
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
}

function guardarDiagnostico(e) {
  e.preventDefault();
  
  const titulo = document.getElementById('tituloDiagnostico').value;
  const comentario = document.getElementById('comentarioDiagnostico').value;
  
  // Obtener imágenes (simulado, en realidad deberías subirlas a un servidor)
  const imagenes = [];
  const files = document.getElementById('imagenesDiagnostico').files;
  for (let i = 0; i < files.length; i++) {
    imagenes.push({
      name: files[i].name,
      // En una implementación real, aquí subirías el archivo y guardarías la URL
      url: URL.createObjectURL(files[i])
    });
  }
  
  // Crear entrada
  const entrada = {
    fecha: new Date().toLocaleDateString(),
    titulo,
    comentario,
    imagenes
  };
  
  diagnosticoEntries.push(entrada);
  mostrarDiagnosticoEntries();
  
  // Limpiar formulario
  document.getElementById('formDiagnostico').reset();
  document.getElementById('previewDiagnostico').innerHTML = '';
  
  // Actualizar en solicitud actual y almacenamiento
  solicitudActual.diagnosticoEntries = diagnosticoEntries;
  actualizarEnStorage();
}

function mostrarDiagnosticoEntries() {
  const container = document.getElementById('diagnosticoEntries');
  container.innerHTML = '';
  
  diagnosticoEntries.forEach(entry => {
    const entryEl = document.createElement('div');
    entryEl.classList.add('entry-item');
    entryEl.innerHTML = `
      <h5>${entry.titulo} <small>(${entry.fecha})</small></h5>
      <p>${entry.comentario}</p>
      <div class="d-flex flex-wrap">
        ${entry.imagenes.map(img => `<img src="${img.url}" class="image-preview">`).join('')}
      </div>
    `;
    container.appendChild(entryEl);
  });
}

function guardarMantenimiento(e) {
  e.preventDefault();
  
  const titulo = document.getElementById('tituloMantenimiento').value;
  const actividades = document.getElementById('actividadesMantenimiento').value;
  const partes = document.getElementById('partesMantenimiento').value;
  
  const imagenes = [];
  const files = document.getElementById('imagenesMantenimiento').files;
  for (let i = 0; i < files.length; i++) {
    imagenes.push({
      name: files[i].name,
      url: URL.createObjectURL(files[i])
    });
  }
  
  const entrada = {
    fecha: new Date().toLocaleDateString(),
    titulo,
    actividades,
    partes: partes || 'N/A',
    imagenes
  };
  
  mantenimientoEntries.push(entrada);
  mostrarMantenimientoEntries();
  
  document.getElementById('formMantenimiento').reset();
  document.getElementById('previewMantenimiento').innerHTML = '';
  
  solicitudActual.mantenimientoEntries = mantenimientoEntries;
  actualizarEnStorage();
}

function mostrarMantenimientoEntries() {
  const container = document.getElementById('mantenimientoEntries');
  container.innerHTML = '';
  
  mantenimientoEntries.forEach(entry => {
    const entryEl = document.createElement('div');
    entryEl.classList.add('entry-item');
    entryEl.innerHTML = `
      <h5>${entry.titulo} <small>(${entry.fecha})</small></h5>
      <p><strong>Actividades:</strong> ${entry.actividades}</p>
      <p><strong>Partes reemplazadas:</strong> ${entry.partes}</p>
      <div class="d-flex flex-wrap">
        ${entry.imagenes.map(img => `<img src="${img.url}" class="image-preview">`).join('')}
      </div>
    `;
    container.appendChild(entryEl);
  });
}

function saltarAMantenimiento() {
  // Marcar que no se realizó mantenimiento
  solicitudActual.mantenimientoPosible = false;
  actualizarEnStorage();
  
  // Saltar a informe
  mostrarEtapa('informe');
}

function actualizarEnStorage() {
  // Actualizar propiedades adicionales
  solicitudActual.diagnosticoEntries = diagnosticoEntries;
  solicitudActual.mantenimientoEntries = mantenimientoEntries;
  
  // Actualizar localStorage
  let enProceso = JSON.parse(localStorage.getItem('enProceso')) || [];
  const index = enProceso.findIndex(s => s.numeroCaso === solicitudActual.numeroCaso);
  if (index !== -1) {
    enProceso[index] = solicitudActual;
    localStorage.setItem('enProceso', JSON.stringify(enProceso));
  }
}

function generarResumenInforme() {
  const resumen = document.getElementById('resumenInforme');
  
  let html = `
    <div class="card mb-4">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">Proceso Gestión de Laboratorios</h5>
        <h6 class="mb-0">Reporte Diagnóstico y Mantenimiento Interno</h6>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <table class="table table-bordered">
              <tr>
                <th>Fecha aprobación de la solicitud</th>
                <td>${new Date().toLocaleDateString()}</td>
              </tr>
              <tr>
                <th>No. Solicitud</th>
                <td>${solicitudActual.numeroSolicitud}</td>
              </tr>
              <tr>
                <th>Solicitante</th>
                <td>[Nombre del solicitante]</td>
              </tr>
              <tr>
                <th>Laboratorio</th>
                <td>${solicitudActual.nombreLaboratorio}</td>
              </tr>
              <tr>
                <th>Facultad</th>
                <td>${solicitudActual.facultad}</td>
              </tr>
              <tr>
                <th>Ubicación del equipo</th>
                <td>Bloque ${solicitudActual.bloque}, Salón ${solicitudActual.salon}</td>
              </tr>
              <tr>
                <th>Código de laboratorio</th>
                <td>[Código]</td>
              </tr>
              <tr>
                <th>Coordinador</th>
                <td>[Nombre del coordinador]</td>
              </tr>
            </table>
          </div>
          
          <div class="col-md-6">
            <table class="table table-bordered">
              <tr>
                <th>Equipo</th>
                <td>${solicitudActual.tipoEquipo}</td>
              </tr>
              <tr>
                <th>Identificación del equipo (Placa UNAL)</th>
                <td>${solicitudActual.placaEquipo}</td>
              </tr>
              <tr>
                <th>Marca</th>
                <td>[Marca]</td>
              </tr>
              <tr>
                <th>Modelo</th>
                <td>[Modelo]</td>
              </tr>
              <tr>
                <th>Número de serie</th>
                <td>[Número de serie]</td>
              </tr>
              <tr>
                <th>Fecha de diagnóstico</th>
                <td>${diagnosticoEntries.length > 0 ? diagnosticoEntries[0].fecha : ''}</td>
              </tr>
              <tr>
                <th>Responsable de diagnóstico</th>
                <td>${solicitudActual.tecnicoAsignado}</td>
              </tr>
              <tr>
                <th>Persona que atiende la visita</th>
                <td>[Nombre]</td>
              </tr>
              <tr>
                <th>Cargo/rol</th>
                <td>[Cargo]</td>
              </tr>
              <tr>
                <th>Contacto</th>
                <td>[Contacto]</td>
              </tr>
            </table>
          </div>
        </div>
        
        <h5 class="mt-4">Diagnóstico</h5>
        <div class="mb-4">
          ${diagnosticoEntries.map(entry => `
            <div class="mb-3">
              <p><strong>${entry.fecha} - ${entry.titulo}:</strong></p>
              <p>${entry.comentario}</p>
              ${entry.imagenes.length > 0 ? `
                <div class="d-flex flex-wrap">
                  ${entry.imagenes.map(img => `<img src="${img.url}" class="image-preview">`).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        
        <h5 class="mt-4">Mantenimiento</h5>
        ${mantenimientoEntries.length > 0 ? `
          <div class="mb-4">
            ${mantenimientoEntries.map(entry => `
              <div class="mb-3">
                <p><strong>${entry.fecha} - ${entry.titulo}:</strong></p>
                <p>${entry.actividades}</p>
                <p><strong>Partes reemplazadas:</strong> ${entry.partes}</p>
                ${entry.imagenes.length > 0 ? `
                  <div class="d-flex flex-wrap">
                    ${entry.imagenes.map(img => `<img src="${img.url}" class="image-preview">`).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : '<p>No se realizó mantenimiento</p>'}
      </div>
    </div>
  `;
  
  resumen.innerHTML = html;
}

function finalizarProceso() {
  if (!confirm('¿Estás seguro de finalizar el proceso? Esta acción no se puede deshacer.')) {
    return;
  }
  solicitudActual.estado = 'Finalizado';
  
  // Mover a finalizadas
  let enProceso = JSON.parse(localStorage.getItem('enProceso')) || [];
  enProceso = enProceso.filter(s => s.numeroCaso !== solicitudActual.numeroCaso);
  localStorage.setItem('enProceso', JSON.stringify(enProceso));
  
  let finalizadas = JSON.parse(localStorage.getItem('finalizadas')) || [];
  finalizadas.push(solicitudActual);
  localStorage.setItem('finalizadas', JSON.stringify(finalizadas));
  
  alert('Proceso finalizado. La solicitud ha sido movida a "Solicitudes Finalizadas".');
  window.location.href = 'solicitudes_proceso.html';
}