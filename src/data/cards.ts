import { CardCategory, CardRarity, CardType, GameCard, TrickTiming } from '../types/game';

// ============================================================
// BASE DE CARTAS OFICIAL — GDD "Guerra Cubita" (Páginas 4-6)
// Mazo Global de 50 cartas: Fierros (Equipamientos, máx 1 por cubo)
// y Vueltas/Trucos (Magias de un solo uso).
// Clases del Barrio: 🔴 Bruta · 🔵 Protección · 🟢 Economía · 🟣 Táctica · 🟡 Astucia
// ============================================================

const W = CardType.WEAPON;
const T = CardType.TRICK;
const R = TrickTiming.RITUAL_ACTION;      // Uso inmediato (Acción 2)
const P = TrickTiming.PREPARED_STANCE;    // Postura preventiva en mesa

const BRUTA = CardCategory.BRUTA;
const PROT = CardCategory.PROTECCION;
const ECO = CardCategory.ECONOMIA;
const TAC = CardCategory.TACTICA;
const AST = CardCategory.ASTUCIA;

type C = [number, string, CardType, TrickTiming, CardCategory, string];

const RAW: C[] = [
  // ---------------------------------------------------------
  // CLASE BRUTA (Rojo) | Impacto y Fuerza Física (1-10)
  // Sinergia: +1 Daño extra al impacto. Rechazo: 1 HP de autodaño.
  // ---------------------------------------------------------
  [1, "El Dado-Garrote", W, R, BRUTA, "+1 al daño en tiradas de ataque ≥ 3."],
  [2, "La Manopla Dado-Pescueza", W, R, BRUTA, "+2 de daño. Desactiva robos por múltiplos de 5."],
  [3, "La Chuzadora Dadomada", W, R, BRUTA, "Tus tiradas base de 1 se convierten en 2."],
  [4, "El Cadenazo Dadolado", W, R, BRUTA, "+1 de daño si el rival objetivo tiene más HP que tú."],
  [5, "El Picahielo Muescado", W, R, BRUTA, "Al hacer daño, desequipa el arma del rival."],
  [6, "La Paliza de Esquina", T, R, BRUTA, "Ejecutas un segundo ataque básico inmediatamente en este turno (sin mods)."],
  [7, "La Pedrada Volada", T, R, BRUTA, "Inflige 2 de daño ineludible a un objetivo directo."],
  [8, "El Rompe-Suelo", T, R, BRUTA, "Destruye todas las cartas de Mesa activas en tu línea frontal enemiga."],
  [9, "El Chutazo de Adrenalina", T, R, BRUTA, "+3 de daño en tu próximo ataque, pero sufres 1 HP de autodaño al fin de turno."],
  [10, "El Susto de la Cuadra", T, R, BRUTA, "Todos tus aliados en mesa ganan +1 al D5 durante este turno."],

  // ---------------------------------------------------------
  // CLASE PROTECCIÓN (Azul) | Muros y Supervivencia (11-20)
  // Sinergia: Te curas 1 HP al usar/equipar. Rechazo: -1 al dado en tu próximo ataque.
  // ---------------------------------------------------------
  [11, "El Escudo Tapa-Alcantarilla", W, R, PROT, "Bloqueos Perfectos curan 1 HP en vez de robar carta."],
  [12, "Las Pisotón-Evasoras", W, R, PROT, "Descarta 1 carta para reducir a la mitad cualquier ataque entrante."],
  [13, "El Cubre-Cerebro", W, R, PROT, "Inmunidad total al daño ineludible y efectos de fuego amigo."],
  [14, "La Coraza de Cuaderno", W, R, PROT, "Reduce en 1 todo daño recibido proveniente de tiradas ≥ 4."],
  [15, "El Freno de Taxi", W, R, PROT, "Atacantes cuerpo a cuerpo reciben 1 de daño de retroceso al golpearte."],
  [16, "El Parapetazo", T, R, PROT, "Otorga un escudo temporal de 3 HP a un aliado durante esta ronda."],
  [17, "La Cortina de Mugre (Vape)", T, P, PROT, "Postura: Evades y cancelas por completo el próximo ataque entrante."],
  [18, "El Trago Remedio", T, R, PROT, "Cura inmediatamente 3 HP a cualquier personaje en el tablero."],
  [19, "El Esquive de Callejón", T, R, PROT, "Tu próxima defensa es considerada un Bloqueo Perfecto automático."],
  [20, "El Muro de Vóxel", T, P, PROT, "Postura: obstáculo de 4 HP frente a ti que absorbe el daño entrante."],

  // ---------------------------------------------------------
  // CLASE ECONOMÍA (Verde) | Abasto y Robos (21-30)
  // Sinergia: Robas 1 carta adicional. Rechazo: descarta 1 carta de tu mano.
  // ---------------------------------------------------------
  [21, "El Morral Vendedado", W, R, ECO, "Tu límite de mano sube de 2 a 3 cartas."],
  [22, "El Biberón Rascado", W, R, ECO, "Robas 2 cartas al cruzar umbrales de vida (múltiplos de 5) en lugar de 1."],
  [23, "El Trago del Azar", W, R, ECO, "Permite relanzar 1 dado tuyo al inicio de tu turno."],
  [24, "El Soplador de Chispas", W, R, ECO, "Recuperas 1 HP cada vez que descartes cartas de tu mano."],
  [25, "El Raspa-Bolsillos", W, R, ECO, "Robas 1 carta cada vez que un enemigo active un Truco."],
  [26, "La Chicha Energética", T, R, ECO, "Tienes 1 Acción Principal extra en este turno."],
  [27, "La Apuesta del Callejón", T, R, ECO, "Pierdes 2 HP voluntariamente para robar 3 cartas de la pila."],
  [28, "La Mezclada de Mazo", T, R, ECO, "Todos descartan su mano y roban la misma cantidad de vuelta."],
  [29, "El Hallazgo Rascado", T, R, ECO, "Rescata 1 carta del cementerio (descarte) y ponla en tu mano."],
  [30, "El Paga-Diario", T, R, ECO, "Robas 2 cartas ahora, pero no puedes robar nada el próximo turno."],

  // ---------------------------------------------------------
  // CLASE TÁCTICA (Púrpura) | Control y Anulación (31-40)
  // Sinergia: el rival objetivo pierde su Acción Libre. Rechazo: Silenciado 1 turno.
  // ---------------------------------------------------------
  [31, "El Apaga-Luz (Dardo)", W, R, TAC, "Al hacer daño, silencia las Habilidades del rival por 2 rondas."],
  [32, "El Traba-Turnos (Candado)", W, R, TAC, "Si el rival saca un 1 atacándote, pierde su Acción 2 de carta."],
  [33, "El Grito Ñero", W, R, TAC, "Reduce forzadamente en 1 todas las tiradas de ataque enemigas hacia ti."],
  [34, "El Enlace Maldito", W, R, TAC, "Si recibes daño, el atacante sufre 1 de daño directo garantizado."],
  [35, "El Resbalón", W, R, TAC, "Invalida mecánicamente el primer Bloqueo Perfecto del enemigo cada ronda."],
  [36, "El Tropiezo (Zancadilla)", T, R, TAC, "Cancela inmediatamente la Acción 1 (Ataque) de un rival."],
  [37, "El Madrugón", T, R, TAC, "Cambias tu posición en la cola de iniciativa con cualquier otro cubo."],
  [38, "La Desviación (Pararrayos)", T, P, TAC, "Postura: rediriges un ataque recibido hacia cualquier otro objetivo (incluso rivales)."],
  [39, "El Vencedor a Ciegas", T, R, TAC, "Nadie en la mesa puede usar cartas de Trucos durante la próxima ronda."],
  [40, "La Discordia (Chisme)", T, R, TAC, "Obliga a un enemigo a atacar a su propio aliado en su siguiente turno."],

  // ---------------------------------------------------------
  // CLASE ASTUCIA (Amarillo) | Robo y Evasión (41-50)
  // Sinergia: tu impacto de este turno es ineludible. Rechazo: revelas toda tu mano.
  // ---------------------------------------------------------
  [41, "La Navaja Dadomada", W, R, AST, "+1 Daño. Ignora habilidades de reducción de daño o armaduras pasivas."],
  [42, "El Pica-Bolsillos", W, R, AST, "Al hacer daño, robas 1 carta de la mano del rival."],
  [43, "La Carnada de Cartón", W, R, AST, "Quien te ataque debe quemar/descartar la primera carta de su mazo."],
  [44, "El Asusta-Novatos", W, R, AST, "Rivales con menos de 10 HP sufren un -1 al atacarte."],
  [45, "El Amuleto Tramposo", W, R, AST, "Tu margen de Bloqueo Perfecto se amplía a ±1 del dado rival."],
  [46, "El Despalomo Directo", T, R, AST, "Robas el arma equipada en la mesa del rival y te la pones tú mismo."],
  [47, "El Pega y Corre", T, R, AST, "Cambias de objetivo DESPUÉS de que el defensor original tire su dado de bloqueo."],
  [48, "La Desaparición", T, P, AST, "Postura: te vuelves intocable a los ataques directos por 1 ronda entera."],
  [49, "El Cambiazo", T, R, AST, "Cambia una carta de tu mano por una del cementerio rival."],
  [50, "El Despecho (Golpe Bajo)", T, R, AST, "2 de Daño e invalida todas las pasivas del rival por esta ronda."]
];

