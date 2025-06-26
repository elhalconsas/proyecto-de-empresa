document.addEventListener('DOMContentLoaded', function() {
  inicializarFormulario();
  cargarDesdeAlmacenamiento();
  
  // Validación de campos numéricos
  document.getElementById('numeroContacto').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '');
  });
  
  document.getElementById('numEquipo').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '');
  });
  
  document.getElementById('placaEquipo').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '');
  });
  
  // Validación de correo UNAL
  document.getElementById('correoElectronico').addEventListener('change', function(e) {
    if (!this.value.endsWith('@unal.edu.co')) {
      alert('Por favor ingrese un correo institucional (@unal.edu.co)');
      this.focus();
    }
  });
});
function validarNumerico(valor) {
  return /^\d+$/.test(valor);
}

function validarCorreo(correo) {
  return /@unal\.edu\.co$/.test(correo);
}

function inicializarFormulario() {
  const fechaActual = new Date().toLocaleDateString();
  const numeroCaso =  Math.floor(1000 + Math.random() * 9000);
  const numeroSolicitud = Math.floor(1000 + Math.random() * 9000);

  document.getElementById('fechaSolicitud').value = fechaActual;
  document.getElementById('numeroCaso').value = numeroCaso;
  document.getElementById('numeroSolicitud').value = numeroSolicitud;
}

function cargarDesdeAlmacenamiento() {
  const solicitudes = JSON.parse(localStorage.getItem('bdSolicitudes')) || [];
  const itemsPerPage = 10;
  const totalPages = Math.ceil(solicitudes.length / itemsPerPage);
  
  function mostrarPagina(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = solicitudes.slice(start, end);
    
    paginatedItems.forEach(solicitud => {
      agregarFilaATabla(solicitud);
    });
    
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement('li');
      li.className = `page-item ${i === page ? 'active' : ''}`;
      li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      li.addEventListener('click', () => {
        document.getElementById('cuerpoTabla').innerHTML = '';
        mostrarPagina(i);
      });
      pagination.appendChild(li);
    }
  }
  
  if (solicitudes.length > 0) {
    mostrarPagina(1);
  }
}


function validarCamposObligatorios() {
  const campos = [
    'nombreLaboratorio',
    'NumBloque',
    'facultad',
    'numSalon',
    'correoElectronico',
    'numeroContacto',
    'numEquipo',
    'placaEquipo',
    'tipoEquipo',
    'ordenTrabajo'
    
  ];

  return campos.every(id => {
    const campo = document.getElementById(id);
    return campo && campo.value.trim() !== '';
  });
}




// Guardar nueva solicitud
function guardarSolicitud() {
  // Validaciones
  const correo = document.getElementById('correoElectronico').value;
  const numEquipo = document.getElementById('numEquipo').value;
  const placaEquipo = document.getElementById('placaEquipo').value;
  const contacto = document.getElementById('numeroContacto').value;
  
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
  
  if (!confirm('¿Estás seguro de guardar esta solicitud?')) {
    return;
  }
  if (!validarCamposObligatorios()) {
    alert('Por favor completa todos los campos obligatorios marcados con *');
    return;
  }

  const solicitud = {
    numeroSolicitud: document.getElementById('numeroSolicitud').value,
    numeroCaso: document.getElementById('numeroCaso').value,
    fechaSolicitud: document.getElementById('fechaSolicitud').value,
    nombreLaboratorio: document.getElementById('nombreLaboratorio').value,
    bloque: document.getElementById('NumBloque').value,
    facultad: document.getElementById('facultad').value,
    salon: document.getElementById('numSalon').value,
    correoElectronico: document.getElementById('correoElectronico').value,
    numeroContacto: document.getElementById('numeroContacto').value,
    numEquipo: document.getElementById('numEquipo').value,
    placaEquipo: document.getElementById('placaEquipo').value,
    ordenTrabajo: document.getElementById('ordenTrabajo').value,
    tipoEquipo: document.getElementById('tipoEquipo').value,
    descripcionProblema: document.getElementById('descripcionProblema').value
  };

  let bd = JSON.parse(localStorage.getItem('bdSolicitudes')) || [];
  bd.push(solicitud);
  localStorage.setItem('bdSolicitudes', JSON.stringify(bd));

  agregarFilaATabla(solicitud);
  inicializarFormulario();
}


