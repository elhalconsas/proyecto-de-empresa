document.addEventListener('DOMContentLoaded', function() {
  // Recuperar el número de caso de localStorage
  const numeroCaso = localStorage.getItem('detalleActual');
  const solicitudesFinalizadas = JSON.parse(localStorage.getItem('finalizadas')) || [];
  
  // Buscar la solicitud en las finalizadas
  const solicitud = solicitudesFinalizadas.find(s => s.numeroCaso === numeroCaso);
  
  if (solicitud) {
    // Llamar a la función para generar el informe
    generarInforme(solicitud);
  } else {
    alert('No se encontró la solicitud en la lista de finalizadas.');
  }
});

function generarInforme(solicitud) {
  const informe = document.getElementById('informeFinal');
  let html = `
    <div class="card mb-4">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">Proceso Gestión de Laboratorios</h5>
        <h6 class="mb-0">Reporte Final de Mantenimiento</h6>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <table class="table table-bordered">
              <tr>
                <th>Fecha de Finalización</th>
                <td>${solicitud.fechaFinalizacion || new Date().toLocaleDateString()}</td>
              </tr>
              <tr>
                <th>No. Solicitud</th>
                <td>${solicitud.numeroSolicitud}</td>
              </tr>
              <tr>
                <th>No. Caso</th>
                <td>${solicitud.numeroCaso}</td>
              </tr>
              <tr>
                <th>Laboratorio</th>
                <td>${solicitud.nombreLaboratorio}</td>
              </tr>
              <tr>
                <th>Facultad</th>
                <td>${solicitud.facultad}</td>
              </tr>
              <tr>
                <th>Ubicación</th>
                <td>Bloque ${solicitud.bloque}, Salón ${solicitud.salon}</td>
              </tr>
            </table>
          </div>
          
          <div class="col-md-6">
            <table class="table table-bordered">
              <tr>
                <th>Equipo</th>
                <td>${solicitud.tipoEquipo}</td>
              </tr>
              <tr>
                <th>Placa UNAL</th>
                <td>${solicitud.placaEquipo}</td>
              </tr>
              <tr>
                <th>Técnico</th>
                <td>${solicitud.tecnicoAsignado}</td>
              </tr>
              <tr>
                <th>Fecha de Inicio</th>
                <td>${solicitud.fechaInicio}</td>
              </tr>
              <tr>
                <th>Duración</th>
                <td>${calcularDuracion(solicitud.fechaInicio, solicitud.fechaFinalizacion)}</td>
              </tr>
            </table>
          </div>
        </div>

        <h5 class="mt-4">Descripción del Problema</h5>
        <div class="mb-4 p-3 bg-light rounded">
          ${solicitud.descripcionProblema || 'No se registró descripción'}
        </div>

        <h5 class="mt-4">Diagnóstico</h5>
        <div class="mb-4">
          ${solicitud.diagnostico || 'No se registró diagnóstico'}
        </div>

        <h5 class="mt-4">Mantenimiento</h5>
        ${solicitud.mantenimiento || 'No se registró mantenimiento'}

        <h5 class="mt-4">Comentarios de Revisión</h5>
        <div class="p-3 bg-light rounded">
          ${solicitud.comentarioRevisión || 'No se registró comentario de revisión'}
        </div>
      </div>
    </div>
  `;

  informe.innerHTML = html;
}

function calcularDuracion(fechaInicio, fechaFinalizacion) {
  if (!fechaInicio) return 'No disponible';
  
  const inicio = new Date(fechaInicio);
  const fin = fechaFinalizacion ? new Date(fechaFinalizacion) : new Date();
  
  const diffMs = fin - inicio;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return `${diffDays} días, ${diffHours} horas`;
}
