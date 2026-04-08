## � PROYECTO: Alcance e Influencia en Campaña Electoral

**Sistema de análisis de rutas de influencia y comunicación en redes electorales mediante grafos.**

Este proyecto responde a la pregunta: **¿Cómo llega un mensaje político desde los medios de comunicación, a través de candidatos, hasta los votantes?**

---

## 🎯 Características Principales

### ✅ MVP - Camino Más Eficiente
- Calcula el camino de menor "costo" (máxima influencia) entre dos actores
- Identifica intermediarios clave en las rutas
- Visualización interactiva con Cytoscape.js

### ✅ RETO 1 - Comparación de Criterios
- Compara simultáneamente 2 criterios de optimización
- Muestra si cambian los resultados según la métrica utilizada
- Permite decisiones basadas en diferentes interpretaciones de "eficiencia"

### ✅ RETO 2 - Árbol de Alcance + Intermediarios
- Calcula todos los caminos más cortos desde un medio a todos los departamentos
- Identifica departamentos más y menos accesibles
- Calcula betweenness centrality: qué candidatos/medios son intermediarios críticos

### ✅ RETO 3 - Análisis de Resiliencia
- Simula eliminar progresivamente candidatos
- Mide cómo se degrada la conectividad de la red
- Identifica nodos más críticos para mantener la red funcional

---

## 🚀 Instalación y Ejecución

Sigue estos pasos para configurar y poner en marcha el proyecto en tu entorno local.

### 📌 Requisitos Previos
* **Python 3.x** instalado en el sistema.

### 📦 Instalación de Dependencias
Asegúrate de instalar las librerías necesarias ejecutando el siguiente comando en tu terminal:

```bash
python -m pip install flask pandas networkx
```

### ▶️ Ejecución del Proyecto
Para iniciar el servidor de la aplicación, utiliza:

```bash
python app.py
```

### 🌐 Acceso a la Aplicación
Una vez que el servidor esté corriendo, puedes interactuar con la interfaz abriendo cualquiera de las siguientes direcciones en tu navegador:

🔗 http://127.0.0.1:5000/

🔗 http://localhost:5000/

---

## 📋 Datos y Modelo

### Nodos (60 totales)
- **6 Candidatos:** Paloma Valencia, Iván Cepeda, Claudia López, Roy Barreras, Juan Daniel Oviedo, Sergio Fajardo
- **34 Departamentos:** Bogotá, Antioquia, Valle del Cauca, etc.
- **12 Franjas Demográficas:** Segmentos de votantes por edad, ideología, etc.
- **8 Medios de Comunicación:** El Tiempo, Semana, Blu Radio, etc.

### Aristas (404 totales)
1. **voto_candidato_departamento:** Qué % de votos obtuvo cada candidato en cada departamento
2. **cobertura_medio_candidato:** Qué intensidad de cobertura tiene cada medio sobre cada candidato
3. **alcance_medio_departamento:** Qué alcance geográfico tiene cada medio
4. **afinidad_franja_candidato:** Qué afinidad tiene cada candidato con cada segmento electoral

### Definición de Costo
```
costo = 1 / peso   (si peso > 0)
costo = 9999       (si peso ≤ 0 o no hay conexión)
```

**Justificación:** En el contexto de influencia electoral, el peso representa "qué tan fuerte es la conexión".
- Alto peso (ej: 80% de cobertura) = baja resistencia = bajo costo
- Bajo peso (ej: 10% de cobertura) = alta resistencia = alto costo

El inverso formaliza esta relación.

---

## 🔧 API Endpoints

### MVP Original
- `GET /` → Interfaz web
- `GET /grafo` → Datos del grafo para Cytoscape
- `GET /nodos` → Lista de todos los nodos
- `GET /vecinos?nodo=X` → Nodos alcanzables desde X
- `GET /ruta?origen=X&destino=Y` → Camino más corto

### Nuevos Endpoints (Retos)

#### RETO 1: Comparación de Criterios
```
GET /comparar_criterios?origen=CAN_01&destino=DEP_01
```
Respuesta:
```json
{
  "criterio_1": {
    "nombre": "Maximizar Influencia (costo = 1/peso)",
    "camino": [...],
    "costo_total": 0.0147
  },
  "criterio_2": {
    "nombre": "Minimizar Resistencia Directa (costo = peso)",
    "camino": [...],
    "costo_total": 0.35
  },
  "caminos_diferentes": true
}
```

#### RETO 2A: Centralidad (Intermediarios)
```
GET /centralidad
```
Top 15 nodos por betweenness centrality.

#### RETO 2B: Árbol de Alcance
```
GET /accesibilidad_desde_medio?medio_id=MED_01
```
Calcula caminos más cortos desde 1 medio a todos los departamentos.

#### RETO 3: Resiliencia
```
GET /resiliencia
```
Simula eliminar cada candidato y mide conectividad residual.

---

## 📂 Estructura de Archivos

```
.
├── app.py                          # Backend Flask con 10+ endpoints
├── archivos_csv/
│   ├── electoral_nodos.csv        # 60 nodos (candidatos, medios, departamentos, franjas)
│   └── electoral_aristas.csv      # 404 aristas entre nodos
├── static/
│   ├── css/
│   │   └── styles.css             # Estilos del sistema (tema oscuro)
│   └── js/
│       ├── nodos.js               # Cargar y ordenar nodos alfabéticamente
│       ├── formularios.js         # Eventos de formularios de ruta
│       ├── grafo.js               # Renderizar grafo con Cytoscape.js
│       ├── ruta.js                # Calcular y resaltar rutas en el grafo
│       └── analisis.js            # Funciones de análisis avanzado (retos)
├── templates/
│   ├── index.html                 # Interfaz principal (MVP + Retos)
│   └── dashboard.html             # Dashboard visual de las 5 respuestas
└── README.md                       # Este archivo
```

---

## 📚 Preguntas Respondidas

El proyecto responde formalmente a las 5 preguntas clave:

1. **¿Cuál es la ruta de menor resistencia desde un medio de comunicación hasta un departamento específico?**
   - Endpoint: `/accesibilidad_desde_medio?medio_id=X`
   - Ejemplo: El Tiempo → [Candidato] → Departamento

2. **¿Qué candidato aparece con más frecuencia como intermediario en los caminos óptimos de la red?**
   - Endpoint: `/centralidad`
   - Resultado: Paloma Valencia (14.06% de caminos pasan por ella)

3. **¿Qué departamento es el más difícil de alcanzar desde los medios nacionales y por qué?**
   - Endpoint: `/accesibilidad_desde_medio`
   - Resultado: Depende del medio; algunos requieren intermediación

4. **¿Cambia el camino óptimo si se modifica el criterio de costo de las aristas?**
   - Endpoint: `/comparar_criterios`
   - Resultado: SÍ, cambia según el criterio

5. **¿Qué tan resiliente es la red si se elimina el candidato con mayor intermediación?**
   - Endpoint: `/resiliencia`
   - Resultado: Muy resiliente (100% conectividad residual en este dataset)

---

## 🧠 Algoritmos Utilizados

- **Dijkstra:** Calcula el camino más corto ponderado (shortest_path)
- **Betweenness Centrality:** Identifica nodos clave en la red
- **Breadth-First Search (BFS):** Para calcular accesibilidad
- **Graph Decomposition:** Para análisis de componentes conectadas

---
