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
        // Siempre mostrar las entradas actualizadas
        mostrarDiagnosticos();
        mostrarMantenimientos();
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
      mostrarDiagnosticos();
      mostrarMantenimientos();
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
      mostrarDiagnosticos();
      mostrarMantenimientos();
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
      mostrarDiagnosticos();
      mostrarMantenimientos();
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
  // Configurar el botón de "No es posible mantenimiento"
  const btnSaltarMantenimiento = document.getElementById('btnSaltarMantenimiento');
  if (btnSaltarMantenimiento) {
    btnSaltarMantenimiento.addEventListener('click', function() {
      // Cambiar la etapa a "En mantenimiento"
      actualizarEtapa('En mantenimiento');

      // Ocultar la sección de diagnóstico
      const diagSection = document.getElementById('diagnosticoSection');
      if (diagSection) diagSection.classList.add('collapse');

      // Mostrar la sección de mantenimiento
      const mantSection = document.getElementById('mantenimientoSection');
      if (mantSection) mantSection.classList.remove('collapse');

      // Actualizar el estado en la solicitud
      const numeroCaso = localStorage.getItem('detalleActual');
      const solicitudes = JSON.parse(localStorage.getItem('enProceso')) || [];
      const solicitudActual = solicitudes.find(s => s.numeroCaso === numeroCaso);

      if (solicitudActual) {
        solicitudActual.estado = 'En mantenimiento'; // Actualizar estado
        // Guardar la solicitud con el nuevo estado en localStorage
        const index = solicitudes.findIndex(s => s.numeroCaso === solicitudActual.numeroCaso);
        if (index !== -1) {
          solicitudes[index] = solicitudActual;
          localStorage.setItem('enProceso', JSON.stringify(solicitudes));
        }
      }
      
      alert('La solicitud ha sido movida a la etapa de mantenimiento.');
    });
  }
});

