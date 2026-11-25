/**
 * chsh-mermin-rooms.js
 * 15 Progressive Escape Rooms across 4 Quantum Phases:
 * Phase I: Classical Limits & The 75% Bell Barrier (Rooms 1-4)
 * Phase II: Tsirelson Bound & CHSH Quantum Violation (Rooms 5-8)
 * Phase III: GHZ Mermin Non-locality (Rooms 9-11)
 * Phase IV: Teleportation & Mermin-Peres Magic Square (Rooms 12-15)
 */

export const ESCAPE_ROOMS = [
  // --- FASE I: LA BARRERA CLÁSICA ---
  {
    id: 1,
    name: 'Cámara 1: El Dilema de la Esclusa Aislada',
    phase: 'Fase I: Límites Clásicos (LHV)',
    description: 'Alice y Bob se encuentran en cámaras herméticas. El Verificador les envía una señal binaria. Prueba la estrategia clásica y descubre por qué la intuición falla en el mundo microscópico.',
    mode: 'chsh',
    targetScore: 3,
    roundsCount: 4,
    requiredS: null,
    minWinRate: 50,
    hint: 'Con estrategias clásicas fijas (ej. siempre responder 0), ganarás en 3 de los 4 casos posibles (x,y in {(0,0),(0,1),(1,0)}).',
    angles: { thetaA0: 0, thetaA1: 0, thetaB0: 0, thetaB1: 0 }
  },
  {
    id: 2,
    name: 'Cámara 2: El Techo de Variables Ocultas',
    phase: 'Fase I: Límites Clásicos (LHV)',
    description: 'Supera 20 rondas con cualquier bot de variables ocultas compartidas. Demuestra que el éxito promedio está acotado estrictamente a un máximo de 75%.',
    mode: 'chsh',
    targetScore: 15,
    roundsCount: 20,
    requiredS: null,
    minWinRate: 70,
    hint: 'No existe variable oculta clásica compartida capaz de superar el 75% en promedio si no hay comunicación FTL (faster-than-light).',
    angles: { thetaA0: 0, thetaA1: 0, thetaB0: 0, thetaB1: 0 }
  },
  {
    id: 3,
    name: 'Cámara 3: El Teorema No-Signaling',
    phase: 'Fase I: Límites Clásicos (LHV)',
    description: 'Alice intenta alterar sus mediciones para enviar un mensaje clásico a Bob a través del canal entrelazado. Comprueba empíricamente que la probabilidad marginal de Bob permanece invariante (P(b) = 1/2).',
    mode: 'no_signaling',
    targetScore: 10,
    roundsCount: 10,
    requiredS: null,
    minWinRate: 80,
    hint: 'El entrelazamiento cuántico no permite transmitir información instantánea (No-Signaling), solo correlaciones intrínsecas.',
    angles: { thetaA0: 0, thetaA1: Math.PI / 2, thetaB0: Math.PI / 4, thetaB1: -Math.PI / 4 }
  },
  {
    id: 4,
    name: 'Cámara 4: El Desafío de la Cota de Bell S = 2.0',
    phase: 'Fase I: Límites Clásicos (LHV)',
    description: 'Ejecuta un experimento batch de 50 rondas clásicas y calcula el parámetro de Clauser-Horne-Shimony-Holt (S). Verifica que S <= 2.0.',
    mode: 'chsh',
    targetScore: 38,
    roundsCount: 50,
    requiredS: 2.0,
    minWinRate: 72,
    hint: 'Bajo física clásica local, S = |E(0,0) + E(0,1) + E(1,0) - E(1,1)| <= 2.',
    angles: { thetaA0: 0, thetaA1: 0, thetaB0: 0, thetaB1: 0 }
  },

  // --- FASE II: LA RUPTURA CUÁNTICA DE TSIRELSON ---
  {
    id: 5,
    name: 'Cámara 5: Activación del Par Entrelazado EPR',
    phase: 'Fase II: Violación CHSH y Cota de Tsirelson',
    description: 'Activa la fuente de pares de Bell |Phi+> = (|00> + |11>)/sqrt(2). Ajusta las bases a los ángulos canónicos de Tsirelson para romper por primera vez la barrera del 75%.',
    mode: 'chsh',
    targetScore: 9,
    roundsCount: 10,
    requiredS: 2.2,
    minWinRate: 80,
    hint: 'Configura thetaA = (0, pi/2) y thetaB = (pi/4, -pi/4). Observa cómo la tasa de éxito sube al ~85.3%.',
    angles: { thetaA0: 0, thetaA1: Math.PI / 2, thetaB0: Math.PI / 4, thetaB1: -Math.PI / 4 }
  },
  {
    id: 6,
    name: 'Cámara 6: Calibración Fina de Detectores Tsirelson',
    phase: 'Fase II: Violación CHSH y Cota de Tsirelson',
    description: 'Alice rota en pasos de pi/8 y Bob en -pi/8. Logra un parámetro S experimental superior a 2.5 en 30 rondas.',
    mode: 'chsh',
    targetScore: 26,
    roundsCount: 30,
    requiredS: 2.5,
    minWinRate: 83,
    hint: 'La cota cuántica máxima (Cota de Tsirelson) es 2 * sqrt(2) ≈ 2.8284.',
    angles: { thetaA0: 0, thetaA1: Math.PI / 2, thetaB0: Math.PI / 4, thetaB1: -Math.PI / 4 }
  },
  {
    id: 7,
    name: 'Cámara 7: Asalto a la Cota Absoluta (S ≈ 2.828)',
    phase: 'Fase II: Violación CHSH y Cota de Tsirelson',
    description: 'Enfrenta 50 rondas automáticas bajo ráfagas pseudoaleatorias. El blindaje se abrirá si demuestras la no-localidad cuántica con S >= 2.6.',
    mode: 'chsh',
    targetScore: 42,
    roundsCount: 50,
    requiredS: 2.6,
    minWinRate: 84,
    hint: 'Ningún algoritmo clásico en el universo puede alcanzar este nivel sin telepatía o comunicación oculta.',
    angles: { thetaA0: 0, thetaA1: Math.PI / 2, thetaB0: Math.PI / 4, thetaB1: -Math.PI / 4 }
  },
  {
    id: 8,
    name: 'Cámara 8: Síntesis de los 4 Estados de Bell',
    phase: 'Fase II: Violación CHSH y Cota de Tsirelson',
    description: 'Modifica la fase y paridad del generador para probar los estados |Phi->, |Psi+> y |Psi-> con inversiones de correlación.',
    mode: 'chsh',
    targetScore: 18,
    roundsCount: 20,
    requiredS: 2.4,
    minWinRate: 80,
    hint: 'El cambio a |Psi+> invierte las coincidencias: 01 y 10 son ahora los estados de máxima probabilidad.',
    angles: { thetaA0: 0, thetaA1: Math.PI / 2, thetaB0: Math.PI / 4, thetaB1: -Math.PI / 4 }
  },

  // --- FASE III: NO-LOCALIDAD TOTAL (GHZ MERMIN GAME) ---
  {
    id: 9,
    name: 'Cámara 9: El Triplete GHZ (Greenberger-Horne-Zeilinger)',
    phase: 'Fase III: Paradoja GHZ Mermin',
    description: 'Charlie se une al equipo en una tercera cámara. Se genera un estado tripartito (|000> + |111>)/sqrt(2). Supera el primer reto x+y+z=0.',
    mode: 'ghz',
    targetScore: 5,
    roundsCount: 5,
    requiredS: null,
    minWinRate: 100,
    hint: 'Bajo mediciones conjuntas cuánticas en la base adecuada, la probabilidad de victoria es del 100% determinista.',
    angles: null
  },
  {
    id: 10,
    name: 'Cámara 10: La Paradoja de Mermin sin Desigualdades',
    phase: 'Fase III: Paradoja GHZ Mermin',
    description: 'A diferencia de CHSH donde se gana 85.3% en promedio, el juego de Mermin GHZ permite un 100% de victorias frente al máximo clásico de 75%. Completa 10 rondas perfectas.',
    mode: 'ghz',
    targetScore: 10,
    roundsCount: 10,
    requiredS: null,
    minWinRate: 100,
    hint: 'Verifica cómo a ^ b ^ c siempre coincide con x | y | z sin un solo fallo.',
    angles: null
  },
  {
    id: 11,
    name: 'Cámara 11: Desafío de Esclusa Tripartita',
    phase: 'Fase III: Paradoja GHZ Mermin',
    description: '20 rondas de ráfagas continuas de preguntas x,y,z in {0,1} respetando la promesa cuántica. Prueba la perfección cuántica.',
    mode: 'ghz',
    targetScore: 20,
    roundsCount: 20,
    requiredS: null,
    minWinRate: 100,
    hint: 'Demostración de que la mecánica cuántica no necesita promedios estadísticos para refutar el realismo local.',
    angles: null
  },

  // --- FASE IV: TELETRANSPORTACIÓN Y CUADRADO MÁGICO ---
  {
    id: 12,
    name: 'Cámara 12: Protocolo de Teletransportación Cuántica',
    phase: 'Fase IV: Teletransportación & Cuadrado Mágico',
    description: 'Alice posee un qubit en estado secreto |psi>. Realiza una medición de Bell con su mitad del par EPR y transmite 2 bits clásicos a Bob para reconstruir el estado.',
    mode: 'teleportation',
    targetScore: 5,
    roundsCount: 5,
    requiredS: null,
    minWinRate: 100,
    hint: 'Bob debe aplicar la compuerta de corrección adecuada (I, X, Z o ZX) según los 2 bits recibidos.',
    angles: null
  },
  {
    id: 13,
    name: 'Cámara 13: Fidelidad Unitaria en Canal Ruidoso',
    phase: 'Fase IV: Teletransportación & Cuadrado Mágico',
    description: 'Teletransporta 10 estados cuánticos arbitrarios aplicando feed-forward dinámico con fidelidad F = 1.0.',
    mode: 'teleportation',
    targetScore: 10,
    roundsCount: 10,
    requiredS: null,
    minWinRate: 100,
    hint: 'El teorema de no-clonación se respeta porque el estado original de Alice es destruido durante la medición de Bell.',
    angles: null
  },
  {
    id: 14,
    name: 'Cámara 14: El Cuadrado Mágico de Mermin-Peres',
    phase: 'Fase IV: Teletransportación & Cuadrado Mágico',
    description: 'Llena una cuadrícula de 3x3 donde las filas deben multiplicar a +1 y las columnas a -1 (en valores propios de Pauli). Clásicamente imposible; cuánticamente trivial con 2 pares entrelazados.',
    mode: 'magic_square',
    targetScore: 4,
    roundsCount: 4,
    requiredS: null,
    minWinRate: 100,
    hint: 'Mermin-Peres prueba la contextualidad cuántica (teorema de Kochen-Specker).',
    angles: null
  },
  {
    id: 15,
    name: 'Cámara 15: La Gran Fuga del Laboratorio Cuántico',
    phase: 'Fase IV: Teletransportación & Cuadrado Mágico',
    description: 'Desafío final: Combina una prueba CHSH de alta precisión (S > 2.7), una teletransportación de clave de seguridad y una ronda de Mermin GHZ para abrir la compuerta final.',
    mode: 'final_boss',
    targetScore: 3,
    roundsCount: 3,
    requiredS: 2.7,
    minWinRate: 90,
    hint: 'Demuestra dominio absoluto de los fundamentos galardonados con el Premio Nobel de Física 2022.',
    angles: { thetaA0: 0, thetaA1: Math.PI / 2, thetaB0: Math.PI / 4, thetaB1: -Math.PI / 4 }
  }
];
