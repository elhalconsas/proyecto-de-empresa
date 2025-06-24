
document.addEventListener('DOMContentLoaded', function () {
  cargarSolicitudesEnProceso();
});



function cargarSolicitudesEnProceso() {
  const solicitudes = JSON.parse(localStorage.getItem('enProceso')) || [];
  const tabla = document.getElementById('tablaProceso');
  tabla.innerHTML = ''; // Limpiar tabla previa

  if (solicitudes.length === 0) {
    const fila = tabla.insertRow();
    const celda = fila.insertCell(0);
    celda.colSpan = 6;
    celda.className = 'text-center';
    celda.textContent = 'No hay solicitudes en proceso.';
    return;
  }

  solicitudes.forEach((solicitud, index) => {
    const fila = tabla.insertRow();
    fila.className = 'align-middle clickable-row';

    fila.insertCell(0).textContent = solicitud.numeroCaso || '—';
    fila.insertCell(1).textContent = solicitud.nombreLaboratorio || '—';

    const celdaEstado = fila.insertCell(2);
    const badge = document.createElement('span');
    badge.className = `badge ${obtenerClaseEstado(solicitud.estado)}`;
    badge.textContent = solicitud.estado || '—';
    celdaEstado.appendChild(badge);

    fila.insertCell(3).textContent = solicitud.fechaInicio || '—';
    fila.insertCell(4).textContent = solicitud.tecnicoAsignado || 'Sin asignar';

    const celdaAcciones = fila.insertCell(5);
    celdaAcciones.className = 'd-flex gap-2';

    // Botón Ver Detalles
    const btnVer = document.createElement('button');
    btnVer.textContent = 'Ver Detalles';
    btnVer.className = 'btn btn-info btn-sm';
    btnVer.onclick = () => verDetalle(solicitud.numeroCaso);

    // Botón Eliminar
    const btnEliminar = document.createElement('button');
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.className = 'btn btn-danger btn-sm';
    btnEliminar.onclick = () => eliminarSolicitud(index);

    celdaAcciones.appendChild(btnVer);
    celdaAcciones.appendChild(btnEliminar);
  });
}

function obtenerClaseEstado(estado) {
  switch (estado) {
    case 'Asignada': return 'bg-warning text-dark';
    case 'En diagnostico': return 'bg-primary';
    case 'En mantenimiento': return 'bg-primary';
    case 'En informe': return 'bg-success';
    case 'En aprobacion ': return 'bg-danger';
    default: return 'bg-secondary';
  }
}

function verDetalle(numeroCaso) {
  localStorage.setItem('detalleActual', numeroCaso);
  window.location.href = 'detalle_solicitud.html';
}

function eliminarSolicitud(indice) {
  let solicitudes = JSON.parse(localStorage.getItem('enProceso')) || [];
  if (indice >= 0 && indice < solicitudes.length) {
    if (confirm(`¿Deseas eliminar la solicitud #${solicitudes[indice].numeroCaso}?`)) {
      solicitudes.splice(indice, 1);
      localStorage.setItem('enProceso', JSON.stringify(solicitudes));
      cargarSolicitudesEnProceso(); // Recargar tabla
    }
  }
}