// Función para actualizar el estado de la solicitud
function actualizarEtapa(etapa) {
  // Obtener la solicitud actual desde localStorage
  const numeroCaso = localStorage.getItem('detalleActual');
  const solicitudes = JSON.parse(localStorage.getItem('enProceso')) || [];
  const solicitudActual = solicitudes.find(s => s.numeroCaso === numeroCaso);

  if (solicitudActual) {
    solicitudActual.estado = etapa; // Cambiar el estado de la solicitud

    // Guardar la solicitud actualizada en localStorage
    const index = solicitudes.findIndex(s => s.numeroCaso === solicitudActual.numeroCaso);
    if (index !== -1) {
      solicitudes[index] = solicitudActual;
      localStorage.setItem('enProceso', JSON.stringify(solicitudes));
    }
  }
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

function configurarEventos() {
  const btnContinuarDiagnostico = document.getElementById('btnContinuarDiagnostico');
  const btnEditar = document.getElementById('btnEditar');
  const btnGuardarEdicion = document.getElementById('btnGuardarEdicion');
  
  if (btnContinuarDiagnostico) {
    btnContinuarDiagnostico.addEventListener('click', () => actualizarEtapa('diagnostico'));
  }
  
  if (btnEditar) {
    btnEditar.addEventListener('click', habilitarEdicion);
  }
  
  if (btnGuardarEdicion) {
    btnGuardarEdicion.addEventListener('click', guardarEdicion);
  }
}

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

  
  const fechaCreacion = new Date(solicitud.fechaCreacion);
  const hoy = new Date();

 
  const diffMs = hoy - fechaCreacion;

  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)); 
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); 

  // Mostrar la diferencia en días y horas
  const tiempoCell = fila.insertCell(4);
  tiempoCell.innerHTML = `<div>${diffDays} días</div><div>${diffHours} horas</div>`;

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
            <label class="form-label">Facultad<span class="text-danger">*</span>:</label>
            <select class="form-select" id="editFacultad" value="${solicitudActual.facultad}" required>
              <option value="">Seleccione</option>
              <option value="Ciencias">Ciencias</option>
              <option value="Ciencias Agrarias">Ciencias Agrarias</option>
              <option value="Minas">Minas</option>
            </select>
            </div>
          <div class="col-md-6">
            <label class="form-label">Número del Salón <span class="text-danger">*</span>:</label>
            <input type="text" class="form-control" id="editSalon" value="${solicitudActual.salon}"required>
            </div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6">
            <label class="form-label">Correo Electrónico:</label>
            <input type="email" class="form-control" value="${solicitudActual.correoElectronico}" id="editCorreo" required>
          </div>
          <div class="col-md-6">
            <label class="form-label">Contacto <span class="text-danger">*</span>:</label>
            <input type="number" class="form-control" id="editContacto" value="${solicitudActual.numeroContacto}"required>
          </div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6">
            <label class="form-label">Número de Equipo:</label>
            <input type="number" class="form-control" id="editNumEquipo" value="${solicitudActual.numEquipo}" required>
            </div>
          <div class="col-md-6">
            <label class="form-label">Placa del Equipo:</label>
            <input type="number" class="form-control" id="editPlaca" value="${solicitudActual.placaEquipo}" required>
          </div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6">
            <label class="form-label">Nombre del equipo:</label>
            <input type="text" class="form-control" value="${solicitudActual.ordenTrabajo || ''}" id="editOrden">
          </div>
          <div class="col-md-6">
            <label class="form-label">Tipo de Equipo:</label>
            <select class="form-select" id="editTipoEquipo" value="${solicitudActual.tipoEquipo}" >
              <option value="">Seleccione</option>
              <option value="medicion_control">Equipos de Medición y Control</option>
              <option value="opticos">Instrumentos Ópticos</option>
              <option value="electricos">Equipos Eléctricos</option>
              <option value="calentamiento">Equipos de Calentamiento</option>
              <option value="herramientas">Herramientas</option>
              <option value="tecnologia_computacion">Tecnología y Computación</option>
              <option value="refrigeracion">Equipos de Refrigeración</option>
              <option value="mecanicos">Equipos Mecánicos</option>
              <option value="accesorios_laboratorio">Accesorios de Laboratorio</option>
              <option value="componentes_electronicos">Componentes Electrónicos</option>
              <option value="limpieza">Equipos de Limpieza</option>
              <option value="equipos_laboratorio">Equipos de Laboratorio</option>
              <option value="otros">Otros</option>
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
  
    document.getElementById('btnGuardarEdicion').addEventListener('click', guardarEdicion);
}
function mostrarInformeCompleto() {
  if (!solicitudActual) return;
  const updateIfExists = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value || 'No disponible';
  };

  // Información de la solicitud
  updateIfExists('infoNumeroSolicitud', solicitudActual.numeroSolicitud);
  updateIfExists('infoFechaSolicitud', solicitudActual.fechaSolicitud);
  updateIfExists('infoSolicitante', solicitudActual.solicitante);
  updateIfExists('infoCargoSolicitante', solicitudActual.cargo);
  updateIfExists('infoLaboratorio', solicitudActual.nombreLaboratorio);
  updateIfExists('infoFacultad', solicitudActual.facultad);
  updateIfExists('infoBloque', `Bloque ${solicitudActual.bloque || 'N/A'}`);
  updateIfExists('infoSalon', `Salón ${solicitudActual.salon || 'N/A'}`);
  updateIfExists('infoCodigoLab', solicitudActual.codigoLaboratorio);
  updateIfExists('infoCoordinador', solicitudActual.coordinador);

  // Información del equipo
  document.getElementById('infoNombreEquipo').textContent = solicitudActual.tipoEquipo || 'No disponible';
  document.getElementById('infoPlacaEquipo').textContent = solicitudActual.placaEquipo || 'No disponible';
  document.getElementById('infoMarcaEquipo').textContent = solicitudActual.marca || 'No disponible';
  document.getElementById('infoModeloEquipo').textContent = solicitudActual.modelo || 'No disponible';
  document.getElementById('infoSerieEquipo').textContent = solicitudActual.numeroSerie || 'No disponible';

  // Información del diagnóstico
  document.getElementById('infoFechaDiagnostico').textContent = solicitudActual.fechaDiagnostico || 'No disponible';
  document.getElementById('infoResponsableDiagnostico').textContent = solicitudActual.responsableDiagnostico || 'No disponible';
  document.getElementById('infoPersonaAtendio').textContent = solicitudActual.personaAtendio || 'No disponible';
  document.getElementById('infoCargoRol').textContent = solicitudActual.cargoRol || 'No disponible';
  document.getElementById('infoContactoAtendio').textContent = solicitudActual.contacto || 'No disponible';

  // Mostrar diagnósticos
  const diagnosticoContainer = document.getElementById('diagnosticoContainer');
  diagnosticoContainer.innerHTML = '';
  
  if (solicitudActual.diagnosticos && solicitudActual.diagnosticos.length > 0) {
    solicitudActual.diagnosticos.forEach(d => {
      diagnosticoContainer.innerHTML += `
        <div class="entry-item mb-3">
          <h6>${d.titulo || 'Diagnóstico'}</h6>
          <p>${d.comentario || 'Sin comentarios'}</p>
          ${d.imagenes && d.imagenes.length > 0 ? 
            `<div class="mt-2">Imágenes: ${d.imagenes.map(img => 
              `<span class="badge bg-info text-dark me-1">${img}</span>`
            ).join('')}</div>` : ''}
          <small class="text-muted">${new Date(d.fecha).toLocaleString()}</small>
        </div>
      `;
    });
  } else {
    document.getElementById('datosFaltantesContainer').style.display = 'block';
  }

  // Mostrar mantenimientos
   const mantenimientoContainer = document.getElementById('mantenimientoContainer');
  mantenimientoContainer.innerHTML = '';
  
  if (solicitudActual.mantenimientos && solicitudActual.mantenimientos.length > 0) {
    solicitudActual.mantenimientos.forEach(m => {
      mantenimientoContainer.innerHTML += `
        <div class="entry-item mb-3">
          <h6>${m.titulo || 'Mantenimiento'}</h6>
          <p><strong>Actividades:</strong> ${m.actividades || 'No especificado'}</p>
          ${m.partes ? `<p><strong>Partes:</strong> ${m.partes}</p>` : ''}
          ${m.imagenes && m.imagenes.length > 0 ? 
            `<div class="mt-2">Imágenes: ${m.imagenes.map(img => 
              `<span class="badge bg-info text-dark me-1">${img}</span>`
            ).join('')}</div>` : ''}
          <small class="text-muted">${new Date(m.fecha).toLocaleString()}</small>
        </div>
      `;
    });
    document.getElementById('datosFaltantesContainer').style.display = 'none';
  } else {
    document.getElementById('datosFaltantesContainer').style.display = 'block';
  }
}

