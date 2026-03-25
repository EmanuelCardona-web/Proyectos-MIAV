// Variables globales
let todosLosNodos = [];
let vecinosActuales = [];
let cy;

// Cargar nodos y tipos
function cargarNodos() {
    fetch("/nodos")
        .then(res => res.json())
        .then(nodos => {
            todosLosNodos = nodos;
            
            const tipos = [...new Set(nodos.map(n => n.tipo))];
            const tipoOrigen = document.getElementById("tipo_origen");
            
            tipos.forEach(tipo => {
                tipoOrigen.appendChild(new Option(tipo, tipo));
            });
        });
}

// Seleccionar tipo de origen
function configurarEventosTipoOrigen() {
    document.getElementById("tipo_origen").addEventListener("change", function () {
        const tipo = this.value;
        const origenSelect = document.getElementById("origen");
        
        origenSelect.innerHTML = "";
        
        todosLosNodos
            .filter(n => n.tipo === tipo)
            .forEach(n => {
                origenSelect.appendChild(new Option(n.nombre, n.id));
            });
    });
}

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    cargarNodos();
    configurarEventosTipoOrigen();
});
