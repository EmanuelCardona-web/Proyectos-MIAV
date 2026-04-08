// ═══════════════════════════════════════════════════════════════════
// FUNCIONES PARA RETOS INNOVADORES
// ═══════════════════════════════════════════════════════════════════

// Función auxiliar para mostrar resultados en popup mejorado
function mostrarResultadoEnPopup(titulo, contenido, icono = "") {
    const modal = document.getElementById('detalleModal');
    const content = document.getElementById('detalleContent');
    
    let html = `<h2>${icono} ${titulo}</h2>`;
    html += contenido;
    
    content.innerHTML = html;
    modal.style.display = 'flex';
}

// RETO 1: Comparar criterios de costo
function compararCriterios() {
    const origen = document.getElementById("origen").value;
    const destino = document.getElementById("destino").value;
    
    if (!origen || !destino) {
        alert("Selecciona origen y destino primero");
        return;
    }
    
    fetch(`/comparar_criterios?origen=${origen}&destino=${destino}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            
            let html = `<div style="background: rgba(102, 126, 234, 0.1); padding: 20px; border-radius: 10px; margin: 15px 0;">`;
            
            // Criterio 1
            html += `<h3 style="color: #667eea; margin-top: 0;">CRITERIO 1: Maximizar Influencia</h3>`;
            html += `<p style="color: #a0c4d4; font-size: 13px; border-left: 3px solid #667eea; padding-left: 10px;">
                <strong>Estrategia:</strong> costo = 1/peso (aristas fuertes = bajo costo)
            </p>`;
            if (data.criterio_1.existe_ruta) {
                html += `<div style="background: rgba(46, 204, 64, 0.15); padding: 15px; border-radius: 8px; margin: 10px 0;">`;
                html += `<p><strong>Ruta encontrada:</strong></p>`;
                html += `<p style="color: #2ECC40; font-weight: bold; font-size: 15px;">
                    ${data.criterio_1.camino.map(n => `<span style="background: rgba(46, 204, 64, 0.3); padding: 5px 10px; border-radius: 4px; margin: 0 3px; display: inline-block;">${n.nombre}</span>`).join(' -> ')}
                </p>`;
                html += `<p><strong>Costo Total:</strong> <span style="color: #2ECC40; font-weight: bold;">${data.criterio_1.costo_total.toFixed(4)}</span></p>`;
                html += `<p><strong>Pasos:</strong> ${data.criterio_1.camino.length}</p>`;
                html += `</div>`;
            } else {
                html += `<div style="background: rgba(255, 65, 54, 0.15); padding: 15px; border-radius: 8px; margin: 10px 0;">`;
                html += `<p style="color: #FF4136;"><strong>NO EXISTE RUTA</strong></p>`;
                html += `</div>`;
            }
            
            html += `<hr style="border: 1px solid rgba(102, 126, 234, 0.3); margin: 20px 0;">`;
            
            // Criterio 2
            html += `<h3 style="color: #764ba2;">CRITERIO 2: Minimizar Resistencia Directa</h3>`;
            html += `<p style="color: #a0c4d4; font-size: 13px; border-left: 3px solid #764ba2; padding-left: 10px;">
                <strong>Estrategia:</strong> costo = peso original (evitar pesos altos)
            </p>`;
            if (data.criterio_2.existe_ruta) {
                html += `<div style="background: rgba(46, 204, 64, 0.15); padding: 15px; border-radius: 8px; margin: 10px 0;">`;
                html += `<p><strong>Ruta encontrada:</strong></p>`;
                html += `<p style="color: #2ECC40; font-weight: bold; font-size: 15px;">
                    ${data.criterio_2.camino.map(n => `<span style="background: rgba(46, 204, 64, 0.3); padding: 5px 10px; border-radius: 4px; margin: 0 3px; display: inline-block;">${n.nombre}</span>`).join(' -> ')}
                </p>`;
                html += `<p><strong>Costo Total:</strong> <span style="color: #2ECC40; font-weight: bold;">${data.criterio_2.costo_total.toFixed(4)}</span></p>`;
                html += `<p><strong>Pasos:</strong> ${data.criterio_2.camino.length}</p>`;
                html += `</div>`;
            } else {
                html += `<div style="background: rgba(255, 65, 54, 0.15); padding: 15px; border-radius: 8px; margin: 10px 0;">`;
                html += `<p style="color: #FF4136;"><strong>NO EXISTE RUTA</strong></p>`;
                html += `</div>`;
            }
            
            html += `<hr style="border: 1px solid rgba(102, 126, 234, 0.3); margin: 20px 0;">`;
            
            // Análisis Comparativo
            html += `<h3 style="color: #FFD700;">ANÁLISIS COMPARATIVO</h3>`;
            if (data.caminos_diferentes) {
                html += `<div style="background: rgba(255, 215, 0, 0.15); padding: 15px; border-radius: 8px; border-left: 4px solid #FFD700;">`;
                html += `<p style="color: #FFD700; font-weight: bold;">LOS CAMINOS SON DIFERENTES</p>`;
                html += `<p style="color: #a0c4d4;">El criterio de optimización <strong>SÍ AFECTA</strong> el resultado.</p>`;
                html += `<p style="color: #a0c4d4; font-size: 12px; margin-top: 10px;">Esto significa que la estrategia de cálculo de costos es determinante para encontrar diferentes rutas.</p>`;
                html += `</div>`;
            } else if (data.caminos_diferentes === false) {
                html += `<div style="background: rgba(46, 204, 64, 0.15); padding: 15px; border-radius: 8px; border-left: 4px solid #2ECC40;">`;
                html += `<p style="color: #2ECC40; font-weight: bold;">LOS CAMINOS SON IGUALES</p>`;
                html += `<p style="color: #a0c4d4;">El criterio de optimización <strong>NO AFECTA</strong> en este caso.</p>`;
                html += `<p style="color: #a0c4d4; font-size: 12px; margin-top: 10px;">Ambas estrategias conducen al mismo resultado óptimo.</p>`;
                html += `</div>`;
            }
            
            mostrarResultadoEnPopup("Comparación de Criterios", html);
        });
}

// RETO 2: Mostrar centralidad (intermediación)
function mostrarCentralidad() {
    fetch("/centralidad")
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            
            let html = `<div style="background: rgba(255, 215, 0, 0.15); padding: 20px; border-radius: 10px; margin: 15px 0; border-left: 4px solid #FFD700;">`;
            html += `<p style="color: #a0c4d4;" ><strong>Pregunta:</strong> ¿Qué candidato es intermediario clave?</p>`;
            html += `<p style="color: #a0c4d4;"><strong>Metrica:</strong> Betweenness Centrality</p>`;
            html += `<p style="color: #a0c4d4; font-size: 12px;">Indica qué tan frecuentemente aparece un nodo en los caminos óptimos entre otros nodos.</p>`;
            html += `</div>`;
            
            html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">`;
            
            // Top 3
            data.centralidades.slice(0, 3).forEach((nodo, idx) => {
                const colores = ['#FFD700', '#C0C0C0', '#CD7F32'];
                const medallas = ['[1]', '[2]', '[3]'];
                html += `<div style="background: rgba(${idx === 0 ? '255, 215, 0' : idx === 1 ? '192, 192, 192' : '205, 127, 50'}, 0.2); padding: 15px; border-radius: 8px; border-left: 4px solid ${colores[idx]};">`;
                html += `<p style="margin: 0; font-size: 14px; color: ${colores[idx]}; font-weight: bold;">${medallas[idx]} ${nodo.nombre}</p>`;
                html += `<p style="margin: 5px 0 0 0; color: #a0c4d4; font-size: 12px;"><strong>Centralidad:</strong> ${nodo.betweenness}</p>`;
                html += `<p style="margin: 5px 0 0 0; color: #a0c4d4; font-size: 11px;">${nodo.interpretacion}</p>`;
                html += `</div>`;
            });
            
            html += `</div>`;
            
            // Lista completa
            html += `<h3 style="color: #667eea; margin-top: 25px;">TOP 15 COMPLETO</h3>`;
            html += `<div style="background: rgba(15, 19, 24, 0.8); padding: 15px; border-radius: 8px; max-height: 300px; overflow-y: auto;">`;
            
            data.centralidades.forEach((nodo, idx) => {
                html += `<div style="padding: 10px; border-bottom: 1px solid rgba(102, 126, 234, 0.2);">`;
                html += `<p style="margin: 0; color: #667eea; font-weight: bold;">${idx + 1}. ${nodo.nombre}</p>`;
                html += `<p style="margin: 5px 0 0 0; color: #a0c4d4; font-size: 12px;"><strong>Centralidad:</strong> ${nodo.betweenness}</p>`;
                html += `<p style="margin: 5px 0 0 0; color: #a0c4d4; font-size: 11px;">- ${nodo.interpretacion}</p>`;
                html += `</div>`;
            });
            
            html += `</div>`;
            
            mostrarResultadoEnPopup("Intermediarios Clave", html);
        });
}

