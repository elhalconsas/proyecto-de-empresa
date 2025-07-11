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
    if (solicitudActual.etapaActual) {
      etapaActual = solicitudActual.etapaActual;
    }
    
    if (solicitudActual.diagnosticoEntries) {
      diagnosticoEntries = solicitudActual.diagnosticoEntries;
    }
    
    if (solicitudActual.mantenimientoEntries) {
      mantenimientoEntries = solicitudActual.mantenimientoEntries;
    }
    
    
    inicializarUI();
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
  mostrarEtapa(etapaActual);
  verificarEstadoContinuar();
}

function configurarEventos() {
  document.getElementById('btnContinuarDiagnostico').addEventListener('click', () => mostrarEtapa('diagnostico'));
  document.getElementById('btnVolverInformacion').addEventListener('click', () => mostrarEtapa('informacion'));
  document.getElementById('btnContinuarMantenimiento').addEventListener('click', () => mostrarEtapa('mantenimiento'));
  document.getElementById('btnVolverDiagnostico').addEventListener('click', () => mostrarEtapa('diagnostico'));
  document.getElementById('btnContinuarInforme').addEventListener('click', () => mostrarEtapa('informe'));
  document.getElementById('btnVolverMantenimiento').addEventListener('click', () => mostrarEtapa('mantenimiento'));
  document.getElementById('btnFinalizarProceso').addEventListener('click', finalizarProceso);
  document.getElementById('btnInformeRevicion').addEventListener('click',() => mostrarEtapa('revision'));
  
  document.getElementById('btnEditar').addEventListener('click', habilitarEdicion);
  document.getElementById('btnSaltarMantenimiento').addEventListener('click', saltarAMantenimiento);
  
  document.getElementById('formDiagnostico').addEventListener('submit', guardarDiagnostico);
  document.getElementById('formMantenimiento').addEventListener('submit', guardarMantenimiento);
  
  document.getElementById('imagenesDiagnostico').addEventListener('change', function(e) {
    previewImages(e.target.files, 'previewDiagnostico');
  });
  
  document.getElementById('imagenesMantenimiento').addEventListener('change', function(e) {
    previewImages(e.target.files, 'previewMantenimiento');
  });
  
  document.getElementById('btnEtapaInformacion').addEventListener('click', () => !this.disabled && mostrarEtapa('informacion'));
  document.getElementById('btnEtapaDiagnostico').addEventListener('click', () => !this.disabled && mostrarEtapa('diagnostico'));
  document.getElementById('btnEtapaMantenimiento').addEventListener('click', () => !this.disabled && mostrarEtapa('mantenimiento'));
  document.getElementById('btnEtapaInforme').addEventListener('click', () => !this.disabled && mostrarEtapa('informe'));
  document.getElementById('btnEtapaRevision').addEventListener('click', () => !this.disabled && mostrarEtapa('revision'));

}

function actualizarEstadoBotones() {
  const etapas = ['informacion', 'diagnostico', 'mantenimiento', 'informe', 'revision'];
  const indexEtapaActual = etapas.indexOf(etapaActual);

  // Habilitar solo la etapa actual y las anteriores
  etapas.forEach((etapa, index) => {
    const btnEtapa = document.getElementById(`btnEtapa${etapa.charAt(0).toUpperCase() + etapa.slice(1)}`);
    if (btnEtapa) {
      btnEtapa.disabled = index > indexEtapaActual;
    }
  });

  // Habilitar botón "Continuar" solo si se cumplen los requisitos
  const btnContinuar = document.getElementById(`btnContinuar${etapaActual.charAt(0).toUpperCase() + etapaActual.slice(1)}`);
  if (btnContinuar) {
    switch (etapaActual) {
      case 'informacion':
        btnContinuar.disabled = !(
          solicitudActual.nombreLaboratorio && 
          solicitudActual.facultad && 
          solicitudActual.salon
        );
        break;
      case 'diagnostico':
        btnContinuar.disabled = diagnosticoEntries.length === 0;
        break;
      case 'mantenimiento':
        btnContinuar.disabled = mantenimientoEntries.length === 0 && 
                              solicitudActual.mantenimientoPosible !== false;
        break;
      case 'informe':
        btnContinuar.disabled = false; // Siempre habilitado para revisión
        break;
    }
  }
}

