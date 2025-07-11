document.addEventListener('DOMContentLoaded', function() {
  const solicitudes = JSON.parse(localStorage.getItem('enProceso')) || [];
  const itemsPerPage = 10;
  const totalPages = Math.ceil(solicitudes.length / itemsPerPage);
  
  function mostrarPagina(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = solicitudes.slice(start, end);
    
    cargarSolicitudesEnProceso(paginatedItems);
    
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement('li');
      li.className = `page-item ${i === page ? 'active' : ''}`;
      li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      li.addEventListener('click', () => mostrarPagina(i));
      pagination.appendChild(li);
    }
  }
  
  if (solicitudes.length > 0) {
    mostrarPagina(1);
  } else {
    cargarSolicitudesEnProceso([]);
  }
});



function cargarSolicitudesEnProceso(solicitudes) {
  const tabla = document.getElementById('tablaProceso');
  
  // Verifica si la tabla existe antes de intentar modificarla
  if (!tabla) {
    console.error("No se encontró el elemento 'tablaProceso' en el DOM.");
    return;
  }
  
  tabla.innerHTML = ''; // Limpiar la tabla antes de llenarla

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

    const btnVer = document.createElement('button');
    btnVer.textContent = 'Ver Detalles';
    btnVer.className = 'btn btn-info btn-sm';
    btnVer.onclick = () => verDetalle(solicitud.numeroCaso);

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
    case 'En informe': return 'bg-info';
    case 'En aprobacion': return 'bg-danger';
    case 'Finalizado': return 'bg-success';
    default: return 'bg-secondary';
  }
}

function verDetalle(numeroCaso) {
  localStorage.setItem('detalleActual', numeroCaso);
  window.location.href = 'detalle_solicitud.html';
}

function eliminarSolicitud(indice) {
  let solicitudes = JSON.parse(localStorage.getItem('enProceso')) || [];
  if (confirm(`¿Deseas eliminar la solicitud #${solicitudes[indice].numeroCaso}?`)) {
    solicitudes.splice(indice, 1);
    localStorage.setItem('enProceso', JSON.stringify(solicitudes));
    window.location.reload();
  }
}