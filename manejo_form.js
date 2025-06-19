
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
    // Obtener valores del formulario
    const numeroSolicitud = document.getElementById('numeroSolicitud').value;
      const numeroCaso = document.getElementById('numeroCaso').value;
    const fechaSolicitud = document.getElementById('fechaSolicitud').value;
    const tipoSolicitante = document.querySelector('input[name="tipo_solicitante"]:checked')?.value || 'No especificado';
    const tipoSolicitud = document.getElementById('tipoSolicitud').value;
    const tipoServicio = document.getElementById('tipoServicio').value;
      const nombreLaboratorio = document.getElementById('nombreLaboratorio').value;
      const sede = document.getElementById('sede').value;
    const facultad = document.getElementById('facultad').value;
    const numeroIdentificacion = document.getElementById('numeroIdentificacion').value;
    const tipoIdentificacion = document.getElementById('tipoIdentificacion').value;

    
    if (!validarCamposObligatorios(nombreLaboratorio, sede, facultad, tipoSolicitud, tipoServicio, numeroIdentificacion, tipoIdentificacion)) {
        return;
    }

   
    agregarFilaATabla(numeroCaso, nombreLaboratorio, sede, facultad, tipoSolicitud);

    
    prepararNuevaSolicitud();
}

// Función para validar campos obligatorios
function validarCamposObligatorios(...campos) {
    if (campos.some(campo => !campo)) {
        alert('Por favor complete todos los campos obligatorios marcados con *');
        return false;
    }
    return true;
}


function agregarFilaATabla(numeroCaso, nombreLaboratorio, sede, facultad, tipoSolicitud) {
    const cuerpoTabla = document.getElementById('cuerpoTabla');
    const nuevaFila = cuerpoTabla.insertRow();// Crear una nueva fila en la tabla
    
    nuevaFila.insertCell(0).textContent = numeroCaso;
    nuevaFila.insertCell(1).textContent = nombreLaboratorio;
    nuevaFila.insertCell(2).textContent = sede //document.getElementById('sede').options[document.getElementById('sede').selectedIndex].text;
    nuevaFila.insertCell(3).textContent = facultad//document.getElementById('facultad').options[document.getElementById('facultad').selectedIndex].text;
    nuevaFila.insertCell(4).textContent = tipoSolicitud//document.getElementById('tipoSolicitud').options[document.getElementById('tipoSolicitud').selectedIndex].text;
    
    const celdaAcciones = nuevaFila.insertCell(5);
    const botonEliminar = document.createElement('button');
    botonEliminar.textContent = 'Eliminar';
    botonEliminar.className = 'action-btn delete-btn';
    botonEliminar.onclick = function() {
        cuerpoTabla.removeChild(nuevaFila);
    };
    celdaAcciones.appendChild(botonEliminar);
}

// Función para preparar nueva solicitud
function prepararNuevaSolicitud() {
    contadorCasos++;
    document.getElementById('numeroCaso').value = 'CAS-' + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('nombreLaboratorio').value = '';
}

// Evento cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    inicializarFormulario();
    
    // Asignar evento al botón Confirmar
    document.querySelector('input[value="Confirmar"]').addEventListener('click', agregarSolicitud);
});