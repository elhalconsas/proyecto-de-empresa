// Mostrar entradas de diagnóstico
function mostrarDiagnosticos() {
  const cont = document.getElementById('diagnosticoEntries');
  if (!cont) return;
  cont.innerHTML = '';
  if (!solicitudActual.diagnosticos || solicitudActual.diagnosticos.length === 0) {
    cont.innerHTML = '<div class="text-muted">No hay diagnósticos registrados.</div>';
    return;
  }
  solicitudActual.diagnosticos.forEach((d, i) => {
    const div = document.createElement('div');
    div.className = 'entry-item';
    div.innerHTML = `<strong>${d.titulo}</strong> <span class='text-secondary' style='font-size:0.9em'>(${new Date(d.fecha).toLocaleString()})</span><br>${d.comentario}<br>` +
      (d.imagenes && d.imagenes.length > 0 ? `<div>Imágenes: ${d.imagenes.map(img => `<span class='badge bg-info text-dark me-1'>${img}</span>`).join('')}</div>` : '');
    cont.appendChild(div);
  });
}

// Mostrar entradas de mantenimiento
function mostrarMantenimientos() {
  const cont = document.getElementById('mantenimientoEntries');
  if (!cont) return;
  cont.innerHTML = '';
  if (!solicitudActual.mantenimientos || solicitudActual.mantenimientos.length === 0) {
    cont.innerHTML = '<div class="text-muted">No hay mantenimientos registrados.</div>';
    return;
  }
  solicitudActual.mantenimientos.forEach((m, i) => {
    const div = document.createElement('div');
    div.className = 'entry-item';
    div.innerHTML = `<label>Título de la solicitud:</label><strong>${m.titulo}</strong> <span class='text-secondary' style='font-size:0.9em'>(${new Date(m.fecha).toLocaleString()})</span><br>` +
      `<b>Actividades realizadas:</b> ${m.actividades}<br>` +
      (m.partes ? `<b>Partes reemplazadas:</b> ${m.partes}<br>` : '') +
      (m.imagenes && m.imagenes.length > 0 ? `<div>Imágenes: ${m.imagenes.map(img => `<span class='badge bg-info text-dark me-1'>${img}</span>`).join('')}</div>` : '');
    cont.appendChild(div);
  });
}
// Guardar datos de diagnóstico en localStorage y mostrar
function guardarDiagnostico(e) {
  e.preventDefault();
  const titulo = document.getElementById('tituloDiagnostico').value;
  const comentario = document.getElementById('comentarioDiagnostico').value;
  // Imágenes (solo nombres, para ejemplo)
  const imagenesInput = document.getElementById('imagenesDiagnostico');
  const imagenes = [];
  if (imagenesInput && imagenesInput.files) {
    for (let i = 0; i < imagenesInput.files.length; i++) {
      imagenes.push(imagenesInput.files[i].name);
    }
  }
  if (!solicitudActual.diagnosticos) solicitudActual.diagnosticos = [];
  solicitudActual.diagnosticos.push({ titulo, comentario, imagenes, fecha: new Date().toISOString() });
  // Guardar en localStorage
  let enProceso = JSON.parse(localStorage.getItem('enProceso')) || [];
  const index = enProceso.findIndex(s => s.numeroCaso === solicitudActual.numeroCaso);
  if (index !== -1) {
    enProceso[index] = solicitudActual;
    localStorage.setItem('enProceso', JSON.stringify(enProceso));
  }
  alert('Diagnóstico guardado correctamente.');
  document.getElementById('formDiagnostico').reset();
  mostrarDiagnosticos();
}