function verificarEstadoContinuar() {
  const camposRequeridos = [
    solicitudActual.nombreLaboratorio,
    solicitudActual.bloque,
    solicitudActual.facultad,
    solicitudActual.salon
  ];

  const todosCompletos = camposRequeridos.every(campo => campo && campo.trim() !== '');
  document.getElementById('btnContinuarDiagnostico').disabled = !todosCompletos;
  
  actualizarIndicadoresEtapas();
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
          <select class="form-select" id="editFacultad" required>
            <option value="Ciencias" ${solicitudActual.facultad === 'Ciencias' ? 'selected' : ''}>Ciencias</option>
            <option value="Ciencias Agrarias" ${solicitudActual.facultad === 'Ciencias Agrarias' ? 'selected' : ''}>Ciencias Agrarias</option>
            <option value="Minas" ${solicitudActual.facultad === 'Minas' ? 'selected' : ''}>Minas</option>
          </select>
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
          <select class="form-select" id="editTipoEquipo">
            <option value="medicion_control" ${solicitudActual.tipoEquipo === 'medicion_control' ? 'selected' : ''}>Equipos de Medición y Control</option>
            <!-- Resto de opciones... -->
            -{}
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
  
  // Validaciones en tiempo real
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


  actualizarEnStorage();
  
  modoEdicion = false;
  mostrarInfoSolicitud(solicitudActual);
  mostrarResumen(solicitudActual);
  verificarEstadoContinuar();
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

function finalizarRevision() {
  if (!confirm('¿Estás seguro de finalizar la revisión? Esta acción moverá la solicitud a finalizadas.')) {
    return;
  }
  
  // Guardar datos adicionales
  solicitudActual.marcaEquipo = document.getElementById('marcaEquipo').value;
  solicitudActual.modeloEquipo = document.getElementById('modeloEquipo').value;
  solicitudActual.serieEquipo = document.getElementById('serieEquipo').value;
  solicitudActual.personaAtendio = document.getElementById('personaAtendio').value;
  solicitudActual.cargoPersona = document.getElementById('cargoPersona').value;
  solicitudActual.contactoPersona = document.getElementById('contactoPersona').value;
  solicitudActual.retroalimentacion = document.getElementById('retroalimentacion').value;
  solicitudActual.estado = 'Finalizado';
  solicitudActual.fechaFinalizacion = new Date().toLocaleDateString();
  
  // Mover a finalizadas
  let enProceso = JSON.parse(localStorage.getItem('enProceso')) || [];
  enProceso = enProceso.filter(s => s.numeroCaso !== solicitudActual.numeroCaso);
  localStorage.setItem('enProceso', JSON.stringify(enProceso));
  
  let finalizadas = JSON.parse(localStorage.getItem('finalizadas')) || [];
  finalizadas.push(solicitudActual);
  localStorage.setItem('finalizadas', JSON.stringify(finalizadas));
  
  alert('Revisión finalizada. La solicitud ha sido movida a "Solicitudes Finalizadas".');
  window.location.href = 'solicitudes_finalizadas.html';
}

function generarResumenInforme() {
  const revisionSection = document.getElementById('resumenInforme');
  
  let html = `    
    <div class="card mb-4">
      <div class="card-header bg-primary text-white">
        <h5>Proceso Gestión de Laboratorios</h5>
        <h6>Reporte Diagnóstico y Mantenimiento Interno</h6>
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
                <td><input type="text" class="form-control" id="solicitante" value=""></td>
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
                <td><input type="text" class="form-control" id="codigoLaboratorio" value=""></td>
              </tr>
              <tr>
                <th>Coordinador</th>
                <td><input type="text" class="form-control" id="cordinador" value=""></td>
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
                <td><input type="text" class="form-control" id="marcaEquipo" value=""></td>
              </tr>
              <tr>
                <th>Modelo</th>
                <td><input type="text" class="form-control" id="modeloEquipo" value=""></td>
              </tr>
              <tr>
                <th>Número de serie</th>
                <td><input type="text" class="form-control" id="serieEquipo" value=""></td>
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
                <td><input type="text" class="form-control" id="personaAtendio" value=""></td>
              </tr>
              <tr>
                <th>Cargo/rol</th>
                <td><input type="text" class="form-control" id="cargoPersona" value=""></td>
              </tr>
              <tr>
                <th>Contacto</th>
                <td><input type="text" class="form-control" id="contactoPersona" value=""></td>
              </tr>
            </table>
          </div>
        </div>
        
        <h5 class="mt-4">Diagnóstico</h5>
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
  revisionSection.innerHTML = html
}

function volverADiagnostico() {
  if (!confirm('¿Estás seguro de devolver esta solicitud a diagnóstico? Todos los avances se mantendrán.')) {
    return;
  }
  
  solicitudActual.estado = 'En diagnostico';
  solicitudActual.etapaActual = 'diagnostico';
  actualizarEnStorage();
  
  // Mostrar etapa de diagnóstico
  mostrarEtapa('diagnostico');
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
  actualizarEstadoBotones();
}
// ... (resto de funciones existentes: cancelarEdicion, previewImages, guardarDiagnostico, etc.) ...

function mostrarEtapa(etapa) {
  etapaActual = etapa;
  
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
    case 'revision':
      solicitudActual.estado = 'En aprobacion';
      generarResumenRevision(); 

      break;
  }
  
  document.getElementById('informacionSection').classList.add('collapse');
  document.getElementById('diagnosticoSection').classList.add('collapse');
  document.getElementById('mantenimientoSection').classList.add('collapse');
  document.getElementById('informeSection').classList.add('collapse');
  
  document.getElementById(`${etapa}Section`).classList.remove('collapse');
  
  if (etapa === 'informe') {
    generarResumenInforme();
  }
  
  if (etapa === 'revision') {
    generarInformeFinal();
  }
  solicitudActual.etapaActual = etapaActual;
  actualizarEnStorage();
  mostrarResumen(solicitudActual);
  actualizarIndicadoresEtapas();
  verificarEstadoContinuar();
}

function actualizarIndicadoresEtapas() {
  const etapas = ['informacion', 'diagnostico', 'mantenimiento', 'informe', 'revision'];
  const indexEtapaActual = etapas.indexOf(etapaActual);
  
  etapas.forEach((etapa, index) => {
    const btn = document.getElementById(`btnEtapa${etapa.charAt(0).toUpperCase() + etapa.slice(1)}`);
    if (btn) {
      btn.classList.remove('etapa-activa', 'etapa-completa');
      btn.disabled = index > indexEtapaActual;
      
      if (etapa === etapaActual) {
        btn.classList.add('etapa-activa');
      }
      
      if (index < indexEtapaActual) {
        btn.classList.add('etapa-completa');
      }
    }
  });
}

// ... (resto de funciones del archivo) ...
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
  actualizarEstadoBotones();
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

function generarInformeFinal() {
  const resumen = document.getElementById('mostrarInformeFinal');
  
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
  solicitudActual.fechaFinalizacion = new Date().toLocaleDateString();
  
  let enProceso = JSON.parse(localStorage.getItem('enProceso')) || [];
  enProceso = enProceso.filter(s => s.numeroCaso !== solicitudActual.numeroCaso);
  localStorage.setItem('enProceso', JSON.stringify(enProceso));
  
  let finalizadas = JSON.parse(localStorage.getItem('finalizadas')) || [];
  finalizadas.push(solicitudActual);
  localStorage.setItem('finalizadas', JSON.stringify(finalizadas));
  
  alert('Proceso finalizado. La solicitud ha sido movida a "Solicitudes Finalizadas".');
  window.location.href = 'solicitudes_proceso.html';
}