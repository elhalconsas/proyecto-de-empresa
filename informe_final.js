document.addEventListener('DOMContentLoaded', function() {
  const numeroCaso = localStorage.getItem('detalleActual');
  const solicitudes = JSON.parse(localStorage.getItem('finalizadas')) || [];
  const solicitud = solicitudes.find(s => s.numeroCaso === numeroCaso);

  if (solicitud) {
    generarInformeFinal(solicitud);
  }
});

function generarInformeFinal(solicitud) {
  const informe = document.getElementById('informeFinal');
  const diagnosticoEntries = solicitud.diagnosticoEntries || [];
  const mantenimientoEntries = solicitud.mantenimientoEntries || [];
  
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
                <th>Fecha de finalización</th>
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
                <th>Fecha inicio</th>
                <td>${solicitud.fechaInicio}</td>
              </tr>
              <tr>
                <th>Duración</th>
                <td>${calcularDuracion(solicitud.fechaInicio, solicitud.fechaFinalizacion)}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <h5 class="mt-4">Descripción del problema</h5>
        <div class="mb-4 p-3 bg-light rounded">
          ${solicitud.descripcionProblema || 'No se registró descripción'}
        </div>
        
        <h5 class="mt-4">Diagnóstico</h5>
        <div class="mb-4">
          ${diagnosticoEntries.map(entry => `
            <div class="card mb-3">
              <div class="card-header">
                <h6>${entry.titulo} <small>(${entry.fecha})</small></h6>
              </div>
              <div class="card-body">
                <p>${entry.comentario}</p>
                ${entry.imagenes && entry.imagenes.length > 0 ? `
                  <div class="d-flex flex-wrap">
                    ${entry.imagenes.map(img => `<img src="${img.url}" class="image-preview">`).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('') || '<p>No se registraron diagnósticos</p>'}
        </div>
        
        <h5 class="mt-4">Mantenimiento</h5>
        ${mantenimientoEntries.length > 0 ? `
          <div class="mb-4">
            ${mantenimientoEntries.map(entry => `
              <div class="card mb-3">
                <div class="card-header">
                  <h6>${entry.titulo} <small>(${entry.fecha})</small></h6>
                </div>
                <div class="card-body">
                  <p><strong>Actividades:</strong> ${entry.actividades}</p>
                  <p><strong>Partes reemplazadas:</strong> ${entry.partes}</p>
                  ${entry.imagenes && entry.imagenes.length > 0 ? `
                    <div class="d-flex flex-wrap">
                      ${entry.imagenes.map(img => `<img src="${img.url}" class="image-preview">`).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        ` : '<p>No se realizó mantenimiento</p>'}
        
        <h5 class="mt-4">Conclusión</h5>
        <div class="p-3 bg-light rounded">
          ${solicitud.conclusion || 'No se registró conclusión'}
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