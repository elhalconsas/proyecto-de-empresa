document.addEventListener('DOMContentLoaded', function () {
  inicializarFormulario();
  cargarDesdeAlmacenamiento();
});

// Inicializa fecha y códigos únicos
function inicializarFormulario() {
  const fechaActual = new Date().toLocaleDateString();
  const numeroCaso = 'CAS-' + Math.floor(1000 + Math.random() * 9000);
  const numeroSolicitud = 'SOL-' + Math.floor(1000 + Math.random() * 9000);

  document.getElementById('fechaSolicitud').value = fechaActual;
  document.getElementById('numeroCaso').value = numeroCaso;
  document.getElementById('numeroSolicitud').value = numeroSolicitud;
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
    'descripcionProblema'
  ];

  return campos.every(id => {
    const campo = document.getElementById(id);
    return campo && campo.value.trim() !== '';
  });
}


// Cargar desde "archivo" (localStorage)
function cargarDesdeAlmacenamiento() {
  const solicitudes = JSON.parse(localStorage.getItem('bdSolicitudes')) || [];
  solicitudes.forEach(solicitud => {
    agregarFilaATabla(solicitud);
  });
}

// Guardar nueva solicitud
function guardarSolicitud() {
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
  btnAgregar.textContent = 'Agregar';
 btnAgregar.onclick = () => {
  if (selector.value === 'Seleccione técnico') {
    alert('Selecciona un técnico válido');
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
