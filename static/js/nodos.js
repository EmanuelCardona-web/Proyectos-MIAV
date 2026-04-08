// Variables globales
let todosLosNodos = [];
let vecinosActuales = [];

// Cargar nodos y tipos
function cargarNodos() {
    fetch("/nodos")
        .then(res => res.json())
        .then(nodos => {
            todosLosNodos = nodos;
            
            const tipoOrigen = document.getElementById("tipo_origen");
            
            // Agregar opción inicial (placeholder)
            tipoOrigen.innerHTML = '<option value="">Seleccionar tipo de origen</option>';
            tipoOrigen.disabled = false;  // Habilitar el desplegable
            
            // Solo permitir tipos de origen que tienen aristas salientes
            const tiposOrigenValidos = ["medio", "candidato"];
            
            tiposOrigenValidos.forEach(tipo => {
                const existe = nodos.some(n => n.tipo === tipo);
                if (existe) {
                    tipoOrigen.appendChild(new Option(tipo, tipo));
                }
            });
        })
        .catch(err => console.error("Error al cargar nodos:", err));
}

// Seleccionar tipo de origen
function configurarEventosTipoOrigen() {
    document.getElementById("tipo_origen").addEventListener("change", function () {
        const tipo = this.value;
        const origenSelect = document.getElementById("origen");
        
        if (!tipo) {
            // Si no hay tipo seleccionado, limpiar el desplegable
            origenSelect.innerHTML = '<option value="">Seleccionar origen</option>';
            origenSelect.disabled = true;
            return;
        }
        
        origenSelect.innerHTML = '<option value="">Seleccionar origen</option>';
        origenSelect.disabled = false;
        
        const opcionesOrdenadas = todosLosNodos
            .filter(n => n.tipo === tipo)
            .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));

        opcionesOrdenadas.forEach(n => {
            origenSelect.appendChild(new Option(n.nombre, n.id));
        });
    });
}

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    cargarNodos();
    configurarEventosTipoOrigen();
});
