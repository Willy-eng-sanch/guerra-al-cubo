import { CardCategory, CardRarity, CardType, GameCard, TrickTiming } from '../types/game';

export const ALL_CARDS: GameCard[] = [
  // ==========================================
  // ARMAS / EQUIPAMIENTO (1 - 30)
  // ==========================================
  {
    id: 1,
    name: "Bate de Aluminio",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "+1 Daño a tiradas de ataque de 3 o más.",
    iconKey: "baseball_bat",
    category: CardCategory.KABOOM,
    rarity: CardRarity.BASICA,
    synergyEffect: "¡Furia Kaboom! Al atacar con tirada de 5 o 6, el impacto gana +1 daño extra."
  },
  {
    id: 2,
    name: "Tapa de Alcantarilla",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Bloqueos perfectos curan 1 HP en lugar de robar carta.",
    iconKey: "shield",
    category: CardCategory.SOLAR,
    rarity: CardRarity.BASICA,
    synergyEffect: "¡Vigor Solar! Al equipar, recuperas 1 HP de inmediato."
  },
  {
    id: 3,
    name: "Cuchillo Mariposa",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Si sacas 5 al atacar, haces 1 de daño extra ineludible.",
    iconKey: "knife",
    category: CardCategory.FURTIVO,
    rarity: CardRarity.RARA,
    synergyEffect: "¡Filo Furtivo! El rival seleccionado tiene -1 en su próximo dado de bloqueo."
  },
  {
    id: 4,
    name: "Chaqueta de Cuero",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Todo daño recibido de 1 se reduce a 0.",
    iconKey: "jacket",
    category: CardCategory.GUARDIAN,
    rarity: CardRarity.RARA,
    synergyEffect: "¡Blindaje Guardián! Otorga una barrera que absorbe 1 punto de daño."
  },
  {
    id: 5,
    name: "Botas Punta de Acero",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Si el enemigo saca 1 al defender, sumas +1 a tu daño final.",
    iconKey: "boot",
    category: CardCategory.KABOOM,
    rarity: CardRarity.BASICA,
    synergyEffect: "¡Pisotón Kaboom! Inflige 1 de daño de chispa directo al rival al equipar."
  },
  {
    id: 6,
    name: "Puño de Hierro",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "+2 de Daño, pero no puedes ganar cartas por múltiplos de 5.",
    iconKey: "fist",
    category: CardCategory.KABOOM,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "¡Impacto Titánico! +1 Daño demoledor adicional a tiradas con cara 6."
  },
  {
    id: 7,
    name: "Escudo de Tránsito",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Aumenta tu rango de bloqueo a tu número +/- 1 (sin robo en adyacente).",
    iconKey: "traffic_sign",
    category: CardCategory.GUARDIAN,
    rarity: CardRarity.RARA,
    synergyEffect: "¡Señal Firme! Otorga 1 barrera de escudo inmediato a tu héroe."
  },
  {
    id: 8,
    name: "Gafas de Sol de Espejo",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Inmune a fijación obligatoria de objetivos y al Mal de Ojo.",
    iconKey: "sunglasses",
    category: CardCategory.FURTIVO,
    rarity: CardRarity.BASICA,
    synergyEffect: "¡Despiste! El rival pierde su blanco forzado actual."
  },
  {
    id: 9,
    name: "Tirachinas Mejorado",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Al atacar, si sacas 2 cuenta como 4.",
    iconKey: "slingshot",
    category: CardCategory.CEREBRAL,
    rarity: CardRarity.RARA,
    synergyEffect: "¡Tiro Calculado! 50% de probabilidad de reembolsar el PA gastado."
  },
  {
    id: 10,
    name: "Cadena de Moto",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Tu daño no se puede reducir por pasivas del rival.",
    iconKey: "chain",
    category: CardCategory.KABOOM,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "¡Golpe de Cadena! Hace 1 daño ineludible al objetivo al equipar."
  },
  {
    id: 11,
    name: "Casco de Obrero",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "El primer ataque de la ronda que recibas se reduce en 1.",
    iconKey: "helmet",
    category: CardCategory.GUARDIAN,
    rarity: CardRarity.BASICA,
    synergyEffect: "¡Protección Civil! Genera 1 punto de barrera de absorción."
  },
  {
    id: 12,
    name: "Bóxer de Púas",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Ataques efectivos reducen el HP máximo del rival en 1 (incurable).",
    iconKey: "knuckle",
    category: CardCategory.FURTIVO,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "¡Herida Abierta! El rival pierde 1 HP adicional por sangrado."
  },
  {
    id: 13,
    name: "Mochila de Repartidor",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Aumenta tu límite de cartas en mano a 3.",
    iconKey: "backpack",
    category: CardCategory.CEREBRAL,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "¡Entrega Express! Roba 1 carta adicional del Mazo Global de inmediato."
  },
  {
    id: 14,
    name: "Reloj Falso",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Si te roban o descartan esta carta, el culpable pierde 2 HP.",
    iconKey: "watch",
    category: CardCategory.CEREBRAL,
    rarity: CardRarity.BASICA,
    synergyEffect: "¡Tiempo Comprado! Al equipar, otorga 1 tirada de suerte."
  },
  {
    id: 15,
    name: "Guantes de Boxeo",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Tu D6 de ataque nunca puede sacar 1 (se convierte en 2).",
    iconKey: "boxing_glove",
    category: CardCategory.KABOOM,
    rarity: CardRarity.RARA,
    synergyEffect: "¡Gancho al Hígado! +1 Daño cuando tires la cara 6."
  },
  {
    id: 16,
    name: "Chaleco Casero",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Inmune a habilidades de daño directo que no tiren dados.",
    iconKey: "vest",
    category: CardCategory.GUARDIAN,
    rarity: CardRarity.RARA,
    synergyEffect: "¡Refuerzo de Tela! Suma +1 a la barra de Super-Bloqueo."
  },
  {
    id: 17,
    name: "Zapatillas Robadas",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Si fallas bloqueo, puedes descartar 1 carta para reducir daño a la mitad.",
    iconKey: "sneakers",
    category: CardCategory.FURTIVO,
    rarity: CardRarity.RARA,
    synergyEffect: "¡Evasión Ágil! El rival tiene -1 en su próximo ataque hacia ti."
  },
  {
    id: 18,
    name: "Palo de Escoba",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "+1 Daño contra personajes que tengan más de 10 HP.",
    iconKey: "broom",
    category: CardCategory.SOLAR,
    rarity: CardRarity.BASICA,
    synergyEffect: "¡Barrido Limpio! Si el rival tiene más HP que tú, te cura 1 HP."
  },
  {
    id: 19,
    name: "Láser de Bolsillo",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "El objetivo debe declarar su tirada de bloqueo ANTES de que tú tires el ataque.",
    iconKey: "laser",
    category: CardCategory.CEREBRAL,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "¡Cegera Mental! El defensor tiene -1 al dado de bloqueo."
  },
  {
    id: 20,
    name: "Spray de Pimienta",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Si haces daño, el rival tira su próximo ataque con -1 al dado.",
    iconKey: "spray",
    category: CardCategory.FURTIVO,
    rarity: CardRarity.BASICA,
    synergyEffect: "¡Ardor en los Ojos! El rival pierde 1 HP inmediato por irritación."
  },
  {
    id: 21,
    name: "Patineta Rota",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Inmunidad absoluta al estado Congelado.",
    iconKey: "skateboard",
    category: CardCategory.FURTIVO,
    rarity: CardRarity.BASICA,
    synergyEffect: "¡Impulso Urbano! Si estabas congelado, te descongela y otorga 1 PA."
  },
  {
    id: 22,
    name: "Batería de Coche",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Tus ataques hacen +1 de daño, pero pierdes 1 HP por turno.",
    iconKey: "battery",
    category: CardCategory.KABOOM,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "¡Sobrecarga de Voltios! +2 de daño de chispa directo al objetivo."
  },
  {
    id: 23,
    name: "Linterna Cegadora",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "El D6 defensivo de tus atacantes no puede superar el 4.",
    iconKey: "flashlight",
    category: CardCategory.SOLAR,
    rarity: CardRarity.RARA,
    synergyEffect: "¡Destello Solar! Cura 1 HP a tu héroe al equipar."
  },
  {
    id: 24,
    name: "Destornillador",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Al hacer daño, descartas la carta equipada del rival.",
    iconKey: "screwdriver",
    category: CardCategory.CEREBRAL,
    rarity: CardRarity.BASICA,
    synergyEffect: "¡Desarmar! Desactiva 1 postura enemiga si está activa."
  },
  {
    id: 25,
    name: "Navaja Suiza",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Permite equiparse sin gastar tu acción de cartas del turno.",
    iconKey: "swiss_knife",
    category: CardCategory.CEREBRAL,
    rarity: CardRarity.RARA,
    synergyEffect: "¡Multiherramienta! Reembolsa 1 PA inmediatamente al jugarla."
  },
  {
    id: 26,
    name: "Hombreras de Neumático",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Daño recibido de 4, 5 y 6 se reduce en 1.",
    iconKey: "shoulderpad",
    category: CardCategory.GUARDIAN,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "¡Blindaje de Caucho! Genera 2 puntos de barrera protectora."
  },
  {
    id: 27,
    name: "Machete Oxidado",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Si sacas 1 atacas a ti mismo (1 daño); si sacas 6, haces 8 de daño brutal.",
    iconKey: "machete",
    category: CardCategory.KABOOM,
    rarity: CardRarity.LEGENDARIA,
    synergyEffect: "¡Filo Temerario! Al atacar, inflige 1 daño colateral a todos los enemigos."
  },
  {
    id: 28,
    name: "Megáfono Viejo",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Anula las pasivas defensivas de tus rivales directos.",
    iconKey: "megaphone",
    category: CardCategory.SOLAR,
    rarity: CardRarity.RARA,
    synergyEffect: "¡Cántico de Ánimo! Te cura 2 HP al equipar."
  },
  {
    id: 29,
    name: "Cinta Aislante",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Las armas de tus rivales no aplican bonificadores de daño contra ti.",
    iconKey: "tape",
    category: CardCategory.GUARDIAN,
    rarity: CardRarity.BASICA,
    synergyEffect: "¡Reparación de Emergencia! Absorbe el próximo golpe recibido."
  },
  {
    id: 30,
    name: "Dardo Tranquilizante",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Tu daño tiene -1, pero el rival no puede activar habilidades si recibe impacto.",
    iconKey: "dart",
    category: CardCategory.FURTIVO,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "¡Veneno Lento! El rival no puede ganar PA extras en su turno."
  },

  // ==========================================
  // TRUCOS / MISCELÁNEOS (31 - 60)
  // ==========================================
  {
    id: 31,
    name: "Empujón Callejero",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Desequipa el arma o postura activa de un rival.",
    iconKey: "push",
    category: CardCategory.GUARDIAN,
    rarity: CardRarity.BASICA,
    synergyEffect: "¡Fuerza Bruta! Inflige 1 de daño de empuje al rival."
  },
  {
    id: 32,
    name: "Bolsillo Roto",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Elige un rival; debe descartar 1 carta al azar de su mano.",
    iconKey: "pocket",
    category: CardCategory.FURTIVO,
    rarity: CardRarity.RARA,
    synergyEffect: "¡Hurto Sombrío! Si el rival descartó, tú robas 1 carta del Mazo."
  },
  {
    id: 33,
    name: "Recarga de Adrenalina",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Recuperas 3 HP inmediatamente.",
    iconKey: "syringe",
    category: CardCategory.SOLAR,
    rarity: CardRarity.BASICA,
    synergyEffect: "¡Inyección Solar! Te cura +1 HP extra (total 4 HP)."
  },
  {
    id: 34,
    name: "Soborno en la Esquina",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Roba 2 cartas de la pila y descarta 1 de tu mano.",
    iconKey: "money",
    category: CardCategory.CEREBRAL,
    rarity: CardRarity.BASICA,
    synergyEffect: "¡Trato Dulce! No necesitas descartar carta si tienes sinergia Cerebral."
  },
  {
    id: 35,
    name: "Humo de Vape",
    type: CardType.TRICK,
    timing: TrickTiming.PREPARED_STANCE,
    description: "Postura Preventiva: Cancela y evade por completo el próximo ataque dirigido hacia ti.",
    iconKey: "smoke",
    category: CardCategory.FURTIVO,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "¡Niebla Venenosa! El atacante evadido sufre 1 de daño por asfixia."
  },
  {
    id: 36,
    name: "Finta Rápida",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Relanza tu dado de ataque en este turno si no te gustó el resultado.",
    iconKey: "feint",
    category: CardCategory.CEREBRAL,
    rarity: CardRarity.BASICA,
    synergyEffect: "¡Segunda Oportunidad! Suma +1 al nuevo resultado del dado."
  },
  {
    id: 37,
    name: "Espejismo Urbano",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Cambia tu objetivo después de que el defensor lance su dado de bloqueo.",
    iconKey: "mirage",
    category: CardCategory.FURTIVO,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "¡Ilusión Perfecta! El nuevo objetivo no puede lanzar dado de bloqueo."
  },
  {
    id: 38,
    name: "Botiquín Robado",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Cura 5 HP, pero no puedes atacar este turno.",
    iconKey: "medkit",
    category: CardCategory.SOLAR,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "¡Milagro Solar! También otorga 1 punto de barrera protectora."
  },
  {
    id: 39,
    name: "Interferencia Móvil",
    type: CardType.TRICK,
    timing: TrickTiming.PREPARED_STANCE,
    description: "Postura Preventiva: Anula el truco que active un rival.",
    iconKey: "phone_static",
    category: CardCategory.CEREBRAL,
    rarity: CardRarity.RARA,
    synergyEffect: "¡Hackeo Táctico! Robas la carta anulada para tu propia mano."
  },
  {
    id: 40,
    name: "Cortina de Basura",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Todos los bloqueos de tu equipo en esta ronda tienen +1 automático.",
    iconKey: "trashcan",
    category: CardCategory.GUARDIAN,
    rarity: CardRarity.BASICA,
    synergyEffect: "¡Barrera Sólida! Otorga 1 punto de escudo al aliado con menor vida."
  },
  {
    id: 41,
    name: "Café Alterado",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Ganas una acción extra (+1 PA) en este turno.",
    iconKey: "coffee",
    category: CardCategory.SOLAR,
    rarity: CardRarity.RARA,
    synergyEffect: "¡Subidón de Cafeína! También te cura 1 HP."
  },
  {
    id: 42,
    name: "Apagón Zonal",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Nadie puede usar habilidades de personaje en la próxima ronda.",
    iconKey: "blackout",
    category: CardCategory.CEREBRAL,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "¡Sobrecarga! Tú eres el único inmune al apagón."
  },
  {
    id: 43,
    name: "Chisme de Barrio",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Mira la mano de todos los jugadores de la mesa y roba 1 carta del mazo.",
    iconKey: "gossip",
    category: CardCategory.CEREBRAL,
    rarity: CardRarity.BASICA,
    synergyEffect: "¡Información Privilegiada! Elige qué carta descartar de un rival."
  },
  {
    id: 44,
    name: "Trampa de Ratones",
    type: CardType.TRICK,
    timing: TrickTiming.PREPARED_STANCE,
    description: "Postura Preventiva: El próximo jugador que robe una carta sufre 2 de daño ineludible.",
    iconKey: "mousetrap",
    category: CardCategory.FURTIVO,
    rarity: CardRarity.RARA,
    synergyEffect: "¡Cepillo Oxidado! La trampa hace +1 daño extra (3 de daño total)."
  },
  {
    id: 45,
    name: "Cambio de Turno",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Intercambia tu lugar en la iniciativa con otro jugador.",
    iconKey: "turn_swap",
    category: CardCategory.CEREBRAL,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "¡Sorpasso! Ganas +1 PA tras realizar el intercambio."
  },
  {
    id: 46,
    name: "Extorsión",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Un rival a elección te da una carta de su mano o pierde 3 HP.",
    iconKey: "extortion",
    category: CardCategory.FURTIVO,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "¡Chantaje Implacable! Si elige perder 3 HP, tú te curas 1 HP."
  },
  {
    id: 47,
    name: "Grito de Guerra",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "En esta ronda, todos los ataques base de tu bando hacen +1 daño.",
    iconKey: "battlecry",
    category: CardCategory.KABOOM,
    rarity: CardRarity.RARA,
    synergyEffect: "¡Furia Colectiva! Inflige 1 daño de impacto directo al rival líder."
  },
  {
    id: 48,
    name: "Zancadilla",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "El objetivo pierde su próxima acción de ataque.",
    iconKey: "trip",
    category: CardCategory.FURTIVO,
    rarity: CardRarity.BASICA,
    synergyEffect: "¡Caída Humillante! El objetivo sufre 1 de daño de golpe contra el suelo."
  },
  {
    id: 49,
    name: "Bebida Energética",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Si tienes 6 HP o menos, recuperas 4 HP de inmediato.",
    iconKey: "energy_drink",
    category: CardCategory.SOLAR,
    rarity: CardRarity.RARA,
    synergyEffect: "¡Segunda Vitalidad! Te otorga 1 punto de escudo adicional."
  },
  {
    id: 50,
    name: "Robo Armado",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Roba la carta equipada de un rival y equípatela en tu mesa de inmediato.",
    iconKey: "armed_robbery",
    category: CardCategory.KABOOM,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "¡Atraco Violento! Inflige 1 de daño al rival despojado."
  },
  {
    id: 51,
    name: "Sabotaje",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "El próximo dado que lance un rival cuenta obligatoriamente como un 1.",
    iconKey: "sabotage",
    category: CardCategory.CEREBRAL,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "¡Fallo Crítico! El rival no puede activar posturas ese turno."
  },
  {
    id: 52,
    name: "Falsa Alarma",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Obliga a todos los rivales a devolver 1 carta de su mano al mazo.",
    iconKey: "alarm",
    category: CardCategory.CEREBRAL,
    rarity: CardRarity.RARA,
    synergyEffect: "¡Pánico en la Calle! Tú robas 1 carta adicional del Mazo Global."
  },
  {
    id: 53,
    name: "Reflejo Felino",
    type: CardType.TRICK,
    timing: TrickTiming.PREPARED_STANCE,
    description: "Postura Preventiva: Tu próximo bloqueo cuenta como perfecto automáticamente.",
    iconKey: "cat_reflex",
    category: CardCategory.FURTIVO,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "¡Contragolpe de Sombra! El atacante sufre 1 de daño reflejado."
  },
  {
    id: 54,
    name: "Contrato Sombrío",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Pierdes 2 HP, pero robas 3 cartas directas del Mazo Global.",
    iconKey: "dark_contract",
    category: CardCategory.FURTIVO,
    rarity: CardRarity.LEGENDARIA,
    synergyEffect: "¡Pacto Oscuro! Si tu HP es menor a 8, la pérdida de vida se anula."
  },
  {
    id: 55,
    name: "Pararrayos",
    type: CardType.TRICK,
    timing: TrickTiming.PREPARED_STANCE,
    description: "Postura Preventiva: Redirige el ataque que recibas hacia otro rival de tu elección.",
    iconKey: "lightning_rod",
    category: CardCategory.GUARDIAN,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "¡Conducción Eléctrica! El rival que recibe el desvío sufre +1 daño extra."
  },
  {
    id: 56,
    name: "Impuestos del Asfalto",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Todos los jugadores con 2 o más cartas en mano descartan 1.",
    iconKey: "tax",
    category: CardCategory.GUARDIAN,
    rarity: CardRarity.RARA,
    synergyEffect: "¡Cobro Justo! Recuperas 1 HP por cada carta descartada por rivales."
  },
  {
    id: 57,
    name: "Venganza Fría",
    type: CardType.TRICK,
    timing: TrickTiming.PREPARED_STANCE,
    description: "Postura Preventiva: Devuelve el 100% del daño que acabes de recibir al atacante.",
    iconKey: "revenge",
    category: CardCategory.KABOOM,
    rarity: CardRarity.LEGENDARIA,
    synergyEffect: "¡Retribución Ígnea! Inflige +1 de daño adicional al atacante vengado."
  },
  {
    id: 58,
    name: "Sorteo Caótico",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Todos descartan su mano entera y roban la misma cantidad de la pila.",
    iconKey: "chaos",
    category: CardCategory.CEREBRAL,
    rarity: CardRarity.RARA,
    synergyEffect: "¡Mano Bendecida! Tú robas +1 carta adicional por encima de tu descarte."
  },
  {
    id: 59,
    name: "Último Aliento",
    type: CardType.TRICK,
    timing: TrickTiming.PREPARED_STANCE,
    description: "Postura Preventiva: Si un ataque te dejaría en 0 HP, quedas con 1 HP milagroso.",
    iconKey: "last_breath",
    category: CardCategory.GUARDIAN,
    rarity: CardRarity.LEGENDARIA,
    synergyEffect: "¡Voluntad de Hierro! Al activarse, te cura de inmediato 3 HP adicionales."
  },
  {
    id: 60,
    name: "El Comodín",
    type: CardType.TRICK,
    timing: TrickTiming.PREPARED_STANCE,
    description: "Postura Preventiva: Cuenta como cualquier número del 1 al 6 para tu próximo bloqueo perfecto.",
    iconKey: "joker",
    category: CardCategory.CEREBRAL,
    rarity: CardRarity.LEGENDARIA,
    synergyEffect: "¡Jugada Maestra! Al bloquear con El Comodín, ganas +1 PA para tu próximo turno."
  }
];

export function createShuffledDeck(): GameCard[] {
  return [...ALL_CARDS]
    .map(c => ({
      ...c,
      uid: `${c.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }))
    .sort(() => Math.random() - 0.5);
}