// Agrega la fila con acciones
function agregarFilaATabla(solicitud) {
  const cuerpoTabla = document.getElementById('cuerpoTabla');
  const fila = cuerpoTabla.insertRow();
  fila.className = 'align-middle';

  fila.insertCell(0).textContent = solicitud.numeroCaso;
  fila.insertCell(1).textContent = solicitud.nombreLaboratorio;
  fila.insertCell(2).textContent = solicitud.bloque;
  fila.insertCell(3).textContent = solicitud.facultad;
  fila.insertCell(4).textContent = solicitud.tipoEquipo;

  const acciones = fila.insertCell(5);
  acciones.className = 'd-flex gap-2';

  const selector = document.createElement('select');
  selector.className = 'form-select form-select-sm';
  ['Seleccione técnico', 'Nombre1', 'Nombre2', 'Nombre3', 'Nombre4'].forEach(nombre => {
    const opt = document.createElement('option');
    opt.value = nombre;
    opt.textContent = nombre;
    selector.appendChild(opt);
  });

  const btnAgregar = document.createElement('button');
  btnAgregar.className = 'btn btn-primary btn-sm';
  btnAgregar.textContent = 'Asignar Estudiante';
  btnAgregar.onclick = () => {
  if (!confirm(`¿Deseas asignar la solicitud a ${selector.value}?`)) {
    return;
  }

    // 1. Guardar en "enProceso"
    const nuevaSolicitud = {
      ...solicitud,
      tecnicoAsignado: selector.value,
      estado: 'Asignada',
      fechaInicio: new Date().toLocaleDateString()
    };

    let enProceso = JSON.parse(localStorage.getItem('enProceso')) || [];
    enProceso.push(nuevaSolicitud);
    localStorage.setItem('enProceso', JSON.stringify(enProceso));

    // 2. Eliminar de tabla actual (del formulario)
    cuerpoTabla.removeChild(fila);

    // 3. Eliminar también de bdSolicitudes
    eliminarDeAlmacenamiento(solicitud.numeroCaso);

    // 4. Cargar dinámicamente JS y ejecutar función (si aplica)
    const script = document.createElement('script');
    script.src = 'solicitudes_proceso_forms.js';
    script.onload = () => {
      if (typeof cargarSolicitudesEnProceso === 'function') {
        cargarSolicitudesEnProceso();
      }
    };
    script.onerror = () => {
      console.error('No se pudo cargar solicitudes_proceso_forms.js');
    };
    document.body.appendChild(script);

    alert(`Solicitud #${nuevaSolicitud.numeroCaso} asignada a ${nuevaSolicitud.tecnicoAsignado} y enviada a "Solicitudes en Proceso".`);
  };



  const btnEliminar = document.createElement('button');
  btnEliminar.className = 'btn btn-danger btn-sm';
  btnEliminar.textContent = 'Eliminar';
  btnEliminar.onclick = () => {
    cuerpoTabla.removeChild(fila);
    eliminarDeAlmacenamiento(solicitud.numeroCaso);
  };

  acciones.appendChild(selector);
  acciones.appendChild(btnAgregar);
  acciones.appendChild(btnEliminar);
}

// Eliminar del almacenamiento principal
function eliminarDeAlmacenamiento(numeroCaso) {
  let bd = JSON.parse(localStorage.getItem('bdSolicitudes')) || [];
  bd = bd.filter(item => item.numeroCaso !== numeroCaso);
  localStorage.setItem('bdSolicitudes', JSON.stringify(bd));
}
