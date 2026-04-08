// Variable global para Cytoscape
let cy;

// Cargar y inicializar grafo con Cytoscape
function cargarGrafo() {
    console.log('Iniciando carga de grafo...');
    fetch("/grafo")
        .then(res => res.json())
        .then(data => {
            console.log('Datos recibidos:', data.length, 'elementos');
            
            const container = document.getElementById('grafo');
            console.log('Contenedor:', container);
            
            cy = cytoscape({
                container: container,
                elements: data,
                minZoom: 0.5,
                maxZoom: 2,
                wheelSensitivity: 1,
                zoomingEnabled: true,
                
                style: [
                    {
                        selector: 'node',
                        style: {
                            'label': 'data(label)',
                            'font-size': '11px',
                            'font-weight': 'bold',
                            'color': '#fff',
                            'text-valign': 'center',
                            'text-halign': 'center',
                            'border-width': 2,
                            'border-color': '#fff',
                            'width': 40,
                            'height': 40,
                            'text-wrap': 'wrap',
                            'text-max-width': '60px',
                            'background-opacity': 0.95,
                            'shadow-blur': 8,
                            'shadow-color': 'rgba(0,0,0,0.3)',
                            'shadow-offset-x': 2,
                            'shadow-offset-y': 2
                        }
                    },
                    {
                        selector: '[tipo = "medio"]',
                        style: {
                            'background-color': '#0074D9',
                            'shape': 'circle'
                        }
                    },
                    {
                        selector: '[tipo = "candidato"]',
                        style: {
                            'background-color': '#2ECC40',
                            'shape': 'diamond',
                            'width': 45,
                            'height': 45
                        }
                    },
                    {
                        selector: '[tipo = "departamento"]',
                        style: {
                            'background-color': '#FF4136',
                            'shape': 'square'
                        }
                    },
                    {
                        selector: '[tipo = "franja_demografica"]',
                        style: {
                            'background-color': '#FF9500',
                            'shape': 'triangle'
                        }
                    },
                    {
                        selector: 'edge',
                        style: {
                            'width': 2,
                            'line-color': '#667eea',
                            'target-arrow-shape': 'none',
                            'curve-style': 'bezier',
                            'opacity': 0.6,
                            'shadow-blur': 4,
                            'shadow-color': 'rgba(102, 126, 234, 0.3)',
                            'shadow-offset-x': 1,
                            'shadow-offset-y': 1
                        }
                    },
                    {
                        selector: '.highlight',
                        style: {
                            'background-color': '#FFD700',
                            'line-color': '#FF6B00',
                            'opacity': 1,
                            'width': 50,
                            'height': 50,
                            'border-width': 3,
                            'border-color': '#FF6B00',
                            'z-index': 10,
                            'shadow-blur': 12,
                            'shadow-color': 'rgba(255, 107, 0, 0.5)',
                            'shadow-offset-x': 3,
                            'shadow-offset-y': 3
                        }
                    },
                    {
                        selector: '.dim',
                        style: {
                            'opacity': 0.15
                        }
                    }
                ],
                
                layout: {
                    name: 'concentric',
                    directed: true,
                    animate: false,
                    mindist: 50,
                    startAngle: 4.71,
                    sweep: 6.28,
                    concentric: function(node) {
                        return 5 - node.degree();
                    },
                    levelWidth: function(nodes) {
                        return 150;
                    }
                }
            });
            
            // Permitir zoom y pan
            cy.userZoomingEnabled(true);
            cy.userPanningEnabled(true);
            cy.fit(undefined, 50);
            console.log('Grafo cargado exitosamente con', cy.nodes().length, 'nodos y', cy.edges().length, 'aristas');
        })
        .catch(err => {
            console.error('Error cargando grafo:', err);
        });
}

// Función para resaltar ruta
function resaltarRuta(nodos_ruta) {
    cy.elements().removeClass('highlight dim');
    cy.elements().addClass('dim');
    
    nodos_ruta.forEach(nodo => {
        cy.getElementById(nodo).removeClass('dim').addClass('highlight');
    });
    
    for (let i = 0; i < nodos_ruta.length - 1; i++) {
        const source = nodos_ruta[i];
        const target = nodos_ruta[i + 1];
        cy.edges().forEach(edge => {
            if (edge.source().id() === source && edge.target().id() === target) {
                edge.removeClass('dim').addClass('highlight');
            }
        });
    }
    
    cy.fit(cy.$('.highlight'), 50);
}

