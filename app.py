from flask import Flask, render_template, jsonify, request
import pandas as pd
import networkx as nx

app = Flask(__name__)

"""
═════════════════════════════════════════════════════════════════════
MODELO DEL GRAFO - ALCANCE E INFLUENCIA EN CAMPAÑA ELECTORAL
═════════════════════════════════════════════════════════════════════

NODOS (4 tipos):
  • medio: Canales de comunicación (Semana, Blu Radio, etc.)
  • candidato: Aspirantes a senador (Paloma Valencia, Iván Cepeda, etc.)
  • departamento: Divisiones territoriales (Bogotá, Antioquia, etc.)
  • franja_demografica: Segmentos de votantes por características

ARISTAS (4 tipos con significado contextual):
  1. cobertura_medio_candidato
     - De: Medio → A: Candidato
     - Peso: Intensidad de cobertura (% cubiertos por el medio)
     - Costo inverso: Menor peso = más cobertura = menor costo
     - Interpretación: "Qué tan expuesto está el candidato en ese medio"

  2. voto_candidato_departamento
     - De: Candidato → A: Departamento
     - Peso: % de votos que el candidato obtuvo en ese dept
     - Costo inverso: Menor % = más difícil llegar = mayor costo
     - Interpretación: "Qué tan resonante es el candidato en ese territorio"

  3. alcance_medio_departamento
     - De: Medio → A: Departamento
     - Peso: Cobertura geográfica (% población que accede al medio)
     - Costo inverso: Menor cobertura = mayor costo
     - Interpretación: "Ruta directa de difusión medio-región"

  4. afinidad_franja_candidato
     - De: Candidato → A: Franja Demográfica
     - Peso: Afinidad ideológica/apoyo esperado (%)
     - Costo inverso: Mayor afinidad = menor resistencia
     - Interpretación: "Penetración del candidato en segmento electoral"

DEFINICIÓN DE COSTO:
  costo = 1 / peso   (si peso > 0)
  costo = 9999       (si peso ≤ 0 o nodo no alcanzable)

  Justificación: En contexto de influencia electoral, el peso representa
  "qué tan fuerte es la conexión". Un peso alto (ej: 80% de cobertura)
  significa baja resistencia (bajo costo). El inverso formaliza esto.

ALGORITMO:
  • Dijkstra de camino más corto (shortest_path): encuentra la ruta
    de menor costo (máxima influencia potencial) entre dos actores.
  • Betweenness centrality: identifica candidatos/medios que actúan
    como intermediarios clave en la red.
═════════════════════════════════════════════════════════════════════
"""

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

#Cracion del grafo con TODOS los tipos de aristas
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
    
    # CORREGIDO: Incluir TODOS los 4 tipos de aristas
    if tipo in ["cobertura_medio_candidato", "voto_candidato_departamento",
                "alcance_medio_departamento", "afinidad_franja_candidato"]:
        G.add_edge(origen, destino, weight=costo, arista_tipo=tipo, peso_original=peso)

# Crear grafo con costo directo (peso como weight)
G_directo = nx.DiGraph()

for _, fila in aristas.iterrows():
    origen = fila["origen"]
    destino = fila["destino"]
    peso = fila["peso"]
    tipo = fila["tipo_arista"]

    if peso > 0:
        costo_directo = peso
    else:
        costo_directo = 9999
    
    if tipo in ["cobertura_medio_candidato", "voto_candidato_departamento",
                "alcance_medio_departamento", "afinidad_franja_candidato"]:
        G_directo.add_edge(origen, destino, weight=costo_directo, arista_tipo=tipo, peso_original=peso)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/ruta")
