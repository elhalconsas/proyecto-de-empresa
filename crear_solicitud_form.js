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

  // Validación de correo UNAL al enviar el formulario
  
});

function inicializarFormulario() {
  const fechaActual = new Date().toLocaleDateString();
  const numeroCaso =  Math.floor(1000 + Math.random() * 9000);
  const numeroSolicitud = Math.floor(1000 + Math.random() * 9000);

  document.getElementById('fechaSolicitud').value = fechaActual;
  document.getElementById('numeroCaso').value = numeroCaso;
  document.getElementById('numeroSolicitud').value = numeroSolicitud;
}

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
    if (selector.value === 'Seleccione técnico') {
      alert('Por favor, selecciona un técnico antes de asignar.');
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

    alert(`Solicitud #${nuevaSolicitud.numeroCaso} asignada a ${nuevaSolicitud.tecnicoAsignado} y enviada a "Solicitudes en Proceso".`);
  };

  const btnEliminar = document.createElement('button');
  btnEliminar.className = 'btn btn-danger btn-sm';
  btnEliminar.textContent = 'Eliminar';
  btnEliminar.onclick = () => {
    // Pedir confirmación antes de eliminar
    if (confirm(`¿Estás seguro de que deseas eliminar la solicitud #${solicitud.numeroCaso}?`)) {
      cuerpoTabla.removeChild(fila);
      eliminarDeAlmacenamiento(solicitud.numeroCaso);
      alert('Solicitud eliminada.');
    }
  };

  acciones.appendChild(selector);
  acciones.appendChild(btnAgregar);
  acciones.appendChild(btnEliminar);
}

function eliminarDeAlmacenamiento(numeroCaso) {
  let bd = JSON.parse(localStorage.getItem('bdSolicitudes')) || [];
  bd = bd.filter(item => item.numeroCaso !== numeroCaso);
  localStorage.setItem('bdSolicitudes', JSON.stringify(bd));
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

function validarCorreo(correo) {
  const regex = /^[a-zA-Z0-9._%+-]+@unal\.edu\.co$/;
  return regex.test(correo);
}
function validarNumerico(valor) {
  return !isNaN(valor) && valor.trim() !== '';
} 
function validarFecha(fecha) {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/; // Formato dd/mm/yyyy
  return regex.test(fecha);
}
function validarHora(hora) {
  const regex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/; // Formato HH:mm
  return regex.test(hora);
}

function guardarSolicitud() {
  // Obtener los valores de los campos
  const correo = document.getElementById('correoElectronico').value;
  const numEquipo = document.getElementById('numEquipo').value;
  const placaEquipo = document.getElementById('placaEquipo').value;
  const contacto = document.getElementById('numeroContacto').value;
  const numeroSalon = document.getElementById('numeroSalon') ? document.getElementById('numeroSalon').value : ''; // Agregar verificación

  const solicitud = {
    numeroSolicitud: document.getElementById('numeroSolicitud').value,
    numeroCaso: document.getElementById('numeroCaso').value,
    fechaSolicitud: document.getElementById('fechaSolicitud').value,
    nombreLaboratorio: document.getElementById('nombreLaboratorio').value,
    bloque: document.getElementById('NumBloque').value,
    facultad: document.getElementById('facultad').value,
    salon: numeroSalon, // Usar la variable que contiene el valor del campo
    correoElectronico: document.getElementById('correoElectronico').value,
    numeroContacto: document.getElementById('numeroContacto').value,
    numEquipo: document.getElementById('numEquipo').value,
    placaEquipo: document.getElementById('placaEquipo').value,
    ordenTrabajo: document.getElementById('ordenTrabajo').value,
    tipoEquipo: document.getElementById('tipoEquipo').value,
    descripcionProblema: document.getElementById('descripcionProblema').value
  };

  // Guardar la solicitud temporalmente en localStorage
  let bd = JSON.parse(localStorage.getItem('bdSolicitudes')) || [];
  bd.push(solicitud);
  localStorage.setItem('bdSolicitudes', JSON.stringify(bd));

  // Validación de los campos
  if (!validarCorreo(correo)) {
    alert('El correo debe ser institucional (@unal.edu.co)');
    eliminarSolicitud(solicitud.numeroCaso);  // Eliminar la solicitud si el correo no es válido
    return;
  }

  if (!validarNumerico(numEquipo)) {
    alert('Número de equipo debe ser numérico');
    eliminarSolicitud(solicitud.numeroCaso);  // Eliminar la solicitud si el número de equipo no es válido
    return;
  }

  if (!validarNumerico(placaEquipo)) {
    alert('Placa del equipo debe ser numérica');
    eliminarSolicitud(solicitud.numeroCaso);  // Eliminar la solicitud si la placa no es válida
    return;
  }

  if (!validarNumerico(contacto)) {
    alert('Número de contacto debe ser numérico');
    eliminarSolicitud(solicitud.numeroCaso);  // Eliminar la solicitud si el número de contacto no es válido
    return;
  }

  if (!confirm('¿Estás seguro de guardar esta solicitud?')) {
    eliminarSolicitud(solicitud.numeroCaso);  // Eliminar la solicitud si no se confirma
    return;
  }

  if (!validarCamposObligatorios()) {
    alert('Por favor completa todos los campos obligatorios marcados con *');
    eliminarSolicitud(solicitud.numeroCaso);  // Eliminar la solicitud si faltan campos obligatorios
    return;
  }

  agregarFilaATabla(solicitud);
  inicializarFormulario();
}

// Función para eliminar la solicitud de localStorage si no es válida
function eliminarSolicitud(numeroCaso) {
  let bd = JSON.parse(localStorage.getItem('bdSolicitudes')) || [];
  bd = bd.filter(item => item.numeroCaso !== numeroCaso);
  localStorage.setItem('bdSolicitudes', JSON.stringify(bd));
}