// RETO 2: Mostrar accesibilidad desde un medio
function mostrarAccesibilidad() {
    const medio_id = document.getElementById("medio_accesibilidad").value;
    
    if (!medio_id) {
        alert("Selecciona un medio primero");
        return;
    }
    
    fetch(`/accesibilidad_desde_medio?medio_id=${medio_id}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            
            let html = `<div style="background: rgba(102, 126, 234, 0.1); padding: 20px; border-radius: 10px; margin: 15px 0; border-left: 4px solid #FFD700;">`;
            html += `<p style="color: #a0c4d4; font-size: 14px;"><strong>Medio:</strong> ${data.medio.nombre}</p>`;
            html += `<p style="color: #a0c4d4; font-size: 12px;">Analizando el alcance desde este medio a todos los departamentos.</p>`;
            html += `</div>`;
            
            // Extremos
            if (data.mas_accesible) {
                html += `<div style="background: rgba(46, 204, 64, 0.15); padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2ECC40;">`;
                html += `<p style="color: #2ECC40; font-weight: bold; font-size: 15px;">MAS ACCESIBLE</p>`;
                html += `<p style="color: #fff; font-weight: bold; margin: 10px 0;">${data.mas_accesible.nombre}</p>`;
                html += `<p style="color: #a0c4d4;"><strong>Costo:</strong> ${data.mas_accesible.costo_total} | <strong>Pasos:</strong> ${data.mas_accesible.longitud_camino}</p>`;
                html += `<p style="color: #a0c4d4; font-size: 12px; border-left: 3px solid #2ECC40; padding-left: 10px; margin: 10px 0;"><strong>Ruta:</strong><br> ${data.mas_accesible.camino.map(n => n.nombre).join(" -> ")}</p>`;
                html += `</div>`;
            }
            
            if (data.menos_accesible) {
                html += `<div style="background: rgba(255, 65, 54, 0.15); padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #FF4136;">`;
                html += `<p style="color: #FF4136; font-weight: bold; font-size: 15px;">MENOS ACCESIBLE</p>`;
                html += `<p style="color: #fff; font-weight: bold; margin: 10px 0;">${data.menos_accesible.nombre}</p>`;
                html += `<p style="color: #a0c4d4;"><strong>Costo:</strong> ${data.menos_accesible.costo_total} | <strong>Pasos:</strong> ${data.menos_accesible.longitud_camino}</p>`;
                html += `<p style="color: #a0c4d4; font-size: 12px; border-left: 3px solid #FF4136; padding-left: 10px; margin: 10px 0;"><strong>Ruta:</strong><br> ${data.menos_accesible.camino.map(n => n.nombre).join(" -> ")}</p>`;
                html += `</div>`;
            }
            
            // Lista de departamentos
            html += `<h3 style="color: #667eea; margin-top: 25px;">TODOS LOS ${data.departamentos_alcanzables.length} DEPARTAMENTOS</h3>`;
            html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-height: 400px; overflow-y: auto;">`;
            
            data.departamentos_alcanzables.forEach((dept, idx) => {
                const icono = idx === 0 ? "." : idx === data.departamentos_alcanzables.length - 1 ? "!" : ".";
                const esUltimo = idx === data.departamentos_alcanzables.length - 1;
                const borderColor = esUltimo ? "#FF4136" : idx === 0 ? "#2ECC40" : "#FFB800";
                
                html += `<div style="background: rgba(15, 19, 24, 0.6); padding: 12px; border-radius: 6px; border-left: 3px solid ${borderColor};">`;
                html += `<p style="margin: 0; color: #fff; font-weight: bold; font-size: 13px;">${icono} ${dept.nombre}</p>`;
                html += `<p style="margin: 5px 0 0 0; color: #a0c4d4; font-size: 11px;">Costo: ${dept.costo_total} | Pasos: ${dept.longitud_camino}</p>`;
                html += `</div>`;
            });
            
            html += `</div>`;
            
            mostrarResultadoEnPopup("Árbol de Alcance desde Medio", html);
        });
}