// Modificar la función guardarInforme para actualizar correctamente los datos
document.getElementById('btnGuardarInforme').addEventListener('click', function() {
  const diagnostico = document.getElementById('inputDiagnostico').value;
  const actividades = document.getElementById('inputActividades').value;
  const partes = document.getElementById('inputPartes').value;

  if (!diagnostico || !actividades) {
    alert('Por favor complete al menos el diagnóstico y las actividades realizadas');
    return;
  }

  // Guardar diagnóstico si no existe
  if (!solicitudActual.diagnosticos || solicitudActual.diagnosticos.length === 0) {
    if (!solicitudActual.diagnosticos) solicitudActual.diagnosticos = [];
    solicitudActual.diagnosticos.push({
      titulo: 'Diagnóstico técnico',
      comentario: diagnostico,
      fecha: new Date().toISOString()
    });
  }

  // Guardar mantenimiento si no existe
  if (!solicitudActual.mantenimientos || solicitudActual.mantenimientos.length === 0) {
    if (!solicitudActual.mantenimientos) solicitudActual.mantenimientos = [];
    solicitudActual.mantenimientos.push({
      titulo: 'Mantenimiento correctivo',
      actividades: actividades,
      partes: partes,
      fecha: new Date().toISOString()
    });
  }

  let enProceso = JSON.parse(localStorage.getItem('enProceso')) || [];
  const index = enProceso.findIndex(s => s.numeroSolicitud === solicitudActual.numeroSolicitud);
  if (index !== -1) {
    enProceso[index] = solicitudActual;
    localStorage.setItem('enProceso', JSON.stringify(enProceso));
  }

  mostrarInformeCompleto();
  alert('Datos guardados correctamente');
});
document.addEventListener('DOMContentLoaded', function() {
  const btnContinuarRevisión = document.getElementById('btnContinuarRevisión');
  const btnFinalizarProceso = document.getElementById('btnFinalizarProceso');
  const btnRechazar = document.getElementById('btnRechazar');
  const btnCancelarRechazo = document.getElementById('btnCancelarRechazo');
  const btnConfirmarRechazo = document.getElementById('btnConfirmarRechazo');
  const comentariosRechazo = document.getElementById('comentariosRechazo');
  const comentarioRechazoInput = document.getElementById('comentarioRechazo');
  const informeRevisionSection = document.getElementById('informeRevision');
  const mantenimientoSection = document.getElementById('mantenimientoSection'); // Sección de mantenimiento
  const diagnosticoSection = document.getElementById('diagnosticoSection'); // Sección de diagnóstico

  // Evento para el botón "Continuar a Revisión"
  if (btnContinuarRevisión) {
    btnContinuarRevisión.addEventListener('click', function() {
      // Ocultar la sección de mantenimiento (si está visible)
      if (mantenimientoSection) mantenimientoSection.classList.add('collapse');
      
      // Ocultar la sección de diagnóstico (si está visible)
      if (diagnosticoSection) diagnosticoSection.classList.add('collapse');

      // Mostrar la sección de revisión
      if (informeRevisionSection) {
        informeRevisionSection.classList.remove('collapse');
      }

      // Llamar a la función para llenar el informe completo (esto puede depender de tus datos)
      mostrarInformeCompleto();
    });
  }

  // Función para mostrar el informe completo en la sección de Revisión
  function mostrarInformeCompleto() {
    const informeContainer = document.getElementById('mostrarInformeFinal');
    
    // Aquí llenarías los detalles del informe dinámicamente, como lo necesites
    informeContainer.innerHTML = `
      <h5>Detalles de la Solicitud</h5>
      <p><strong>Solicitante:</strong> Juan Pérez</p>
      <p><strong>Laboratorio:</strong> Química Orgánica</p>
      <p><strong>Diagnóstico:</strong> El equipo está funcionando correctamente.</p>
      <p><strong>Mantenimiento:</strong> Se realizó limpieza interna y ajuste de piezas.</p>
    `;
    
    // Aquí ocultamos cualquier botón de edición en el informe
    const editButtons = document.querySelectorAll('.btn-editar');
    editButtons.forEach(button => {
      button.style.display = 'none'; // Ocultar los botones de edición
    });
  }

  // Evento para el botón "Confirmar formulario"
  btnFinalizarProceso.addEventListener('click', function() {
    alert('Formulario confirmado correctamente');
    // Aquí puedes realizar cualquier acción adicional para confirmar el formulario
  });

  // Evento para el botón "Rechazar"
  btnRechazar.addEventListener('click', function() {
    comentariosRechazo.style.display = 'block'; // Muestra el campo de comentarios
  });

  // Evento para el botón "Cancelar Rechazo"
  btnCancelarRechazo.addEventListener('click', function() {
    comentariosRechazo.style.display = 'none'; // Oculta el campo de comentarios
    comentarioRechazoInput.value = ''; // Limpia el campo de comentario
  });

  // Evento para el botón "Confirmar Rechazo"
  btnConfirmarRechazo.addEventListener('click', function() {
    const comentario = comentarioRechazoInput.value.trim();
    if (!comentario) {
      alert('Por favor, ingrese un comentario para rechazar el formulario.');
      return;
    }

    // Guardar el comentario de rechazo (esto depende de cómo manejes los datos)
    alert('Rechazo confirmado con el comentario: ' + comentario);
    
    // Aquí puedes agregar la lógica para guardar el rechazo o actualizar el estado en localStorage
    comentariosRechazo.style.display = 'none'; // Ocultar la sección de comentarios después de confirmar
    comentarioRechazoInput.value = ''; // Limpiar el campo de comentario
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const informeSection = document.getElementById('informeSection');
  if (informeSection) {
    new MutationObserver(function() {
      if (!informeSection.classList.contains('collapse')) {
        mostrarInformeCompleto();
      }
    }).observe(informeSection, { attributes: true });
  }
});
function setupEditableFields(btnId, containerClass) {
  const editBtn = document.getElementById(btnId);
  if (!editBtn) return;

  editBtn.addEventListener('click', function() {
    const container = this.closest('.card');
    const fields = container.querySelectorAll('.editable-field');
    
    fields.forEach(field => {
      field.classList.toggle('editing');
      
      // Si estamos saliendo del modo edición, actualizar el span con el valor del input
      if (!field.classList.contains('editing')) {
        const input = field.querySelector('input');
        const span = field.querySelector('span');
        if (input && span) {
          span.textContent = input.value || 'No disponible';
        }
      }
    });

    // Cambiar el texto del botón
    if (this.innerHTML.includes('Guardar')) {
      this.innerHTML = '<i class="bi bi-pencil"></i> Editar';
      this.classList.remove('btn-success');
      this.classList.add('btn-light');
    } else {
      this.innerHTML = '<i class="bi bi-check"></i> Guardar';
      this.classList.remove('btn-light');
      this.classList.add('btn-success');
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  setupEditableFields('btnEditarSolicitud', '.card-body');
  setupEditableFields('btnEditarEquipo', '.card-body');
  setupEditableFields('btnEditarDiagnostico', '.card-body');

  // Guardar todo el informe
  document.getElementById('btnGuardarInforme').addEventListener('click', function() {
    // Validar campos obligatorios
    if (!document.getElementById('inputDiagnostico').value || 
        !document.getElementById('inputActividades').value) {
      alert('Por favor complete el diagnóstico técnico y las actividades realizadas');
      return;
    }

    
    alert('Informe guardado correctamente');
  });
});