def ruta():
    origen = request.args.get("origen")
    destino = request.args.get("destino")
    criterio = request.args.get("criterio", "inverso")  # "inverso" o "directo"

    grafo_usar = G_directo if criterio == "directo" else G

    try:
        camino = nx.shortest_path(grafo_usar, source=origen, target=destino, weight="weight")
        distancia = nx.shortest_path_length(grafo_usar, source=origen, target=destino, weight="weight")

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

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# NUEVOS ENDPOINTS - ANÁLISIS AVANZADO
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.route("/centralidad")
def centralidad():
    """
    RETO 2 PARCIAL: Calcular intermediación (betweenness centrality)
    Responde: ¿Qué candidato/medio es intermediario más crítico?
    """
    try:
        betweenness = nx.betweenness_centrality(G, weight="weight")
        
        # Sortear por importancia
        sorted_nodes = sorted(betweenness.items(), key=lambda x: x[1], reverse=True)
        
        resultado = []
        for nodo_id, centralidad_valor in sorted_nodes[:15]:  # Top 15
            info = dic_nodos.get(nodo_id, {})
            resultado.append({
                "id": nodo_id,
                "nombre": info.get("nombre", nodo_id),
                "tipo": info.get("tipo", "desconocido"),
                "betweenness": round(centralidad_valor, 6),
                "interpretacion": f"Es intermediario en {round(centralidad_valor*100, 2)}% de caminos óptimos"
            })
        
        return jsonify({
            "centralidades": resultado,
            "total_nodos": len(G.nodes()),
            "pregunta_respondida": "¿Qué candidato aparece con más frecuencia como intermediario?"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/accesibilidad_desde_medio")
def accesibilidad_desde_medio():
    """
    RETO 2: Árbol de alcance desde un medio de comunicación
    Responde: ¿Qué departamentos son más/menos alcanzables desde este medio?
    """
    try:
        medio_id = request.args.get("medio_id")
        
        if medio_id not in G or dic_nodos[medio_id]["tipo"] != "medio":
            return jsonify({"error": "Medio no válido"}), 400
        
        # Calcular camino más corto a TODOS los nodos alcanzables
        distancias = nx.single_source_dijkstra_path_length(G, medio_id, weight="weight")
        caminos = nx.single_source_dijkstra_path(G, medio_id, weight="weight")
        
        # Filtrar solo departamentos
        depts_alcanzables = []
        for nodo_id, distancia in distancias.items():
            if nodo_id != medio_id and dic_nodos.get(nodo_id, {}).get("tipo") == "departamento":
                
                info = dic_nodos[nodo_id]
                camino_nodos = caminos[nodo_id]
                
                # Construir detalle del camino
                camino_detallado = []
                for n in camino_nodos:
                    n_info = dic_nodos.get(n, {})
                    camino_detallado.append({
                        "id": n,
                        "nombre": n_info.get("nombre", n),
                        "tipo": n_info.get("tipo", "")
                    })
                
                depts_alcanzables.append({
                    "id": nodo_id,
                    "nombre": info.get("nombre"),
                    "costo_total": round(distancia, 4),
                    "longitud_camino": len(camino_nodos),
                    "camino": camino_detallado
                })
        
        # Sortear por costo (más accesible primero)
        depts_alcanzables.sort(key=lambda x: x["costo_total"])
        
        return jsonify({
            "medio": {"id": medio_id, "nombre": dic_nodos[medio_id]["nombre"]},
            "departamentos_alcanzables": depts_alcanzables,
            "mas_accesible": depts_alcanzables[0] if depts_alcanzables else None,
            "menos_accesible": depts_alcanzables[-1] if depts_alcanzables else None,
            "pregunta_respondida": "¿Qué departamento es más/menos difícil de alcanzar desde los medios?"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/resiliencia")
def resiliencia():
    """
    RETO 3: Análisis de resiliencia - eliminar progresivamente nodos críticos
    Responde: ¿Qué candidato es más crítico? ¿En cuántos pasos se pierde conectividad?
    """
    try:
        # Identificar candidatos
        candidatos = [n for n in G.nodes() if dic_nodos.get(n, {}).get("tipo") == "candidato"]
        
        resultados_simulacion = []
        
        for candidato_eliminar in candidatos:
            # Crear copia del grafo sin este candidato
            G_temp = G.copy()
            G_temp.remove_node(candidato_eliminar)
            
            # Contar componentes débilmente conectadas
            num_componentes = nx.number_weakly_connected_components(G_temp)
            
            # Calcular alcance residual: medios que todavía alcanzan medios
            medios = [n for n in G_temp.nodes() if dic_nodos.get(n, {}).get("tipo") == "medio"]
            depts = [n for n in G_temp.nodes() if dic_nodos.get(n, {}).get("tipo") == "departamento"]
            
            rutas_funcionales = 0
            total_posibles = len(medios) * len(depts) if medios and depts else 1
            
            for medio in medios:
                for dept in depts:
                    try:
                        if nx.has_path(G_temp, medio, dept):
                            rutas_funcionales += 1
                    except:
                        pass
            
            tasa_conectividad = (rutas_funcionales / total_posibles * 100) if total_posibles > 0 else 0
            
            resultados_simulacion.append({
                "candidato_eliminado": {"id": candidato_eliminar, "nombre": dic_nodos[candidato_eliminar]["nombre"]},
                "componentes_desconectadas": num_componentes,
                "rutas_medios_dept": rutas_funcionales,
                "total_posibles": total_posibles,
                "tasa_conectividad_pct": round(tasa_conectividad, 2),
                "criticidad": "ALTA" if tasa_conectividad < 50 else "MEDIA" if tasa_conectividad < 85 else "BAJA"
            })
        
        any_single_below_100 = any(r["tasa_conectividad_pct"] < 100 for r in resultados_simulacion)

        # Calcular conectividad sin candidatos
        G_sin_candidatos = G.copy()
        for candidato_eliminar in candidatos:
            G_sin_candidatos.remove_node(candidato_eliminar)

        rutas_sin_candidatos = 0
        medios_original = [n for n, info in dic_nodos.items() if info.get("tipo") == "medio"]
        depts_original = [n for n, info in dic_nodos.items() if info.get("tipo") == "departamento"]
        total_sin_candidatos = len(medios_original) * len(depts_original) if medios_original and depts_original else 1
        for medio in medios_original:
            for dept in depts_original:
                try:
                    if nx.has_path(G_sin_candidatos, medio, dept):
                        rutas_sin_candidatos += 1
                except:
                    pass

        porcentaje_sin_candidatos = round(rutas_sin_candidatos / total_sin_candidatos * 100, 2) if total_sin_candidatos > 0 else 0
        if not any_single_below_100:
            respuesta_individual = "Eliminar cualquier candidato individualmente no rompe la conectividad total; la red sigue manteniendo todas las rutas posibles entre medios y departamentos."
        else:
            respuesta_individual = "Al eliminar algunos candidatos individuales, la conectividad total baja antes de quitar a todos."

        if porcentaje_sin_candidatos == 0:
            respuesta_todos = "Eliminar todos los candidatos desconecta completamente la red entre medios y departamentos."
        else:
            respuesta_todos = f"Eliminar todos los candidatos reduce la conectividad a {porcentaje_sin_candidatos}% de las rutas posibles; quedan solo las conexiones directas medio→departamento."

        # Sortear por impacto (menor conectividad = más crítico)
        resultados_simulacion.sort(key=lambda x: x["tasa_conectividad_pct"])
        
        return jsonify({
            "simulaciones": resultados_simulacion,
            "candidato_mas_critico": resultados_simulacion[0] if resultados_simulacion else None,
            "pregunta_respondida": "¿Qué tan resiliente es la red si se elimina el candidato con mayor intermediación?",
            "mantenido_al_eliminar_un_candidato": not any_single_below_100,
            "respuesta_eliminacion_individual": respuesta_individual,
            "porcentaje_conectividad_sin_candidatos": porcentaje_sin_candidatos,
            "respuesta_eliminacion_todos": respuesta_todos
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/respuestas_5_preguntas")
def respuestas_5_preguntas():
    """
    ENDPOINT INTEGRAL: Devuelve las respuestas a las 5 preguntas del análisis
    """
    try:
        origen = request.args.get("origen")
        destino = request.args.get("destino")
        medio_id = request.args.get("medio_id")

        first_medio = next((nid for nid, info in dic_nodos.items() if info["tipo"] == "medio"), None)
        first_depto = next((nid for nid, info in dic_nodos.items() if info["tipo"] == "departamento"), None)

        def formatear_camino(camino):
            if not camino:
                return None
            return [{
                "id": n,
                "nombre": dic_nodos.get(n, {}).get("nombre", n),
                "tipo": dic_nodos.get(n, {}).get("tipo", "Desconocido")
            } for n in camino]

        def calcular_camino(source, target):
            try:
                camino = nx.shortest_path(G, source=source, target=target, weight="weight")
                costo = nx.shortest_path_length(G, source=source, target=target, weight="weight")
                return camino, costo
            except:
                return None, None

        # PREGUNTA 1: Busca la MEJOR RUTA entre CUALQUIER medio y CUALQUIER departamento (menor costo)
        if not origen or not destino:
            mejores_rutas = []
            medios = [nid for nid, info in dic_nodos.items() if info.get("tipo") == "medio"]
            depts = [nid for nid, info in dic_nodos.items() if info.get("tipo") == "departamento"]
            
            for med in medios:
                for dept in depts:
                    camino_temp, costo_temp = calcular_camino(med, dept)
                    if camino_temp is not None:
                        mejores_rutas.append((costo_temp, med, dept, camino_temp))
            
            if mejores_rutas:
                costo1, origen, destino, camino1 = min(mejores_rutas, key=lambda x: x[0])
            else:
                camino1, costo1, origen, destino = None, None, None, None
        else:
            camino1, costo1 = calcular_camino(origen, destino)

        camino1_detallado = formatear_camino(camino1) if camino1 else []

        # Para pregunta 3, establecer medio_id
        if not medio_id:
            medio_id = origen if origen and dic_nodos.get(origen, {}).get("tipo") == "medio" else first_medio

        # PREGUNTA 2: Centralidad (intermediarios)
        betweenness = nx.betweenness_centrality(G, weight="weight")
        sorted_nodes = sorted(betweenness.items(), key=lambda x: x[1], reverse=True)

        intermediarios = []
        for nodo_id, centralidad_valor in sorted_nodes:
            info = dic_nodos.get(nodo_id, {})
            if info.get("tipo") == "candidato":
                intermediarios.append({
                    "id": nodo_id,
                    "nombre": info.get("nombre", nodo_id),
                    "betweenness": round(centralidad_valor, 6),
                    "pct": round(centralidad_valor * 100, 2)
                })
                if len(intermediarios) >= 6:
                    break

        # PREGUNTA 3: Promedio de accesibilidad por departamento sobre TODOS los medios
        medios_lista = [nid for nid, info in dic_nodos.items() if info.get("tipo") == "medio"]
        depts_lista = [nid for nid, info in dic_nodos.items() if info.get("tipo") == "departamento"]

        dept_costos = {dept: [] for dept in depts_lista}
        for med in medios_lista:
            try:
                distancias = nx.single_source_dijkstra_path_length(G, med, weight="weight")
                for dept in depts_lista:
                    if dept in distancias:
                        dept_costos[dept].append(distancias[dept])
            except:
                pass

        dept_promedios = []
        for dept, costos in dept_costos.items():
            if costos:
                dept_promedios.append({
                    "departamento_id": dept,
                    "departamento": dic_nodos[dept]["nombre"],
                    "promedio_costo": round(sum(costos) / len(costos), 4),
                    "medios_contados": len(costos)
                })

        dept_promedios.sort(key=lambda x: x["promedio_costo"])
        mas_accesible = dept_promedios[0] if dept_promedios else None
        menos_accesible = dept_promedios[-1] if dept_promedios else None

        if mas_accesible and menos_accesible and mas_accesible["promedio_costo"] > 0:
            ratio = round(menos_accesible["promedio_costo"] / mas_accesible["promedio_costo"], 1)
            hallazgo_3 = (
                f"El departamento con mejor accesibilidad promedio es {mas_accesible['departamento']} "
                f"(costo promedio {mas_accesible['promedio_costo']}, basado en {mas_accesible['medios_contados']} medios), "
                f"mientras que el más difícil es {menos_accesible['departamento']} "
                f"(costo promedio {menos_accesible['promedio_costo']}, basado en {menos_accesible['medios_contados']} medios), "
                f"{ratio}x más inaccesible."
            )
        else:
            hallazgo_3 = "No hay suficientes datos para calcular promedios de accesibilidad." 

        # PREGUNTA 4: Comparar criterio de costo real y alternativo
        camino2, costo2 = None, None
        try:
            G_alt = G.copy()
            for u, v, data in G_alt.edges(data=True):
                G_alt[u][v]["weight"] = data.get("peso_original", data.get("weight"))
            camino2 = nx.shortest_path(G_alt, source=origen, target=destino, weight="weight")
            costo2 = nx.shortest_path_length(G_alt, source=origen, target=destino, weight="weight")
        except:
            pass

        cambio_significativo = None
        if camino1 is not None and camino2 is not None:
            cambio_significativo = camino1 != camino2
            pregunta4_respuesta = (
                "Sí, el camino óptimo cambia con un criterio de costo diferente."
                if cambio_significativo
                else "No, el camino óptimo permanece igual con ambos criterios."
            )
        else:
            pregunta4_respuesta = "No se pudo calcular la comparación para el par de nodos seleccionado."

        razon_4 = (
            f"El costo alternativo se comparó para {origen} → {destino}."
            if cambio_significativo is not None
            else "No hay ruta completa para evaluar los dos criterios."
        )

        # PREGUNTA 5: Resiliencia dinámica
        candidatos = [n for n in G.nodes() if dic_nodos.get(n, {}).get("tipo") == "candidato"]
        resultados_simulacion = []
        candidato_top_id = intermediarios[0]["id"] if intermediarios else None

        for candidato_eliminar in candidatos:
            G_temp = G.copy()
            G_temp.remove_node(candidato_eliminar)

            medios = [n for n in G_temp.nodes() if dic_nodos.get(n, {}).get("tipo") == "medio"]
            depts = [n for n in G_temp.nodes() if dic_nodos.get(n, {}).get("tipo") == "departamento"]

            rutas_funcionales = 0
            total_posibles = len(medios) * len(depts) if medios and depts else 1

            for medio in medios:
                for dept in depts:
                    try:
                        if nx.has_path(G_temp, medio, dept):
                            rutas_funcionales += 1
                    except:
                        pass

            tasa_conectividad = (rutas_funcionales / total_posibles * 100) if total_posibles > 0 else 0
            es_critico = "MÁS CRÍTICO" if candidato_eliminar == candidato_top_id else "Secundario"
            
            resultados_simulacion.append({
                "candidato": dic_nodos[candidato_eliminar]["nombre"],
                "betweenness": round(betweenness.get(candidato_eliminar, 0), 6),
                "conectividad_pct": round(tasa_conectividad, 2),
                "es_critico": es_critico
            })

        any_single_below_100 = any(r["conectividad_pct"] < 100 for r in resultados_simulacion)

        G_sin_candidatos = G.copy()
        for c in candidatos:
            G_sin_candidatos.remove_node(c)

        rutas_sin_candidatos = 0
        total_sin_candidatos = len(medios_lista) * len(depts_lista) if medios_lista and depts_lista else 1
        for medio in medios_lista:
            for dept in depts_lista:
                try:
                    if nx.has_path(G_sin_candidatos, medio, dept):
                        rutas_sin_candidatos += 1
                except:
                    pass

        porcentaje_sin_candidatos = round(rutas_sin_candidatos / total_sin_candidatos * 100, 2) if total_sin_candidatos > 0 else 0
        respuesta_individual = (
            "Eliminar cualquier candidato individualmente no rompe la conectividad total; la red sigue manteniendo todas las rutas posibles entre medios y departamentos."
            if not any_single_below_100
            else "Al eliminar algunos candidatos individuales, la conectividad total baja antes de quitar a todos."
        )
        if porcentaje_sin_candidatos == 0:
            respuesta_todos = "Eliminar todos los candidatos desconecta completamente la red entre medios y departamentos."
        else:
            respuesta_todos = f"Eliminar todos los candidatos reduce la conectividad a {porcentaje_sin_candidatos}% de las rutas posibles; quedan solo las conexiones directas medio→departamento."

        resultados_simulacion.sort(key=lambda x: x["betweenness"], reverse=True)
        top_resiliencia = resultados_simulacion[0] if resultados_simulacion else None
        conectividad_mantenida = f"{top_resiliencia['conectividad_pct']}%" if top_resiliencia else "N/A"

        if top_resiliencia is not None:
            if top_resiliencia["conectividad_pct"] >= 90:
                conclusion = "Red ALTAMENTE RESILIENTE - No hay punto de fallo único."
            elif top_resiliencia["conectividad_pct"] >= 70:
                conclusion = "Red moderadamente resiliente, pero hay actores críticos."
            else:
                conclusion = "Red vulnerable: la eliminación de un candidato reduce significativamente la conectividad."
        else:
            conclusion = "No hay datos suficientes para evaluar resiliencia."

        candidato_top = intermediarios[0] if intermediarios else None
        hallazgo_2 = (
            f"{candidato_top['nombre']} domina con {candidato_top['pct']}% de intermediación"
            if candidato_top
            else "No hay candidatos con intermediación calculable."
        )

        return jsonify({
            "pregunta_1": {
                "titulo": "¿Cuál es la ruta de menor resistencia desde un medio hasta un departamento?",
                "origen": {"id": origen, "nombre": dic_nodos.get(origen, {}).get("nombre", origen)},
                "destino": {"id": destino, "nombre": dic_nodos.get(destino, {}).get("nombre", destino)},
                "ruta": camino1_detallado,
                "costo_total": round(costo1, 4) if costo1 is not None else None,
                "ejemplo": "Ruta calculada dinámicamente según los nodos seleccionados."
            },
            "pregunta_2": {
                "titulo": "¿Qué candidato aparece con más frecuencia como intermediario?",
                "intermediarios": intermediarios,
                "candidato_top": candidato_top,
                "hallazgo": hallazgo_2
            },
            "pregunta_3": {
                "titulo": "¿Qué departamento es el más difícil de alcanzar desde los medios seleccionados?",
                "mas_accesible": mas_accesible,
                "menos_accesible": menos_accesible,
                "hallazgo": hallazgo_3
            },
            "pregunta_4": {
                "titulo": "¿Cambia el camino óptimo si se modifica el criterio de costo?",
                "respuesta": pregunta4_respuesta,
                "cambio_significativo": cambio_significativo,
                "razon": razon_4,
                "criterio_1": {"origen": origen, "destino": destino, "costo": round(costo1, 4) if costo1 is not None else None},
                "criterio_2": {"origen": origen, "destino": destino, "costo": round(costo2, 4) if costo2 is not None else None}
            },
            "pregunta_5": {
                "titulo": "¿Qué tan resiliente es la red si se elimina el candidato con mayor intermediación?",
                "resiliencia": resultados_simulacion,
                "candidato_mas_critico": top_resiliencia,
                "conectividad_mantenida": conectividad_mantenida,
                "respuesta_eliminacion_individual": respuesta_individual,
                "porcentaje_conectividad_sin_candidatos": porcentaje_sin_candidatos,
                "respuesta_eliminacion_todos": respuesta_todos,
                "conclusion": conclusion
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/dashboard")
def dashboard():
    """
    Página visual para mostrar las 5 respuestas
    """
    return render_template("dashboard.html")


@app.route("/comparar_criterios")
def comparar_criterios():
    """
    RETO 1: Comparar 2 criterios de costo distintos
    - Criterio 1: costo = 1/peso (actual)
    - Criterio 2: costo = peso (minimizar influencia directa)
    """
    try:
        origen = request.args.get("origen")
        destino = request.args.get("destino")
        
        if not origen or not destino:
            return jsonify({"error": "Origen y destino requeridos"}), 400
        
        # CRITERIO 1: Costo inverso (actual)
        try:
            camino1 = nx.shortest_path(G, source=origen, target=destino, weight="weight")
            costo1 = nx.shortest_path_length(G, source=origen, target=destino, weight="weight")
        except:
            camino1 = None
            costo1 = None
        
        # CRITERIO 2: Crear grafo alternativo con costo = peso
        G_alt = G.copy()
        for u, v in G_alt.edges():
            # Invertir el peso: si antes era bajo (por 1/x), ahora es alto
            G_alt[u][v]["weight"] = G_alt[u][v]["peso_original"]  # Usar peso original
        
        try:
            camino2 = nx.shortest_path(G_alt, source=origen, target=destino, weight="weight")
            costo2 = nx.shortest_path_length(G_alt, source=origen, target=destino, weight="weight")
        except:
            camino2 = None
            costo2 = None
        
        def formato_camino(camino):
            if not camino:
                return None
            return [{
                "id": n,
                "nombre": dic_nodos.get(n, {}).get("nombre", n),
                "tipo": dic_nodos.get(n, {}).get("tipo", "")
            } for n in camino]
        
        return jsonify({
            "criterio_1": {
                "nombre": "Maximizar Influencia (costo = 1/peso)",
                "descripcion": "Prefiere aristas con alto peso (fuerte conexión)",
                "camino": formato_camino(camino1),
                "costo_total": round(costo1, 4) if costo1 else None,
                "existe_ruta": costo1 is not None
            },
            "criterio_2": {
                "nombre": "Minimizar Resistencia Directa (costo = peso)",
                "descripcion": "Prefiere aristas con bajo peso (débil conexión directa)",
                "camino": formato_camino(camino2),
                "costo_total": round(costo2, 4) if costo2 else None,
                "existe_ruta": costo2 is not None
            },
            "pregunta_respondida": "¿Cambia el camino óptimo si se modifica el criterio de costo de las aristas?",
            "caminos_diferentes": camino1 != camino2 if camino1 and camino2 else None
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    
if __name__ == "__main__":
    app.run(debug=True)