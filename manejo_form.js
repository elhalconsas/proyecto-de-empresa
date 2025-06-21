function obtenerFechaActual() {
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, '0');
  const mes = String(hoy.getMonth() + 1).padStart(2, '0'); 
  const año = hoy.getFullYear();
  return `${dia}-${mes}-${año}`;
}

let contadorCasos = 1;

function inicializarFormulario() {
  document.getElementById('fechaSolicitud').value = obtenerFechaActual();
  document.getElementById('numeroSolicitud').value = 'SOL-' + Math.floor(1000 + Math.random() * 9000);
  document.getElementById('numeroCaso').value = 'CAS-' + Math.floor(1000 + Math.random() * 9000);
}

function agregarSolicitud() {

  const nombreLaboratorio = document.getElementById('nombreLaboratorio').value;
  const bloque = document.getElementById('NumBloque').value;
  const facultad = document.getElementById('facultad').value;
  const salon = document.getElementById('numSalon').value;
  const correoElectronico = document.getElementById('correoElectronico').value;
  const numeroContacto = document.getElementById('numeroContacto').value;
  const numEquipo = document.getElementById('numEquipo').value;
  const placaEquipo = document.getElementById('placaEquipo').value;
  const tipoEquipo = document.getElementById('tipoEquipo').value;
  const descripcionProblema = document.getElementById('descripcionProblema').value;

  // Validar campos obligatorios
  if (!validarCamposObligatorios(
    nombreLaboratorio,
    bloque,
    facultad,
    salon,
    correoElectronico,
    numeroContacto,
    numEquipo,
    placaEquipo,
    tipoEquipo,
    descripcionProblema
  )) {
    return;
  }

  
  agregarFilaATabla(
    document.getElementById('numeroCaso').value,
    nombreLaboratorio,
    bloque,
    facultad,
    tipoEquipo
  );

  prepararNuevaSolicitud();
}

function validarCamposObligatorios(...campos) {
  if (campos.some(campo => !campo)) {
    alert('Por favor complete todos los campos obligatorios marcados con *');
    return false;
  }
  return true;
}


function agregarFilaATabla(numeroCaso, nombreLaboratorio, bloque, facultad, tipoEquipo) {
  const cuerpoTabla = document.getElementById('cuerpoTabla');
  const nuevaFila = cuerpoTabla.insertRow();

  nuevaFila.insertCell(0).textContent = numeroCaso;
  nuevaFila.insertCell(1).textContent = nombreLaboratorio;
  nuevaFila.insertCell(2).textContent = bloque;
  nuevaFila.insertCell(3).textContent = facultad;
  nuevaFila.insertCell(4).textContent = tipoEquipo;

  
  const celdaAcciones = nuevaFila.insertCell(5);
  celdaAcciones.style.display = 'flex';
  celdaAcciones.style.gap = '5px';
  celdaAcciones.style.alignItems = 'center';

  
  const selectorTecnicos = document.createElement('select');
  selectorTecnicos.className = 'form-input';
  selectorTecnicos.style.width = '126px';
  
 
  const opciones = [
    {value: '', text: 'Asignar técnico...'},
    {value: 'tecnico1', text: 'Nombre1'},
    {value: 'tecnico2', text: 'Nombre2'},
    {value: 'tecnico3', text: 'Nombre3'},
    {value: 'tecnico4', text: 'Nombre4'},
    {value: 'tecnico5', text: 'Nombre5'}
  ];
  
  
  opciones.forEach(opcion => {
    const optionElement = document.createElement('option');
    optionElement.value = opcion.value;
    optionElement.textContent = opcion.text;
    selectorTecnicos.appendChild(optionElement);
  });

  
  const botonEliminar = document.createElement('button');
  botonEliminar.textContent = 'Eliminar';
  botonEliminar.className = 'action-btn delete-btn';
  botonEliminar.onclick = function() {
    cuerpoTabla.removeChild(nuevaFila);
  };

  
  celdaAcciones.appendChild(selectorTecnicos);
  celdaAcciones.appendChild(botonEliminar);

  
  selectorTecnicos.addEventListener('change', function() {
    if(this.value) {
      console.log(`Técnico asignado: ${this.options[this.selectedIndex].text}`);
    }
  });
}



function prepararNuevaSolicitud() {
  contadorCasos++;
  document.getElementById('numeroCaso').value = 'CAS-' + Math.floor(1000 + Math.random() * 9000);
  // Limpiar campos
  document.getElementById('nombreLaboratorio').value = '';
  document.getElementById('NumBloque').value = '';
  document.getElementById('numSalon').value = '';
  document.getElementById('numEquipo').value = '';
  document.getElementById('placaEquipo').value = '';
  document.getElementById('descripcionProblema').value = '';
}


document.addEventListener('DOMContentLoaded', function() {
  inicializarFormulario();
  
  
  document.querySelector('input[value="Confirmar"]').addEventListener('click', agregarSolicitud);

});