document.addEventListener('DOMContentLoaded', function() {
  const solicitudes = JSON.parse(localStorage.getItem('finalizadas')) || [];
  const itemsPerPage = 10;
  const totalPages = Math.ceil(solicitudes.length / itemsPerPage);
  
  function mostrarPagina(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = solicitudes.slice(start, end);
    
    cargarSolicitudesFinalizadas(paginatedItems);
    
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
    cargarSolicitudesFinalizadas([]);
  }
});

function cargarSolicitudesFinalizadas(solicitudes) {
  const tabla = document.getElementById('tablaFinalizadas');
  tabla.innerHTML = '';

  if (solicitudes.length === 0) {
    const fila = tabla.insertRow();
    const celda = fila.insertCell(0);
    celda.colSpan = 7;
    celda.className = 'text-center';
    celda.textContent = 'No hay solicitudes finalizadas.';
    return;
  }

  solicitudes.forEach((solicitud) => {
    const fila = tabla.insertRow();
    fila.className = 'align-middle clickable-row';

    fila.insertCell(0).textContent = solicitud.numeroCaso || '—';
    fila.insertCell(1).textContent = solicitud.nombreLaboratorio || '—';

    const celdaEstado = fila.insertCell(2);
    const badge = document.createElement('span');
    badge.className = 'badge bg-success';
    badge.textContent = 'Finalizado';
    celdaEstado.appendChild(badge);

    fila.insertCell(3).textContent = solicitud.fechaInicio || '—';
    fila.insertCell(4).textContent = solicitud.fechaFinalizacion || '—';
    fila.insertCell(5).textContent = solicitud.tecnicoAsignado || 'Sin asignar';

    const celdaAcciones = fila.insertCell(6);
    const btnVer = document.createElement('button');
    btnVer.textContent = 'Ver Informe';
    btnVer.className = 'btn btn-info btn-sm';
    btnVer.onclick = () => verInforme(solicitud.numeroCaso);
    celdaAcciones.appendChild(btnVer);
  });
}

function verInforme(numeroCaso) {
  localStorage.setItem('detalleActual', numeroCaso);
  window.location.href = 'informe_final.html';
}