// RETO 3: Análisis de resiliencia
function mostrarResiliencia() {
    fetch("/resiliencia")
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            
            let html = `<div style="background: rgba(102, 126, 234, 0.1); padding: 20px; border-radius: 10px; margin: 15px 0;">`;
            html += `<p style="color: #a0c4d4;"><strong>Pregunta:</strong> ¿Qué candidato es más crítico para la red?</p>`;
            html += `<p style="color: #a0c4d4; font-size: 12px;">Se simula la eliminación de cada candidato y se mide el impacto en la conectividad.</p>`;
            html += `</div>`;
            
            // Respuestas clave de resiliencia
            if (data.respuesta_eliminacion_individual) {
                html += `<div style="background: rgba(46, 204, 64, 0.08); padding: 15px; border-radius: 10px; margin: 15px 0; border-left: 4px solid #2ECC40;">`;
                html += `<p style="margin: 0; color: #2ECC40; font-weight: bold;">¿Qué pasa al eliminar un candidato?</p>`;
                html += `<p style="margin: 8px 0 0 0; color: #a0c4d4; font-size: 13px;">${data.respuesta_eliminacion_individual}</p>`;
                html += `</div>`;
            }
            if (data.porcentaje_conectividad_sin_candidatos !== undefined) {
                html += `<div style="background: rgba(255, 65, 54, 0.08); padding: 15px; border-radius: 10px; margin: 15px 0; border-left: 4px solid #FF4136;">`;
                html += `<p style="margin: 0; color: #FF4136; font-weight: bold;">¿Qué pasa al eliminar todos los candidatos?</p>`;
                html += `<p style="margin: 8px 0 0 0; color: #a0c4d4; font-size: 13px;">${data.respuesta_eliminacion_todos}</p>`;
                html += `<p style="margin: 8px 0 0 0; color: #a0c4d4; font-size: 11px;"><strong>Conectividad restante:</strong> ${data.porcentaje_conectividad_sin_candidatos}%</p>`;
                html += `</div>`;
            }
            
            // Nodo más crítico
            if (data.candidato_mas_critico) {
                const criticidad = data.candidato_mas_critico.criticidad;
                let colorCriticidad = "#2ECC40";
                let iconoCriticidad = "[ok]";
                if(criticidad === "ALTA") {
                    colorCriticidad = "#FF4136";
                    iconoCriticidad = "[!!]";
                } else if(criticidad === "MEDIA") {
                    colorCriticidad = "#FFB800";
                    iconoCriticidad = "[!]";
                }
                
                html += `<div style="background: rgba(${criticidad === 'ALTA' ? '255, 65, 54' : criticidad === 'MEDIA' ? '255, 184, 0' : '46, 204, 64'}, 0.15); padding: 20px; border-radius: 10px; margin: 15px 0; border-left: 4px solid ${colorCriticidad};">`;
                html += `<p style="color: ${colorCriticidad}; font-weight: bold; font-size: 16px; margin-top: 0;">${iconoCriticidad} NODO MAS CRITICO</p>`;
                html += `<p style="color: #fff; font-weight: bold; font-size: 18px; margin: 10px 0;">${data.candidato_mas_critico.candidato_eliminado.nombre}</p>`;
                html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">`;
                html += `<div>`;
                html += `<p style="margin: 0; color: #a0c4d4; font-size: 12px;">Conectividad Residual</p>`;
                html += `<p style="margin: 5px 0 0 0; color: ${colorCriticidad}; font-weight: bold; font-size: 20px;">${data.candidato_mas_critico.tasa_conectividad_pct}%</p>`;
                html += `</div>`;
                html += `<div>`;
                html += `<p style="margin: 0; color: #a0c4d4; font-size: 12px;">Nivel de Criticidad</p>`;
                html += `<p style="margin: 5px 0 0 0; color: ${colorCriticidad}; font-weight: bold; font-size: 20px;">${criticidad}</p>`;
                html += `</div>`;
                html += `</div>`;
                html += `</div>`;
            }
            
            // Simulación completa
            html += `<h3 style="color: #667eea; margin-top: 25px;">SIMULACION COMPLETA</h3>`;
            html += `<p style="color: #a0c4d4; font-size: 12px; margin-bottom: 15px;">Eliminando cada candidato uno a uno:</p>`;
            
            html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-height: 350px; overflow-y: auto;">`;
            
            data.simulaciones.forEach((sim) => {
                let colorIcon = "#2ECC40";
                let icono = "[ok]";
                if(sim.criticidad === "ALTA") {
                    colorIcon = "#FF4136";
                    icono = "[!!]";
                } else if(sim.criticidad === "MEDIA") {
                    colorIcon = "#FFB800";
                    icono = "[!]";
                }
                
                html += `<div style="background: rgba(15, 19, 24, 0.8); padding: 15px; border-radius: 8px; border-left: 3px solid ${colorIcon};">`;
                html += `<p style="margin: 0; color: #fff; font-weight: bold; font-size: 13px;">${icono} ${sim.candidato_eliminado.nombre}</p>`;
                html += `<p style="margin: 8px 0 0 0; color: #a0c4d4; font-size: 11px;"><strong>Conectividad:</strong> ${sim.tasa_conectividad_pct}%</p>`;
                html += `<p style="margin: 5px 0 0 0; color: #a0c4d4; font-size: 11px;"><strong>Rutas activas:</strong> ${sim.rutas_medios_dept}/${sim.total_posibles}</p>`;
                html += `<p style="margin: 5px 0 0 0; color: #a0c4d4; font-size: 11px;"><strong>Componentes:</strong> ${sim.componentes_desconectadas}</p>`;
                html += `</div>`;
            });
            
            html += `</div>`;
            
            mostrarResultadoEnPopup("Analisis de Resiliencia de la Red", html);
        });
}

// Cargar selectores de medios cuando la página carga
document.addEventListener("DOMContentLoaded", function() {
    fetch("/nodos")
        .then(res => res.json())
        .then(nodos => {
            const medios = nodos
                .filter(n => n.tipo === "medio")
                .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
            const select = document.getElementById("medio_accesibilidad");
            
            medios.forEach(medio => {
                const option = document.createElement("option");
                option.value = medio.id;
                option.textContent = medio.nombre;
                select.appendChild(option);
            });
        });
});