// Limpiar highlighting
function limpiarHighlight() {
    if(cy) {
        cy.elements().removeClass('highlight dim');
    }
}

// Mostrar popup detallado al clickear nodo
function mostrarDetalleNodo(nodo) {
    const modal = document.getElementById('detalleModal');
    const content = document.getElementById('detalleContent');
    
    // Información por tipo de nodo
    const iconosTipo = {
        'medio': 'M',
        'candidato': 'C',
        'departamento': 'D',
        'franja_demografica': 'F'
    };
    
    const tipo = nodo.data('tipo');
    const icono = iconosTipo[tipo] || '-';
    
    let html = `<h2>[${icono}] ${nodo.data('label')}</h2>`;
    
    // Información básica
    let html_info = `<div style="background: rgba(102, 126, 234, 0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">`;
    html_info += `<p><strong>ID:</strong> <code style="background: #0f1318; padding: 4px 8px; border-radius: 4px; color: #2ECC40; font-family: monospace;">${nodo.id()}</code></p>`;
    html_info += `<p><strong>Tipo:</strong> <span style="background: #2a6a7a; padding: 5px 12px; border-radius: 20px; display: inline-block;">${tipo.replace('_', ' ').toUpperCase()}</span></p>`;
    html_info += `</div>`;
    
    // Si es candidato, mostrar información de intermediación
    if(tipo === 'candidato' && nodo.data('betweenness_label')) {
        const betweenness = nodo.data('betweenness_label');
        html_info += `<div style="background: rgba(255, 215, 0, 0.15); padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #FFD700;">`;
        html_info += `<p style="color: #FFD700; font-weight: bold; font-size: 16px;">INTERMEDIACION</p>`;
        html_info += `<p style="margin: 10px 0;"><strong>Porcentaje:</strong> <span style="color: #FFD700; font-size: 20px; font-weight: bold;">${betweenness}</span></p>`;
        html_info += `<p style="color: #a0c4d4; font-size: 13px; margin: 10px 0;">Este candidato aparece en el <strong>${betweenness}</strong> de todos los caminos óptimos en la red. Un valor alto indica que es un actor clave para la comunicación electoral.</p>`;
        html_info += `</div>`;
    }
    
    // Conexiones entrantes
    const entrada = cy.edges().filter(e => e.target().id() === nodo.id());
    if(entrada.length > 0) {
        html_info += `<h3>CONEXIONES ENTRANTES (${entrada.length})</h3>`;
        html_info += `<ul>`;
        entrada.forEach(e => {
            const source = e.source().data('label');
            const sourceType = e.source().data('tipo');
            const sourceIcon = iconosTipo[sourceType] || '-';
            html_info += `<li><strong>[${sourceIcon}] ${source}</strong> -> ${nodo.data('label')}</li>`;
        });
        html_info += `</ul>`;
    }
    
    // Conexiones salientes
    const salida = cy.edges().filter(e => e.source().id() === nodo.id());
    if(salida.length > 0) {
        html_info += `<h3>CONEXIONES SALIENTES (${salida.length})</h3>`;
        html_info += `<ul>`;
        salida.forEach(e => {
            const target = e.target().data('label');
            const targetType = e.target().data('tipo');
            const targetIcon = iconosTipo[targetType] || '-';
            html_info += `<li>${nodo.data('label')} -> <strong>[${targetIcon}] ${target}</strong></li>`;
        });
        html_info += `</ul>`;
    }
    
    // Estadísticas del nodo
    const totalEntrada = entrada.length;
    const totalSalida = salida.length;
    const totalConexiones = totalEntrada + totalSalida;
    
    html_info += `<h3>ESTADISTICAS</h3>`;
    html_info += `<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 15px 0;">`;
    html_info += `<div style="background: rgba(42, 138, 154, 0.2); padding: 15px; border-radius: 8px; text-align: center;">`;
    html_info += `<div style="font-size: 24px; font-weight: bold; color: #2a8a9a;">${totalEntrada}</div>`;
    html_info += `<div style="font-size: 12px; color: #a0c4d4; margin-top: 5px;">Conexiones Entrada</div>`;
    html_info += `</div>`;
    html_info += `<div style="background: rgba(42, 138, 154, 0.2); padding: 15px; border-radius: 8px; text-align: center;">`;
    html_info += `<div style="font-size: 24px; font-weight: bold; color: #2a8a9a;">${totalSalida}</div>`;
    html_info += `<div style="font-size: 12px; color: #a0c4d4; margin-top: 5px;">Conexiones Salida</div>`;
    html_info += `</div>`;
    html_info += `<div style="background: rgba(42, 138, 154, 0.2); padding: 15px; border-radius: 8px; text-align: center;">`;
    html_info += `<div style="font-size: 24px; font-weight: bold; color: #2a8a9a;">${totalConexiones}</div>`;
    html_info += `<div style="font-size: 12px; color: #a0c4d4; margin-top: 5px;">Conexiones Totales</div>`;
    html_info += `</div>`;
    html_info += `</div>`;
    
    // Agregar nota informativa
    html_info += `<div style="background: rgba(102, 126, 234, 0.1); padding: 12px; border-radius: 8px; margin-top: 15px; font-size: 12px; color: #a0c4d4; text-align: center;">`;
    html_info += `<p>Tip: Haz clic fuera de este popup o en el símbolo "x" para cerrarlo</p>`;
    html_info += `</div>`;
    
    html += html_info;
    content.innerHTML = html;
    modal.style.display = 'flex';
}

