document.addEventListener('DOMContentLoaded', function() {
  // Contar solicitudes en cada estado
  const nuevas = JSON.parse(localStorage.getItem('bdSolicitudes')) || [];
  const enProceso = JSON.parse(localStorage.getItem('enProceso')) || [];
  const finalizadas = JSON.parse(localStorage.getItem('finalizadas')) || [];
  
  document.getElementById('contadorNuevas').textContent = nuevas.length;
  document.getElementById('contadorProceso').textContent = enProceso.length;
  document.getElementById('contadorFinalizadas').textContent = finalizadas.length;
});