// Guardar datos de mantenimiento en localStorage y mostrar
function guardarMantenimiento(e) {
  e.preventDefault();
  const titulo = document.getElementById('tituloMantenimiento').value;
  const actividades = document.getElementById('actividadesMantenimiento').value;
  const partes = document.getElementById('partesMantenimiento').value;
  // Imágenes (solo nombres, para ejemplo)
  const imagenesInput = document.getElementById('imagenesMantenimiento');
  const imagenes = [];
  if (imagenesInput && imagenesInput.files) {
    for (let i = 0; i < imagenesInput.files.length; i++) {
      imagenes.push(imagenesInput.files[i].name);
    }
  }
  if (!solicitudActual.mantenimientos) solicitudActual.mantenimientos = [];
  solicitudActual.mantenimientos.push({ titulo, actividades, partes, imagenes, fecha: new Date().toISOString() });
  // Guardar en localStorage
  let enProceso = JSON.parse(localStorage.getItem('enProceso')) || [];
  const index = enProceso.findIndex(s => s.numeroCaso === solicitudActual.numeroCaso);
  if (index !== -1) {
    enProceso[index] = solicitudActual;
    localStorage.setItem('enProceso', JSON.stringify(enProceso));
  }
  alert('Mantenimiento guardado correctamente.');
  document.getElementById('formMantenimiento').reset();
  mostrarMantenimientos();
}
// Mostrar/ocultar secciones al avanzar de etapa
document.addEventListener('DOMContentLoaded', function() {
  // Unificar listeners de botones de volver para evitar duplicados y asegurar compatibilidad
  const volverConfig = [
    {
      btn: 'btnVolverInformacion',
      ocultar: 'diagnosticoSection',
      mostrar: 'informacionSection'
    },
    {
      btn: 'btnVolverDiagnostico',
      ocultar: 'mantenimientoSection',
      mostrar: 'diagnosticoSection'
    },
    {
      btn: 'btnVolverMantenimiento',
      ocultar: 'informeSection',
      mostrar: 'mantenimientoSection'
    },
    {
      btn: 'btnVolverInforme',
      ocultar: 'infromeRevicion',
      mostrar: 'informeSection'
    }
  ];
  volverConfig.forEach(cfg => {
    const btn = document.getElementById(cfg.btn);
    if (btn) {
      btn.addEventListener('click', function() {
        const ocultar = document.getElementById(cfg.ocultar);
        if (ocultar) ocultar.classList.add('collapse');
        const mostrar = document.getElementById(cfg.mostrar);
        if (mostrar) mostrar.classList.remove('collapse');
      });
    }
  });
  // Guardar diagnóstico
  const formDiagnostico = document.getElementById('formDiagnostico');
  if (formDiagnostico) {
    formDiagnostico.addEventListener('submit', guardarDiagnostico);
  }

  // Guardar mantenimiento
  const formMantenimiento = document.getElementById('formMantenimiento');
  if (formMantenimiento) {
    formMantenimiento.addEventListener('submit', guardarMantenimiento);
  }
  // Botón para pasar de información a diagnóstico
  const btnContinuarDiagnostico = document.getElementById('btnContinuarDiagnostico');
  if (btnContinuarDiagnostico) {
    btnContinuarDiagnostico.addEventListener('click', function() {
      // Oculta la sección de información
      const infoSection = document.getElementById('informacionSection');
      if (infoSection) infoSection.classList.add('collapse');
      // Muestra la sección de diagnóstico
      const diagSection = document.getElementById('diagnosticoSection');
      if (diagSection) diagSection.classList.remove('collapse');
      // Actualiza estado
      actualizarEtapa('En diagnostico');
    });
  }

  // Botón para volver de diagnóstico a información
  const btnVolverInformacion = document.getElementById('btnVolverInformacion');
  if (btnVolverInformacion) {
    btnVolverInformacion.addEventListener('click', function() {
      // Oculta diagnóstico
      const diagSection = document.getElementById('diagnosticoSection');
      if (diagSection) diagSection.classList.add('collapse');
      // Muestra información
      const infoSection = document.getElementById('informacionSection');
      if (infoSection) infoSection.classList.remove('collapse');
    });
  }

  // Botón para pasar de diagnóstico a mantenimiento
  const btnContinuarMantenimiento = document.getElementById('btnContinuarMantenimiento');
  if (btnContinuarMantenimiento) {
    btnContinuarMantenimiento.addEventListener('click', function() {
      // Oculta la sección de diagnóstico
      const diagSection = document.getElementById('diagnosticoSection');
      if (diagSection) diagSection.classList.add('collapse');
      // Muestra la sección de mantenimiento
      const mantSection = document.getElementById('mantenimientoSection');
      if (mantSection) mantSection.classList.remove('collapse');
      // Actualiza estado
      actualizarEtapa('En mantenimiento');
    });
  }
  // Botón para pasar de mantenimiento a informe
  const btnContinuarInforme = document.getElementById('btnContinuarInforme');
  if (btnContinuarInforme) {
    btnContinuarInforme.addEventListener('click', function() {
      // Oculta la sección de mantenimiento
      const mantSection = document.getElementById('mantenimientoSection');
      if (mantSection) mantSection.classList.add('collapse');
      // Muestra la sección de informe
      const informeSection = document.getElementById('informeSection');
      if (informeSection) informeSection.classList.remove('collapse');
      // Actualiza estado
      actualizarEtapa('En informe');
    });
  }

  // Botón para pasar de informe a revisión
  const btnInformeRevision = document.getElementById('btnInformeRevision');
  if (btnInformeRevision) {
    btnInformeRevision.addEventListener('click', function() {
      // Oculta la sección de informe
      const informeSection = document.getElementById('informeSection');
      if (informeSection) informeSection.classList.add('collapse');
      // Muestra la sección de revisión
      const revSection = document.getElementById('infromeRevicion');
      if (revSection) revSection.classList.remove('collapse');
      // Actualiza estado
      actualizarEtapa('En aprobacion');
    });
  }

  // Botón para finalizar proceso
  const btnFinalizarProceso = document.getElementById('btnFinalizarProceso');
  if (btnFinalizarProceso) {
    btnFinalizarProceso.addEventListener('click', function() {
      actualizarEtapa('Finalizado');
      alert('¡Proceso finalizado!');
    });
  }

  // Botón para volver de mantenimiento a diagnóstico
  const btnVolverDiagnostico = document.getElementById('btnVolverDiagnostico');
  if (btnVolverDiagnostico) {
    btnVolverDiagnostico.addEventListener('click', function() {
      // Oculta mantenimiento
      const mantSection = document.getElementById('mantenimientoSection');
      if (mantSection) mantSection.classList.add('collapse');
      // Muestra diagnóstico
      const diagSection = document.getElementById('diagnosticoSection');
      if (diagSection) diagSection.classList.remove('collapse');
    });
  }
});
let solicitudActual = null;
let modoEdicion = false;
let etapaActual = 'informacion';