// Mostrar ítems específicos de cada categoría
function mostrarItemsCategoria(tipo) {
    const modal = document.getElementById('detalleModal');
    const content = document.getElementById('detalleContent');
    
    const categorias = {
        medio: { titulo: 'Medios de Comunicación', color: '#0074D9', icono: 'M' },
        candidato: { titulo: 'Candidatos Politicos (Ordenados por Intermediacion)', color: '#2ECC40', icono: 'C' },
        departamento: { titulo: 'Departamentos', color: '#FF4136', icono: 'D' },
        franja_demografica: { titulo: 'Franjas Demograficas', color: '#FF9500', icono: 'F' }
    };
    
    const cat = categorias[tipo];
    if(!cat) return;
    
    // Obtener todos los nodos de este tipo
    let nodos = cy.nodes().filter(n => n.data('tipo') === tipo);
    
    // Si es candidato, ordenar por betweenness (descendente)
    if(tipo === 'candidato') {
        nodos = nodos.sort((a, b) => {
            const aLabel = a.data('betweenness_label') ? parseFloat(a.data('betweenness_label')) : 0;
            const bLabel = b.data('betweenness_label') ? parseFloat(b.data('betweenness_label')) : 0;
            return bLabel - aLabel;  // Descendente (mayor primero)
        });
    } else {
        nodos = nodos.sort((a, b) => a.data('label').localeCompare(b.data('label')));
    }
    
    let html = `<h2 style="color: ${cat.color}; border-bottom-color: ${cat.color};">${cat.titulo}</h2>`;
    html += `<p><strong>Total:</strong> ${nodos.length} nodos</p>`;
    html += `<h3>Lista de ${cat.titulo.split('(')[0].trim()}</h3>`;
    html += `<ul style="max-height: 400px; overflow-y: auto;">`;
    
    nodos.forEach(nodo => {
        const entrada = cy.edges().filter(e => e.target().id() === nodo.id()).length;
        const salida = cy.edges().filter(e => e.source().id() === nodo.id()).length;
        
        let itemHTML = `${nodo.data('label')} <small style="color: #999;">(Entrada:${entrada} Salida:${salida})`;
        
        // Si es candidato, agregar betweenness
        if(tipo === 'candidato' && nodo.data('betweenness_label')) {
            itemHTML += ` [${nodo.data('betweenness_label')}]`;
        }
        
        itemHTML += `</small>`;
        
        html += `<li onclick="cy.getElementById('${nodo.id()}').select(); cy.fit(cy.getElementById('${nodo.id()}'), 100);" style="cursor: pointer;">
            ${itemHTML}
        </li>`;
    });
    
    html += `</ul>`;
    html += `<p style="font-size: 10px; color: #999; margin-top: 10px;">Tip: Click en un item para resaltarlo en el grafo</p>`;
    
    content.innerHTML = html;
    modal.style.display = 'flex';
}

