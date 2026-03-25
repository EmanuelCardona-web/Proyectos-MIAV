// Calcular ruta y resaltar en el grafo
function calcularRuta() {
    const origen = document.getElementById("origen").value;
    const destino = document.getElementById("destino").value;
    
    if(!origen || !destino) {
        document.getElementById("resultado").innerText = "Selecciona origen y destino.";
        return;
    }
    
    fetch(`/ruta?origen=${origen}&destino=${destino}`)
        .then(res => res.json())
        .then(data => {
            if(data.error) {
                document.getElementById("resultado").innerText = "No existe relación.";
                return;
            }
            
            let texto = "Ruta:\n\n";
            texto += data.camino.map(n => n.nombre).join(" → ");
            texto += `\n\nCosto: ${data.costo_total.toFixed(4)}`;
            
            document.getElementById("resultado").innerText = texto;
            
            // Resaltar nodos y aristas en el grafo
            cy.elements().removeClass('highlight');
            
            data.camino.forEach((n, i) => {
                cy.getElementById(n.id).addClass('highlight');
                
                if(i < data.camino.length - 1) {
                    cy.edges().forEach(edge => {
                        if(edge.source().id() === n.id &&
                           edge.target().id() === data.camino[i+1].id) {
                            edge.addClass('highlight');
                        }
                    });
                }
            });
        });
}
