// Estado de la ruta mostrada en el modal para poder recalcular por criterio
let rutaModalState = {
    origen: null,
    destino: null,
    criterio: "inverso"
};

// Calcular ruta y resaltar en el grafo
function calcularRuta() {
    const origen = document.getElementById("origen").value;
    const destino = document.getElementById("destino").value;
    const criterio = document.getElementById("criterio_costo").value;
    
    if(!origen || !destino) {
        alert("Selecciona origen y destino.");
        return;
    }

    // Verificar que el grafo está listo
    if (!cy) {
        alert("El grafo se está cargando... Intenta de nuevo en unos segundos.");
        return;
    }

    rutaModalState = { origen, destino, criterio };
    fetchRuta(origen, destino, criterio);
}

function fetchRuta(origen, destino, criterio) {
    fetch(`/ruta?origen=${origen}&destino=${destino}&criterio=${criterio}`)
        .then(res => res.json())
        .then(data => {
            if(data.error) {
                alert("No existe relación entre estos nodos.");
                if(cy) limpiarHighlight();
                return;
            }
            
            rutaModalState = { origen, destino, criterio };
            renderRutaModal(data, criterio);
        })
        .catch(err => {
            alert("Error: " + err.message);
            if(cy) limpiarHighlight();
        });
}

function renderRutaModal(data, criterio) {
    // Mostrar resultado en popup mejorado
    let html = `<div style="background: rgba(46, 204, 64, 0.15); padding: 20px; border-radius: 10px; margin: 15px 0; border-left: 4px solid #2ECC40;">`;
            
            html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">`;
            html += `<div>`;
            html += `<p style="margin: 0; color: #a0c4d4; font-size: 12px;">ORIGEN</p>`;
            html += `<p style="margin: 5px 0 0 0; color: #2ECC40; font-weight: bold; font-size: 16px;">${data.camino[0].nombre}</p>`;
            html += `</div>`;
            html += `<div>`;
            html += `<p style="margin: 0; color: #a0c4d4; font-size: 12px;">DESTINO</p>`;
            html += `<p style="margin: 5px 0 0 0; color: #2ECC40; font-weight: bold; font-size: 16px;">${data.camino[data.camino.length - 1].nombre}</p>`;
            html += `</div>`;
            html += `</div>`;
            
            // Mostrar criterio usado
            const criterioTexto = criterio === "inverso" ? "Inverso (1/peso) - Menor resistencia" : "Directo (peso) - Menor influencia directa";
            html += `<p style="margin: 10px 0; color: #a0c4d4; font-size: 13px; text-align: center;"><strong>Criterio de Costo:</strong> ${criterioTexto}</p>`;
            
            html += `<div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin: 10px 0 20px 0; flex-wrap: wrap;">`;
            html += `<label style="color: #a0c4d4; font-size: 13px; margin: 0;">Cambiar criterio:</label>`;
            html += `<select id="modal_criterio_costo" style="padding: 8px 10px; border-radius: 6px; border: 1px solid #2f4c6f; background: rgba(15, 19, 24, 0.9); color: #a0c4d4;">`;
            html += `<option value="inverso" ${criterio === "inverso" ? "selected" : ""}>Inverso (1/peso) - Menor resistencia</option>`;
            html += `<option value="directo" ${criterio === "directo" ? "selected" : ""}>Directo (peso) - Menor influencia directa</option>`;
            html += `</select>`;
            html += `<button onclick="recalcularRutaModal()" style="padding: 10px 16px; border-radius: 7px; border: none; background: #667eea; color: white; cursor: pointer;">Recalcular</button>`;
            html += `</div>`;
            
            // Ruta visual
            html += `<h3 style="color: #667eea; margin-top: 0;">RUTA ENCONTRADA</h3>`;
            html += `<div style="background: rgba(15, 19, 24, 0.8); padding: 20px; border-radius: 8px; margin: 15px 0; overflow-x: auto;">`;
            html += `<div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">`;
            
            data.camino.forEach((nodo, idx) => {
                const tiposIconos = {
                    'medio': '[M]',
                    'candidato': '[C]',
                    'departamento': '[D]',
                    'franja_demografica': '[F]'
                };
                const icono = tiposIconos[nodo.tipo] || '[.]';
                
                html += `<span style="background: rgba(102, 126, 234, 0.2); padding: 8px 12px; border-radius: 6px; color: #a0c4d4; font-weight: bold;">
                    ${icono} ${nodo.nombre}
                </span>`;
                
                if(idx < data.camino.length - 1) {
                    html += `<span style="color: #667eea; font-weight: bold; font-size: 18px;">-></span>`;
                }
            });
            
            html += `</div>`;
            html += `</div>`;
            
            // Métricas
            html += `<h3 style="color: #667eea;">METRICAS</h3>`;
            html += `<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">`;
            
            html += `<div style="background: rgba(102, 126, 234, 0.1); padding: 15px; border-radius: 8px; text-align: center;">`;
            html += `<p style="margin: 0; color: #a0c4d4; font-size: 12px;">Costo Total</p>`;
            html += `<p style="margin: 5px 0 0 0; color: #667eea; font-weight: bold; font-size: 20px;">${data.costo_total.toFixed(4)}</p>`;
            html += `</div>`;
            
            html += `<div style="background: rgba(102, 126, 234, 0.1); padding: 15px; border-radius: 8px; text-align: center;">`;
            html += `<p style="margin: 0; color: #a0c4d4; font-size: 12px;">Numero de Pasos</p>`;
            html += `<p style="margin: 5px 0 0 0; color: #667eea; font-weight: bold; font-size: 20px;">${data.camino.length}</p>`;
            html += `</div>`;
            
            html += `<div style="background: rgba(102, 126, 234, 0.1); padding: 15px; border-radius: 8px; text-align: center;">`;
            html += `<p style="margin: 0; color: #a0c4d4; font-size: 12px;">Costo Promedio</p>`;
            html += `<p style="margin: 5px 0 0 0; color: #667eea; font-weight: bold; font-size: 20px;">${(data.costo_total / data.camino.length).toFixed(4)}</p>`;
            html += `</div>`;
            
            html += `</div>`;
            html += `</div>`;
            
            // Mostrar el popup
            const modal = document.getElementById('detalleModal');
            const content = document.getElementById('detalleContent');
            let contentHTML = `<h2>Ruta Optima Entre Actores</h2>`;
            contentHTML += html;
            content.innerHTML = contentHTML;
            modal.style.display = 'flex';
            
            // Resaltar nodos y aristas
            if(cy) {
                const nodos_ids = data.camino.map(n => n.id);
                resaltarRuta(nodos_ids);
            }
}

function recalcularRutaModal() {
    const criterioSelect = document.getElementById("modal_criterio_costo");
    const criterio = criterioSelect ? criterioSelect.value : rutaModalState.criterio;
    if (!rutaModalState.origen || !rutaModalState.destino) {
        alert("No hay ruta previa para recalcular.");
        return;
    }
    rutaModalState.criterio = criterio;
    fetchRuta(rutaModalState.origen, rutaModalState.destino, criterio);
}