// Abrir popup de filtro
function abrirFiltroPopup() {
    document.getElementById('filtroPopup').style.display = 'block';
}

// Cerrar popup de filtro
function cerrarFiltroPopup() {
    document.getElementById('filtroPopup').style.display = 'none';
}

// Cerrar popup al clickear fuera
document.addEventListener('click', function(e) {
    const popup = document.getElementById('filtroPopup');
    const btnFiltro = document.querySelector('.btn-filtro-leyenda');
    if(popup && btnFiltro && !popup.contains(e.target) && !btnFiltro.contains(e.target)) {
        cerrarFiltroPopup();
    }
});

// Filtrar grafo por tipo de nodo
function filtrarGrafo(tipo) {
    // Actualizar botón activo en el popup
    document.querySelectorAll('.filtro-btn-leyenda').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if(tipo === 'todos') {
        // Mostrar todos los nodos y aristas
        cy.elements().show();
    } else {
        // Ocultar todos primero
        cy.elements().hide();
        
        // Mostrar nodos del tipo seleccionado
        const nodosVisibles = cy.nodes().filter(n => n.data('tipo') === tipo);
        nodosVisibles.show();
        
        // Mostrar aristas conectadas a esos nodos
        const aristasVisibles = cy.edges().filter(e => {
            const sourceVisible = e.source().visible();
            const targetVisible = e.target().visible();
            return sourceVisible || targetVisible;
        });
        aristasVisibles.show();
    }
    
    // Hacer zoom a los elementos visibles
    setTimeout(() => {
        const visibles = cy.elements(':visible');
        if(visibles.length > 0) {
            cy.fit(visibles, 50);
        }
    }, 100);
}

// Cargar betweenness centrality y pintar tamaños dinámicos de candidatos
function pintarBetweenness() {
    fetch("/centralidad")
        .then(res => res.json())
        .then(data => {
            console.log('Datos de betweenness recibidos:', data);
            
            // Extraer los valores de betweenness
            const betweennessMap = {};
            let maxBetweenness = 0;
            
            data.forEach(item => {
                betweennessMap[item.id] = item.betweenness;
                if(item.betweenness > maxBetweenness) {
                    maxBetweenness = item.betweenness;
                }
            });
            
            // Actualizar tamaño de nodos de candidatos
            cy.nodes('[tipo="candidato"]').forEach(nodo => {
                const nodId = nodo.id();
                const betweenness = betweennessMap[nodId] || 0;
                
                // Escalar tamaño entre 40 y 100 basado en betweenness
                // Paloma Valencia (0.14) tendrá tamaño ~90
                // Otros con betweenness bajo tendrán tamaño ~40
                const size = 40 + (betweenness / maxBetweenness) * 60;
                
                nodo.style({
                    'width': size,
                    'height': size
                });
                
                // Agregar etiqueta con porcentaje de betweenness
                const porcentaje = (betweenness * 100).toFixed(1);
                nodo.data('betweenness_label', porcentaje + '%');
                
                // Si es el más importante, agregar efecto visual especial
                if(betweenness === maxBetweenness) {
                    nodo.style({
                        'border-width': 3,
                        'border-color': '#FFD700',
                        'shadow-blur': 15,
                        'shadow-color': 'rgba(255, 215, 0, 0.6)'
                    });
                }
            });
            
            console.log('Betweenness aplicado al grafo');
        })
        .catch(err => console.error('Error cargando betweenness:', err));
}

// Inicializar grafo cuando la página carga
window.addEventListener("load", function () {
    console.log('Evento load disparado');
    cargarGrafo();
    
    // Event listeners para nodos
    setTimeout(() => {
        if(cy) {
            console.log('Agregando event listeners a nodos');
            
            // Cargar y pintar betweenness centrality
            pintarBetweenness();
            
            cy.on('tap', 'node', function(e) {
                mostrarDetalleNodo(e.target);
            });
            
            // Cerrar modal al clickear fuera
            document.getElementById('detalleModal').addEventListener('click', function(e) {
                if(e.target === this) {
                    this.style.display = 'none';
                }
            });
        }
    }, 500);
});
