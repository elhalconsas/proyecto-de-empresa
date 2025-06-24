let solicitudActual = null;

document.addEventListener('DOMContentLoaded', function () {
  const numeroCaso = localStorage.getItem('detalleActual');
  const solicitudes = JSON.parse(localStorage.getItem('enProceso')) || [];
  solicitudActual = solicitudes.find(s => s.numeroCaso === numeroCaso);

  if (solicitudActual) {
    mostrarResumen(solicitudActual);
  }
});

function mostrarResumen(solicitud) {
  const resumen = document.getElementById('tablaDetalleResumen');
  resumen.innerHTML = '';

  const fila = resumen.insertRow();
  fila.insertCell(0).textContent = solicitud.numeroCaso;
  fila.insertCell(1).textContent = solicitud.tecnicoAsignado || 'No asignado';
  fila.insertCell(2).innerHTML = `<span class="badge bg-warning text-dark">${solicitud.estado}</span>`;
  fila.insertCell(3).textContent = solicitud.fechaInicio;

  const fechaInicio = new Date(solicitud.fechaInicio);
  const hoy = new Date();
  const diff = Math.floor((hoy - fechaInicio) / (1000 * 60 * 60 * 24));
  fila.insertCell(4).textContent = `${diff} día(s)`;
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
      <div class="col-md-6"><strong>Orden de Trabajo:</strong> ${solicitud.ordenTrabajo}</div>
      
    </div>
    <div class="row mt-2">
      <div class="col-md-6"><strong>Tipo de Equipo:</strong> ${solicitud.tipoEquipo}</div>
    </div>
    <div class="row mt-3">
      <div class="col-12"><strong>Descripción del Problema:</strong><br>${solicitud.descripcionProblema}</div>
    </div>
  `;
}

function continuarProceso(idTabDestino, nuevoEstado) {
  // Actualiza estado en memoria
  solicitudActual.estado = nuevoEstado;

  // Actualiza en localStorage
  let enProceso = JSON.parse(localStorage.getItem('enProceso')) || [];
  const index = enProceso.findIndex(s => s.numeroCaso === solicitudActual.numeroCaso);
  if (index !== -1) {
    enProceso[index] = solicitudActual;
    localStorage.setItem('enProceso', JSON.stringify(enProceso));
  }

  // Actualizar resumen
  mostrarResumen(solicitudActual);
  mostrarInfoSolicitud(solicitudActual);


  // Habilitar y activar tab siguiente
  const btn = document.getElementById(`tab-${idTabDestino}`);
  btn.classList.remove('disabled');
  const trigger = new bootstrap.Tab(btn);
  trigger.show();
}

function finalizarProceso() {
  alert('Proceso finalizado. Puedes mover esta solicitud a "Finalizadas".');
  continuarProceso('aprobacion', 'Finalizado');
}