document.addEventListener('DOMContentLoaded', function () {
  const numeroCaso = localStorage.getItem('detalleActual');
  const solicitudes = JSON.parse(localStorage.getItem('enProceso')) || [];
  solicitudActual = solicitudes.find(s => s.numeroCaso === numeroCaso);

  if (solicitudActual) {
    inicializarUI();
    configurarEventos();
    mostrarDiagnosticos();
    mostrarMantenimientos();
  }
});
function actualizarEtapa(etapa) {
  solicitudActual.estado = etapa;
  // Actualizar en localStorage
  let enProceso = JSON.parse(localStorage.getItem('enProceso')) || [];
  const index = enProceso.findIndex(s => s.numeroCaso === solicitudActual.numeroCaso);
  if (index !== -1) {
    enProceso[index] = solicitudActual;
    localStorage.setItem('enProceso', JSON.stringify(enProceso));
  }
  mostrarResumen(solicitudActual);
}
 function inicializarUI() {
  if (!solicitudActual.estado) {
    solicitudActual.estado = 'Asignada';
  }
  mostrarResumen(solicitudActual);
  mostrarInfoSolicitud(solicitudActual);
}

function configurarEventos() {
  document.getElementById('btnContinuarDiagnostico').addEventListener('click', () => actualizarEtapa('diagnostico'));
  document.getElementById('btnEditar').addEventListener('click', habilitarEdicion);
  document.getElementById('btnVolverInformacion').addEventListener('click', volverAInformacion);
  document.getElementById('btnGuardarEdicion').addEventListener('click', guardarEdicion);

}

function mostrarResumen(solicitud) {
  const resumen = document.getElementById('tablaDetalleResumen');
  resumen.innerHTML = '';

  const fila = resumen.insertRow();
  fila.insertCell(0).textContent = solicitud.numeroCaso;
  fila.insertCell(1).textContent = solicitud.tecnicoAsignado || 'No asignado';
  
  const estadoCell = fila.insertCell(2);
  const badge = document.createElement('span');
  badge.className = `badge ${obtenerClaseEstado(solicitud.estado)}`;
  badge.textContent = solicitud.estado;
  estadoCell.appendChild(badge);
  
  fila.insertCell(3).textContent = solicitud.fechaInicio;

  const fechaInicio = new Date(solicitud.fechaInicio);
  const hoy = new Date();
  const diffMs = hoy - fechaInicio;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  const tiempoCell = fila.insertCell(4);
  tiempoCell.innerHTML = `<div>${diffDays} días</div><div>${diffHours} horas</div>`;

  // Desbloquear botones de etapas según el estado
  desbloquearEtapas(solicitud.estado);
}

