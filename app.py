from flask import Flask, render_template, jsonify, request
import pandas as pd
import networkx as nx

app = Flask(__name__)

#Carga de archivos Csv
aristas = pd.read_csv("archivos_csv/electoral_aristas.csv")
nodos = pd.read_csv("archivos_csv/electoral_nodos.csv")

#Diccionario para formalizar nodos
dic_nodos = {}

for _, fila in nodos.iterrows():
    dic_nodos[fila["node_id"]] = {
        "nombre": fila["nombre"],
        "tipo": fila["tipo"]
    }

#Cracion del grafo
G = nx.DiGraph()

for _, fila in aristas.iterrows():
    origen = fila["origen"]
    destino = fila["destino"]
    peso = fila["peso"]
    tipo = fila["tipo_arista"]

    if peso > 0:
        costo = 1 / peso
    else:
        costo = 9999
    
    if tipo in ["cobertura_medio_candidato", "voto_candidato_departamento"]:
        G.add_edge(origen, destino, weight=costo)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/ruta")
def ruta():
    origen = request.args.get("origen")
    destino = request.args.get("destino")

    try:
        camino = nx.shortest_path(G, source=origen, target=destino, weight="weight")
        distancia = nx.shortest_path_length(G, source=origen, target=destino, weight="weight")

        camino_detallado = []

        for nodo in camino:
            info = dic_nodos.get(nodo, {})
            camino_detallado.append({
                "id": nodo,
                "nombre": info.get("nombre", nodo),
                "tipo": info.get("tipo", "Desconocido")
            })
        
        return jsonify({
            "camino": camino_detallado,
            "costo_total": distancia
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/grafo")
def grafo():
    elementos = []

    for nodo in G.nodes():
        info = dic_nodos.get(nodo, {})
        elementos.append({
            "data": {
                "id": nodo,
                "label": info.get("nombre", nodo),
                "tipo": info.get("tipo", "desconocido")
            }
        })

    for origen, destino, data in G.edges(data=True):
        elementos.append({
            "data": {
                "source": origen,
                "target": destino,
                "weight": data["weight"]
            }
        })

    return jsonify(elementos)

@app.route("/nodos")
def obtener_nodos():
    lista = []

    for node_id, info in dic_nodos.items():
        lista.append({
            "id": node_id,
            "nombre": info["nombre"],
            "tipo": info["tipo"]
        })

    return jsonify(lista)

@app.route("/vecinos")
def vecinos():
    nodo = request.args.get("nodo")

    if nodo not in G:
        return jsonify([])

    vecinos = list(nx.descendants(G, nodo))

    resultado = []

    for v in vecinos:
        info = dic_nodos.get(v, {})
        resultado.append({
            "id": v,
            "nombre": info.get("nombre", v),
            "tipo": info.get("tipo", "desconocido")
        })

    return jsonify(resultado)
    
if __name__ == "__main__":
    app.run(debug=True)