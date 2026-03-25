// Evento cuando selecciona origen
function configurarEventoOrigen() {
    document.getElementById("origen").addEventListener("change", function () {
        const origen = this.value;
        
        fetch(`/vecinos?nodo=${origen}`)
            .then(res => res.json())
            .then(vecinos => {
                vecinosActuales = vecinos;
                
                const tipoDestino = document.getElementById("tipo_destino");
                const destinoSelect = document.getElementById("destino");
                
                tipoDestino.disabled = false;
                destinoSelect.disabled = true;
                
                tipoDestino.innerHTML = '<option value="">Seleccionar tipo</option>';
                destinoSelect.innerHTML = '<option value="">Seleccionar destino</option>';
                
                if(vecinos.length === 0) {
                    document.getElementById("resultado").innerText = "No hay conexiones disponibles.";
                    return;
                }
                
                const tipos = [...new Set(vecinos.map(v => v.tipo))];
                
                tipos.forEach(t => {
                    tipoDestino.appendChild(new Option(t, t));
                });
            });
    });
}

// Evento cuando selecciona tipo de destino
function configurarEventoTipoDestino() {
    document.getElementById("tipo_destino").addEventListener("change", function () {
        const tipo = this.value;
        const destinoSelect = document.getElementById("destino");
        
        destinoSelect.innerHTML = '<option value="">Seleccionar destino</option>';
        destinoSelect.disabled = false;
        
        vecinosActuales
            .filter(v => v.tipo === tipo)
            .forEach(v => {
                destinoSelect.appendChild(new Option(v.nombre, v.id));
            });
    });
}

// Inicializar eventos de formularios
document.addEventListener("DOMContentLoaded", function () {
    configurarEventoOrigen();
    configurarEventoTipoDestino();
});
