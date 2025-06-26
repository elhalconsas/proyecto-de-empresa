
document.addEventListener('DOMContentLoaded', function() {
  actualizarContadores();
  
  function actualizarContadores() {
    const nuevas = JSON.parse(localStorage.getItem('bdSolicitudes')) || [];
    const enProceso = JSON.parse(localStorage.getItem('enProceso')) || [];
    const finalizadas = JSON.parse(localStorage.getItem('finalizadas')) || [];
    
    if (document.getElementById('contadorNuevas')) {
      document.getElementById('contadorNuevas').textContent = nuevas.length;
    }
    
    if (document.getElementById('contadorProceso')) {
      document.getElementById('contadorProceso').textContent = enProceso.length;
    }
    
    if (document.getElementById('contadorFinalizadas')) {
      document.getElementById('contadorFinalizadas').textContent = finalizadas.length;
    }
  }
  
  
  setInterval(actualizarContadores, 5000);
});