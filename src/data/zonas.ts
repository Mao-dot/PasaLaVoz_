import type { ZonaCaliente } from './types'

// Zonas calientes del prototipo, trazadas a mano siguiendo la trama de
// avenidas reales de cada distrito (estilo Waze: manzanas, no círculos).
// Un reporte "enciende" la zona cuyo polígono lo contiene; los tramos son
// las calles que se pintan de color, como el tráfico en Waze.
export const zonasCalientes: ZonaCaliente[] = [
  {
    id: 'z_miraflores_centro',
    nombre: 'Parque Kennedy y alrededores',
    distrito: 'Miraflores',
    // Encerrada por Av. José Pardo (N), Paseo de la República (E),
    // Av. Benavides (S) y la zona del malecón (O).
    // Vértices y tramos ajustados con la geometría real de OSM.
    poligono: [
      [-12.1188, -77.0405], // Pardo x malecón (NO)
      [-12.1189, -77.0280], // Pardo x Kennedy (NE)
      [-12.1213, -77.0247], // R. Palma x Paseo de la República (E)
      [-12.1268, -77.0258], // Benavides x Paseo de la República (SE)
      [-12.1281, -77.0300], // Benavides x Larco (S)
      [-12.1252, -77.0370], // 28 de Julio x malecón (SO)
    ],
    tramos: [
      // Av. Larco (Kennedy → sur)
      [
        [-12.1199, -77.0290],
        [-12.1242, -77.0293],
        [-12.1272, -77.0295],
      ],
      // Av. José Pardo (Kennedy → malecón)
      [
        [-12.1192, -77.0296],
        [-12.1191, -77.0345],
        [-12.1189, -77.0395],
      ],
    ],
  },
  {
    id: 'z_cercado_2mayo',
    nombre: 'Plaza 2 de Mayo — Av. Alfonso Ugarte',
    distrito: 'Cercado de Lima',
    // Encerrada por Av. Óscar Benavides / Colonial (S), Av. Alfonso Ugarte (E)
    // y las cuadras hacia la Av. Arica (O).
    poligono: [
      [-12.0412, -77.0478], // NO
      [-12.0418, -77.0392], // NE
      [-12.0468, -77.0376], // E
      [-12.0508, -77.0392], // SE
      [-12.0512, -77.0458], // SO
      [-12.0462, -77.0476], // O
    ],
    tramos: [
      // Av. Alfonso Ugarte (N → S), geometría real de OSM
      [
        [-12.0420, -77.0432],
        [-12.0461, -77.0430],
        [-12.0499, -77.0423],
      ],
      // Av. Óscar Benavides (Colonial), hacia el oeste
      [
        [-12.0464, -77.0435],
        [-12.0468, -77.0470],
      ],
    ],
  },
  {
    id: 'z_barranco_grau',
    nombre: 'Centro de Barranco — Av. Grau',
    distrito: 'Barranco',
    // Corredor de Av. Grau entre el parque municipal y la zona de bares.
    poligono: [
      [-12.1418, -77.0246], // NO
      [-12.1424, -77.0184], // NE
      [-12.1482, -77.0168], // E
      [-12.1522, -77.0192], // SE
      [-12.1520, -77.0242], // SO
      [-12.1462, -77.0256], // O
    ],
    tramos: [
      // Av. Grau (N → S), geometría real de OSM
      [
        [-12.1429, -77.0220],
        [-12.1468, -77.0216],
        [-12.1505, -77.0204],
      ],
    ],
  },
]
