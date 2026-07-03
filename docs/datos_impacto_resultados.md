# Datos, Impacto y Resultados — PasaLaVoz

## 1. Indicadores de resultados esperados

Los indicadores de PasaLaVoz se dividen en tres niveles: uso, impacto y equidad.

### 1.1 Indicadores de uso
Miden la adopción y actividad de la plataforma. Son los primeros en aparecer porque reflejan el comportamiento real de los usuarios.

| Indicador | Definición | Meta inicial |
|-----------|-----------|-------------|
| Reportes por semana | Número de incidentes enviados en los últimos 7 días | ≥ 10 reportes/semana por distrito activo |
| Tasa de reportes anónimos | % de reportes enviados sin crear cuenta | > 70% (refleja confianza en la privacidad) |
| Distritos con al menos 1 reporte | Cobertura geográfica activa | ≥ 3 distritos en los primeros 30 días |
| Usuarios que activaron SOS | Número de activaciones del botón de emergencia | Monitorear; no tiene meta mínima |

### 1.2 Indicadores de impacto
Miden si los reportes generan una respuesta concreta y si la percepción de seguridad mejora.

| Indicador | Definición | Meta |
|-----------|-----------|------|
| Tasa de atención | % de reportes que pasan de "recibido" a "atendido" | ≥ 40% en los primeros 3 meses |
| Tiempo promedio de respuesta | Horas entre "recibido" y "revisado" | < 24 horas |
| Incidentes repetidos por zona | Casos donde la misma zona reporta el mismo tipo más de 3 veces | Reducción del 20% tras intervención de serenazgo |
| Percepción de seguridad | Encuesta de salida a usuarios: ¿te sientes más seguro usando PasaLaVoz? | ≥ 60% responde positivamente |

### 1.3 Indicadores de equidad
El proyecto tiene enfoque de género y seguridad colectiva. Estos indicadores verifican que eso se cumpla en los datos reales.

| Indicador | Definición | Objetivo |
|-----------|-----------|----------|
| % reportes de acoso sobre el total | Proporción de reportes tipo "acoso" | Monitorear tendencia; refleja prevalencia del problema |
| Horario de incidentes | Distribución por hora del día | Identificar si predominan los nocturnos para orientar patrullaje |
| Zonas de mayor concentración | Distritos con más de 5 reportes en 7 días | Alertar a serenazgo de forma automática en versión futura |

---

## 2. Diseño del panel de estadísticas

El panel de estadísticas (`EstadisticasPage`) está diseñado para comunicar los indicadores del punto anterior de forma visual, clara y en tiempo real, usando los datos que los propios ciudadanos generan.

### Estructura del panel

**Sección 1 — KPIs principales (fila de 3 tarjetas)**
Muestra de un vistazo los tres datos más relevantes de la semana: total de reportes, tipo de incidente más frecuente y distrito con más actividad. Usa color para diferenciar (azul = volumen, ámbar = alerta, rojo = zona crítica).

**Sección 2 — Estado de reportes**
Muestra cuántos reportes están en cada etapa del flujo: recibido → en revisión → atendido. Incluye un indicador porcentual de resolución ("X% resueltos") que es el indicador de impacto más importante: si ese número crece, significa que las autoridades están respondiendo.

**Sección 3 — Incidentes por tipo**
Barras horizontales con porcentaje para cada categoría (acoso, robo, persecución, violencia, zona oscura, otro). Permite identificar qué tipo de incidente predomina en la comunidad esa semana.

**Sección 4 — Reportes por distrito**
Ranking visual de distritos con más incidentes. Permite identificar zonas de concentración geográfica y orienta la respuesta de serenazgo.

**Sección 5 — Actividad reciente**
Lista de los últimos 5 reportes con tipo, distrito, tiempo relativo y estado actual. Da contexto humano a los números.

**Sección 6 — Datos abiertos**
Explica los tres principios de transparencia del proyecto: anonimato garantizado, coordenadas ofuscadas y compatibilidad con datos abiertos del Estado.

---

## 3. Enfoque de datos abiertos

### ¿Por qué los datos de seguridad ciudadana deben ser públicos?

La seguridad ciudadana es un problema colectivo que no puede resolverse con información privada o fragmentada. Cuando los datos de incidentes están centralizados en una institución o son inaccesibles, se pierde la capacidad de actuar con rapidez y con evidencia. PasaLaVoz propone que los datos generados por la comunidad deben volver a la comunidad, y también deben estar disponibles para quienes toman decisiones.

### Tres pilares del enfoque

**1. Anonimato como condición del dato**
Un dato de seguridad ciudadana solo puede ser abierto si no compromete la identidad de quien lo generó. PasaLaVoz garantiza esto desde el diseño:
- Los reportes no contienen nombre, teléfono ni documento del usuario.
- Las coordenadas se redondean a ~3 decimales (`src/lib/geo.ts`), lo que representa un área aproximada de ~100 m × 100 m, nunca el punto exacto donde estaba la persona.
- El formulario advierte explícitamente que no se deben incluir nombres ni descripciones de personas.

Esto permite publicar los datos completos sin ningún riesgo para el reportante.

**2. Datos por zonas, no por personas**
El enfoque de PasaLaVoz es territorial: los datos describen zonas y tipos de incidente, no comportamientos de individuos. Esto es consistente con el estándar internacional de datos abiertos de seguridad pública, como el modelo de la plataforma data.police.uk del Reino Unido, donde los incidentes se publican a nivel de calle o barrio, nunca con información personal.

**3. Compatibilidad con el ecosistema de datos del Estado peruano**
Los datos generados por PasaLaVoz pueden exportarse en formato JSON o CSV y ser incorporados a plataformas existentes:
- **datosabiertos.gob.pe**: Portal oficial del Estado peruano donde municipios y entidades publican sus datos.
- **INEI**: El Instituto Nacional de Estadística e Informática produce encuestas de victimización (ENAPRES). Los datos de PasaLaVoz pueden complementar esa información con reportes en tiempo real.
- **Municipalidades distritales**: Pueden usar los datos para orientar el patrullaje de serenazgo según zonas y horarios con mayor concentración de incidentes.

### Impacto esperado del enfoque abierto

Con datos abiertos, PasaLaVoz deja de ser solo una app de reportes y se convierte en una fuente de inteligencia territorial:
- Investigadores y periodistas pueden analizar tendencias de inseguridad por zona.
- ONGs de género pueden cruzar los datos de acoso con otras variables.
- Las propias municipalidades pueden justificar inversiones en alumbrado público o ampliación de serenazgo con evidencia ciudadana.
- La comunidad puede exigir rendición de cuentas cuando los reportes de una zona no son atendidos.

En resumen: los datos de PasaLaVoz son más valiosos cuando son públicos, porque la seguridad ciudadana se construye con información compartida, no retenida.
