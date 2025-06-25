let solicitudActual = null;
let modoEdicion = false;

document.addEventListener('DOMContentLoaded', function () {
  const numeroCaso = localStorage.getItem('detalleActual');
  const solicitudes = JSON.parse(localStorage.getItem('enProceso')) || [];
  solicitudActual = solicitudes.find(s => s.numeroCaso === numeroCaso);

  if (solicitudActual) {
    mostrarResumen(solicitudActual);
    mostrarInfoSolicitud(solicitudActual);
    
    // Configurar botones de etapas
    document.querySelectorAll('.stage-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        activarEtapa(this.dataset.stage);
      });
    });
    
    // Configurar botón de edición
    document.getElementById('btnEditar').addEventListener('click', habilitarEdicion);
  }
});

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
      <div class="col-md-6"><strong>Orden de Trabajo:</strong> ${solicitud.ordenTrabajo || 'N/A'}</div>
      <div class="col-md-6"><strong>Tipo de Equipo:</strong> ${solicitud.tipoEquipo}</div>
    </div>
    <div class="row mt-3">
      <div class="col-12"><strong>Descripción del Problema:</strong><br>${solicitud.descripcionProblema}</div>
    </div>
  `;
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
          <label class="form-label">Orden de Trabajo:</label>
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
}

function guardarEdicion() {
  // Recoger los valores editados
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
  let enProceso = JSON.parse(localStorage.getItem('enProceso')) || [];
  const index = enProceso.findIndex(s => s.numeroCaso === solicitudActual.numeroCaso);
  if (index !== -1) {
    enProceso[index] = solicitudActual;
    localStorage.setItem('enProceso', JSON.stringify(enProceso));
  }

  // Volver a modo visualización
  modoEdicion = false;
  mostrarInfoSolicitud(solicitudActual);
  mostrarResumen(solicitudActual);
}

function cancelarEdicion() {
  modoEdicion = false;
  mostrarInfoSolicitud(solicitudActual);
}

function activarEtapa(etapa) {
  // Actualizar estado si es necesario
  if (etapa === 'diagnostico' && solicitudActual.estado === 'Asignada') {
    solicitudActual.estado = 'En Diagnóstico';
    actualizarEstadoEnStorage();
  } else if (etapa === 'mantenimiento' && solicitudActual.estado === 'En Diagnóstico') {
    solicitudActual.estado = 'En Mantenimiento';
    actualizarEstadoEnStorage();
  } else if (etapa === 'informe' && solicitudActual.estado === 'En Mantenimiento') {
    solicitudActual.estado = 'En Informe';
    actualizarEstadoEnStorage();
  } else if (etapa === 'aprobacion' && solicitudActual.estado === 'En Informe') {
    solicitudActual.estado = 'En Aprobación';
    actualizarEstadoEnStorage();
  }
  
  // Actualizar botones
  document.querySelectorAll('.stage-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-secondary');
  });
  
  const btnEtapa = document.getElementById(`btn${etapa.charAt(0).toUpperCase() + etapa.slice(1)}`);
  if (btnEtapa) {
    btnEtapa.classList.add('active', 'btn-primary');
  }
  
  // Actualizar contenido
  document.querySelectorAll('.stage-content').forEach(section => {
    section.classList.remove('active');
  });
  
  document.getElementById(etapa).classList.add('active');
  
  // Actualizar resumen
  mostrarResumen(solicitudActual);
}

function actualizarEstadoEnStorage() {
  let enProceso = JSON.parse(localStorage.getItem('enProceso')) || [];
  const index = enProceso.findIndex(s => s.numeroCaso === solicitudActual.numeroCaso);
  if (index !== -1) {
    enProceso[index] = solicitudActual;
    localStorage.setItem('enProceso', JSON.stringify(enProceso));
  }
}

function finalizarProceso() {
  const resultado = document.getElementById('resultadoAprobacion').value;
  
  if (!resultado) {
    alert('Por favor seleccione un resultado final');
    return;
  }
  
  solicitudActual.estado = 'Finalizado';
  solicitudActual.resultadoFinal = resultado;
  solicitudActual.comentarios = document.getElementById('comentariosAprobacion').value;
  
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