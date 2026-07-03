# PasaLaVoz — prototipo móvil

**Tu voz hace tu barrio más seguro.**

Prototipo navegable (PWA) de seguridad ciudadana enfocado en la **prevención** de la violencia y el acoso en espacios públicos de **Lima, Perú**. Pensado para jóvenes y mujeres. Permite reportar incidentes de forma anónima, ver un mapa de zonas de riesgo y puntos seguros, y activar un botón **SOS**.

> ⚠️ Es un **prototipo con datos de ejemplo (mock)**. No hay backend, autenticación ni envíos reales. **Complementa, no reemplaza** a la policía ni a las líneas de emergencia. En una emergencia real, llama al **105**.

Hecho para un hackathon de innovación social (PNUD / RedPública): enfoque comunitario, equidad de género y datos como bien público.

---

## Cómo correrlo

Necesitas **Node 18+** (probado con Node 24).

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite (por defecto **http://localhost:5173**).

Otros comandos:

```bash
npm run build     # type-check + build de producción (carpeta dist/)
npm run preview   # sirve el build de producción
```

> Para verlo como en un celular, abre las DevTools del navegador y activa la vista móvil (~390 px). En escritorio, la app se muestra dentro de un “marco” tipo celular.

---

## Pantallas

| # | Pantalla | Ruta |
|---|----------|------|
| 0 | Inicio / Onboarding | `/` |
| 1 | **Mapa** (zonas de riesgo + puntos seguros) | `/mapa` |
| 2 | **Reportar** incidente | `/reportar` |
| 3 | **SOS** (mantener presionado 3 s) | `/sos` |
| 4 | Estadísticas / Comunidad | `/estadisticas` |
| 5 | Perfil / Más | `/perfil` |

La navegación es una **bottom tab bar** con un **botón SOS central rojo elevado**, accesible desde toda la app.

---

## Personalizar colores y datos

### 🎨 Colores e identidad visual
- **[`tailwind.config.js`](tailwind.config.js)** — paleta completa: `marca` (azul de confianza), `sos` (rojo, solo emergencias), `seguro` (verde), `riesgo` (ámbar→rojo) y neutros. Cambia aquí cualquier color.
- **[`src/index.css`](src/index.css)** — estilos base y ajustes del mapa (Leaflet).

### 🗂️ Datos de ejemplo (mock)
Todo vive en **[`src/data/`](src/data)**:
- **[`reportes.ts`](src/data/reportes.ts)** — ~14 reportes en Miraflores, Cercado y Barranco.
- **[`puntosSeguros.ts`](src/data/puntosSeguros.ts)** — comisarías, farmacias 24 h y paraderos seguros.
- **[`contactos.ts`](src/data/contactos.ts)** — contactos de confianza del SOS.
- **[`distritos.ts`](src/data/distritos.ts)** — distritos y **centro/zoom inicial del mapa** (`CENTRO_LIMA`, `ZOOM_INICIAL`).
- **[`types.ts`](src/data/types.ts)** — modelo de datos.

### 🏷️ Tipos de incidente, números y textos
- **[`src/lib/incidentes.ts`](src/lib/incidentes.ts)** — etiquetas, íconos, peso de riesgo y escala de color por tipo.
- **[`src/lib/numeros.ts`](src/lib/numeros.ts)** — números oficiales (105, Línea 100, 116) y avisos legales.

---

## Estructura del proyecto

```
src/
  components/   UI reutilizable (Boton, Tarjeta, BottomNav, BottomSheet, PhoneFrame…)
  features/
    onboarding/ pantalla de inicio
    mapa/       mapa, capa de calor, filtros y leyenda
    reportes/   formulario y confirmación de reporte
    sos/        botón SOS, cuenta regresiva y contactos
    panel/      estadísticas / datos de la comunidad
    perfil/     cuenta, privacidad y números oficiales
  data/         datos de ejemplo (mock)
  lib/          helpers (formato de fecha, ofuscar coordenadas, metadatos)
  context/      estado global en memoria (reportes, contactos, sesión)
  routes/       layout y rutas
  types/        declaraciones de tipos (leaflet.heat)
  App.tsx  main.tsx
```

---

## Privacidad y seguridad (visibles en la UI)
- **Ubicación ofuscada:** nunca se muestra el punto exacto de quien reporta; las coordenadas se redondean (~3 decimales) y se muestran como **zona/área aproximada**. Ver [`src/lib/geo.ts`](src/lib/geo.ts).
- **Anónimo por defecto** al reportar.
- **Se reportan hechos y zonas, NUNCA personas** (sin nombres, fotos ni placas de presuntos responsables); el formulario lo advierte.
- Siempre se muestran los **números oficiales** y el aviso de que la app no reemplaza a las emergencias.

## Documentación Adicional

- [**Datos, Impacto y Resultados**](docs/datos_impacto_resultados.md) — Justificación del modelo de datos abiertos, métricas clave (uso, impacto y equidad) y estructura del panel de estadísticas.

---

## Stack
React + Vite + TypeScript · Tailwind CSS · React Router · react-leaflet + OpenStreetMap (sin API keys) · leaflet.heat · lucide-react · PWA (`manifest` + service worker).
