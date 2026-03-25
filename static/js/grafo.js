// Cargar y inicializar grafo con Cytoscape
function cargarGrafo() {
    fetch("/grafo")
        .then(res => res.json())
        .then(data => {
            cy = cytoscape({
                container: document.getElementById('grafo'),
                elements: data,
                
                style: [
                    {
                        selector: 'node',
                        style: {
                            'label': 'data(label)',
                            'font-size': '8px',
                            'color': '#fff',
                            'text-valign': 'center'
                        }
                    },
                    {
                        selector: 'edge',
                        style: {
                            'width': 1,
                            'line-color': '#ccc'
                        }
                    },
                    {
                        selector: '[tipo = "medio"]',
                        style: { 'background-color': '#0074D9' }
                    },
                    {
                        selector: '[tipo = "candidato"]',
                        style: { 'background-color': '#2ECC40' }
                    },
                    {
                        selector: '[tipo = "departamento"]',
                        style: { 'background-color': '#FF4136' }
                    }
                ],
                
                layout: {
                    name: 'cose'
                }
            });
        });
}

// Inicializar grafo cuando la página carga
document.addEventListener("DOMContentLoaded", function () {
    cargarGrafo();
});