function desbloquearEtapas(estado) {
  // Botones de etapas
  const btnEtapaInformacion = document.getElementById('btnEtapaInformacion');
  const btnEtapaDiagnostico = document.getElementById('btnEtapaDiagnostico');
  const btnEtapaMantenimiento = document.getElementById('btnEtapaMantenimiento');
  const btnEtapaInforme = document.getElementById('btnEtapaInforme');
  const btnEtapaRevision = document.getElementById('btnEtapaRevision');

  // Información de la Solicitud siempre habilitado
  if (btnEtapaInformacion) btnEtapaInformacion.disabled = false;
  if (btnEtapaDiagnostico) btnEtapaDiagnostico.disabled = true;
  if (btnEtapaMantenimiento) btnEtapaMantenimiento.disabled = true;
  if (btnEtapaInforme) btnEtapaInforme.disabled = true;
  if (btnEtapaRevision) btnEtapaRevision.disabled = true;

  // Activar según el estado actual
  if (estado === 'En diagnostico' || estado === 'En mantenimiento' || estado === 'En informe' || estado === 'En aprobacion' || estado === 'Finalizado') {
    if (btnEtapaDiagnostico) btnEtapaDiagnostico.disabled = false;
  }
  if (estado === 'En mantenimiento' || estado === 'En informe' || estado === 'En aprobacion' || estado === 'Finalizado') {
    if (btnEtapaMantenimiento) btnEtapaMantenimiento.disabled = false;
  }
  if (estado === 'En informe' || estado === 'En aprobacion' || estado === 'Finalizado') {
    if (btnEtapaInforme) btnEtapaInforme.disabled = false;
  }
  if (estado === 'En aprobacion' || estado === 'Finalizado') {
    if (btnEtapaRevision) btnEtapaRevision.disabled = false;
  }
}

function obtenerClaseEstado(estado) {
  switch (estado) {
    case 'Asignada': return 'bg-warning text-dark';
    case 'En diagnostico': return 'bg-primary';
    case 'En mantenimiento': return 'bg-primary';
    case 'En informe': return 'bg-info';
    case 'En aprobacion': return 'bg-danger';
    case 'Finalizado': return 'bg-success';
    default: return 'bg-secondary';
  }
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
          <input type="text" class="form-control" value="${solicitudActual.nombreLaboratorio}" id="editLaboratorio" required>
        </div>
        <div class="col-md-6">
          <label class="form-label">Bloque:</label>
          <input type="text" class="form-control" value="${solicitudActual.bloque}" id="editBloque" required>
        </div>
      </div>
      <div class="row mt-2">
        <div class="col-md-6">
          <label class="form-label">Facultad:</label>
          <input type="text" class="form-control" value="${solicitudActual.facultad}" id="editFacultad" required>
        </div>
        <div class="col-md-6">
          <label class="form-label">Salón:</label>
          <input type="text" class="form-control" value="${solicitudActual.salon}" id="editSalon" required>
        </div>
      </div>
      <div class="row mt-2">
        <div class="col-md-6">
          <label class="form-label">Correo Electrónico:</label>
          <input type="email" class="form-control" value="${solicitudActual.correoElectronico}" id="editCorreo" required>
        </div>
        <div class="col-md-6">
          <label class="form-label">Contacto:</label>
          <input type="text" class="form-control" value="${solicitudActual.numeroContacto}" id="editContacto" required>
        </div>
      </div>
      <div class="row mt-2">
        <div class="col-md-6">
          <label class="form-label">Número de Equipo:</label>
          <input type="text" class="form-control" value="${solicitudActual.numEquipo}" id="editNumEquipo" required>
        </div>
        <div class="col-md-6">
          <label class="form-label">Placa del Equipo:</label>
          <input type="text" class="form-control" value="${solicitudActual.placaEquipo}" id="editPlaca" required>
        </div>
      </div>
      <div class="row mt-2">
        <div class="col-md-6">
          <label class="form-label">Nombre del equipo:</label>
          <input type="text" class="form-control" value="${solicitudActual.ordenTrabajo || ''}" id="editOrden">
        </div>
        <div class="col-md-6">
          <label class="form-label">Tipo de Equipo:</label>
          <input type="text" class="form-control" value="${solicitudActual.tipoEquipo}" id="editTipoEquipo">
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
  
  document.getElementById('btnCancelarEdicion').addEventListener('click', volverAInformacion);
  document.getElementById('btnGuardarEdicion').addEventListener('click', guardarEdicion);
}

function volverAInformacion() {
  modoEdicion = false;
  mostrarInfoSolicitud(solicitudActual);
}

function guardarEdicion() {
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

  // Actualizar en localStorage
  let enProceso = JSON.parse(localStorage.getItem('enProceso')) || [];
  const index = enProceso.findIndex(s => s.numeroCaso === solicitudActual.numeroCaso);
  if (index !== -1) {
    enProceso[index] = solicitudActual;
    localStorage.setItem('enProceso', JSON.stringify(enProceso));
  }

  // Volver a la vista de solo lectura
  modoEdicion = false;
  mostrarInfoSolicitud(solicitudActual);
}

function cambiodePunto(){


}