// Nombres cortos de icono (se usan como clave visual en la UI)
const ICON_KEYS: Record<number, string> = {
  1: "baseball_bat", 2: "fist", 3: "knife", 4: "chain", 5: "ice_pick",
  6: "boot", 7: "rock", 8: "hammer", 9: "sneakers", 10: "megaphone",
  11: "shield", 12: "sneakers", 13: "helmet", 14: "jacket", 15: "traffic_sign",
  16: "barrier", 17: "smoke", 18: "medkit", 19: "feint", 20: "voxel_wall",
  21: "backpack", 22: "baby_bottle", 23: "dart", 24: "battery", 25: "pocket",
  26: "energy_drink", 27: "money", 28: "chaos", 29: "trash", 30: "watch",
  31: "flashlight", 32: "lock", 33: "megaphone", 34: "link", 35: "banana",
  36: "trip", 37: "turn_swap", 38: "lightning_rod", 39: "blackout", 40: "gossip",
  41: "knife", 42: "pocket", 43: "cardboard", 44: "sunglasses", 45: "amulet",
  46: "armed_robbery", 47: "feint", 48: "vanish", 49: "exchange", 50: "low_blow"
};

// Rarezas según potencia mecánica (Fierros potentes / Trucos legendarios puntuales)
const RARITY_OVERRIDES: Partial<Record<number, CardRarity>> = {
  2: CardRarity.SUPER_RARA,   // Manopla Dado-Pescueza
  5: CardRarity.RARA,         // Picahielo Muescado
  8: CardRarity.RARA,         // Rompe-Suelo
  13: CardRarity.RARA,        // Cubre-Cerebro
  15: CardRarity.RARA,        // Freno de Taxi
  19: CardRarity.SUPER_RARA,  // Esquive de Callejón
  22: CardRarity.SUPER_RARA,  // Biberón Rascado
  25: CardRarity.RARA,        // Raspa-Bolsillos
  31: CardRarity.SUPER_RARA,  // Apaga-Luz
  35: CardRarity.RARA,        // Resbalón
  39: CardRarity.SUPER_RARA,  // Vencedor a Ciegas
  41: CardRarity.RARA,        // Navaja Dadomada
  45: CardRarity.SUPER_RARA,  // Amuleto Tramposo
  46: CardRarity.SUPER_RARA,  // Despalomo Directo
  50: CardRarity.LEGENDARIA   // Despecho (Golpe Bajo)
};

export const ALL_CARDS: GameCard[] = RAW.map(([id, name, type, timing, category, description]) => ({
  id,
  name,
  type,
  timing,
  description,
  iconKey: ICON_KEYS[id] || "card",
  category,
  rarity: RARITY_OVERRIDES[id] ?? CardRarity.BASICA,
  synergyEffect: description
}));

export function createShuffledDeck(): GameCard[] {
  return [...ALL_CARDS]
    .map(c => ({
      ...c,
      uid: `${c.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }))
    .sort(() => Math.random() - 0.5);
}
