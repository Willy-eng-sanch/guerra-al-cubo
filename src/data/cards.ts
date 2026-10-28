import { CardCategory, CardRarity, CardType, GameCard, TrickTiming } from '../types/game';

// Base de Cartas Oficial del Manual Táctico (50 cartas en 5 Clases)
export const ALL_CARDS: GameCard[] = [
  // ==========================================
  // CLASE BRUTA (ROJO) | IMPACTO Y FUERZA FÍSICA (1 - 10)
  // Sinergia: +1 Daño extra al impacto | Rechazo: 1 HP autodaño al usar/equipar
  // ==========================================
  {
    id: 1,
    name: "El Dado-Garrote",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "+1 al daño en tiradas de ataque ≥ 3.",
    iconKey: "baseball_bat",
    category: CardCategory.BRUTA,
    rarity: CardRarity.BASICA,
    synergyEffect: "Sinergia Bruta: +1 de Daño extra al impacto garantizado.",
    isFierro: true
  },
  {
    id: 2,
    name: "La Manopla Dado-Pescueza",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "+2 de daño. Desactiva robos por múltiplos de 5 del rival.",
    iconKey: "brass_knuckles",
    category: CardCategory.BRUTA,
    rarity: CardRarity.RARA,
    synergyEffect: "Sinergia Bruta: +1 de Daño extra demoledor.",
    isFierro: true
  },
  {
    id: 3,
    name: "La Chuzadora Dadomada",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Tus tiradas base de 1 se convierten en 2.",
    iconKey: "knife",
    category: CardCategory.BRUTA,
    rarity: CardRarity.BASICA,
    synergyEffect: "Sinergia Bruta: +1 Daño extra en cada impacto certero.",
    isFierro: true
  },
  {
    id: 4,
    name: "El Cadenazo Dadolado",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "+1 de daño si el rival objetivo tiene más HP que tú.",
    iconKey: "chain",
    category: CardCategory.BRUTA,
    rarity: CardRarity.RARA,
    synergyEffect: "Sinergia Bruta: +1 de Daño extra al impacto.",
    isFierro: true
  },
  {
    id: 5,
    name: "El Picahielo Muescado",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Al hacer daño, desequipa el arma del rival.",
    iconKey: "ice_pick",
    category: CardCategory.BRUTA,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "Sinergia Bruta: +1 de Daño extra al impacto.",
    isFierro: true
  },
  {
    id: 6,
    name: "La Paliza de Esquina",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Ejecutas un segundo ataque básico inmediatamente en este turno (sin modificadores).",
    iconKey: "fist_barrage",
    category: CardCategory.BRUTA,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "Sinergia Bruta: Ambos ataques reciben +1 de Daño adicional."
  },
  {
    id: 7,
    name: "La Pedrada Volada",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Inflige 2 de daño ineludible a un objetivo directo sin tirada de bloqueo.",
    iconKey: "flying_stone",
    category: CardCategory.BRUTA,
    rarity: CardRarity.BASICA,
    synergyEffect: "Sinergia Bruta: Se suman +1 de daño directo (total 3 ineludible)."
  },
  {
    id: 8,
    name: "El Rompe-Suelo",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Destruye todas las cartas de Mesa activas en tu línea frontal enemiga.",
    iconKey: "ground_slam",
    category: CardCategory.BRUTA,
    rarity: CardRarity.LEGENDARIA,
    synergyEffect: "Sinergia Bruta: +1 de Daño por cada carta de mesa destruida."
  },
  {
    id: 9,
    name: "El Chutazo de Adrenalina",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "+3 de daño en tu próximo ataque, pero sufres 1 HP de autodaño al fin de turno.",
    iconKey: "syringe",
    category: CardCategory.BRUTA,
    rarity: CardRarity.RARA,
    synergyEffect: "Sinergia Bruta: +1 de Daño adicional (total +4 al impacto)."
  },
  {
    id: 10,
    name: "El Susto de la Cuadra",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Todos los aliados en mesa ganan +1 a sus dados durante este turno.",
    iconKey: "shout",
    category: CardCategory.BRUTA,
    rarity: CardRarity.RARA,
    synergyEffect: "Sinergia Bruta: Suma además +1 de Daño a cada combatiente afín."
  },

  // ==========================================
  // CLASE PROTECCIÓN (AZUL) | MUROS Y SUPERVIVENCIA (11 - 20)
  // Sinergia: Te curas 1 HP al activar/equipar | Rechazo: Tu próximo ataque sufre -1 al dado
  // ==========================================
  {
    id: 11,
    name: "El Escudo Tapa-Alcantarilla",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Bloqueos Perfectos curan 1 HP en vez de robar carta.",
    iconKey: "sewer_shield",
    category: CardCategory.PROTECCION,
    rarity: CardRarity.BASICA,
    synergyEffect: "Sinergia Protección: Te curas 1 HP adicional de inmediato al equipar.",
    isFierro: true
  },
  {
    id: 12,
    name: "Las Pisotón-Evasoras",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Descarta 1 carta para reducir a la mitad cualquier ataque entrante.",
    iconKey: "evasion_boots",
    category: CardCategory.PROTECCION,
    rarity: CardRarity.RARA,
    synergyEffect: "Sinergia Protección: Cura 1 HP al equipar y refuerza tu guardia.",
    isFierro: true
  },
  {
    id: 13,
    name: "El Cubre-Cerebro",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Inmunidad total al daño ineludible y efectos de fuego amigo.",
    iconKey: "helmet",
    category: CardCategory.PROTECCION,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "Sinergia Protección: Recupera 1 HP al equipar.",
    isFierro: true
  },
  {
    id: 14,
    name: "La Coraza de Cuaderno",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Reduce en 1 todo daño recibido proveniente de tiradas ≥ 4.",
    iconKey: "notebook_armor",
    category: CardCategory.PROTECCION,
    rarity: CardRarity.BASICA,
    synergyEffect: "Sinergia Protección: Te curas 1 HP al equipar.",
    isFierro: true
  },
  {
    id: 15,
    name: "El Freno de Taxi",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Atacantes cuerpo a cuerpo reciben 1 de daño de retroceso al golpearte.",
    iconKey: "taxi_brake",
    category: CardCategory.PROTECCION,
    rarity: CardRarity.RARA,
    synergyEffect: "Sinergia Protección: Te curas 1 HP al equipar.",
    isFierro: true
  },
  {
    id: 16,
    name: "El Parapetazo",
    type: CardType.TRICK,
    timing: TrickTiming.PREPARED_STANCE,
    description: "Otorga un escudo temporal de 3 HP a un aliado durante esta ronda.",
    iconKey: "cardboard_barricade",
    category: CardCategory.PROTECCION,
    rarity: CardRarity.BASICA,
    synergyEffect: "Sinergia Protección: Te curas 1 HP adicional al desplegar."
  },
  {
    id: 17,
    name: "La Cortina de Mugre (Vape)",
    type: CardType.TRICK,
    timing: TrickTiming.PREPARED_STANCE,
    description: "Evades y cancelas por completo el próximo ataque entrante.",
    iconKey: "smoke_screen",
    category: CardCategory.PROTECCION,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "Sinergia Protección: Recuperas 1 HP tras la evasión."
  },
  {
    id: 18,
    name: "El Trago Remedio",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Cura inmediatamente 3 HP a cualquier personaje en el tablero.",
    iconKey: "tonic_bottle",
    category: CardCategory.PROTECCION,
    rarity: CardRarity.BASICA,
    synergyEffect: "Sinergia Protección: Cura +1 HP extra (total 4 HP)."
  },
  {
    id: 19,
    name: "El Esquive de Callejón",
    type: CardType.TRICK,
    timing: TrickTiming.PREPARED_STANCE,
    description: "Tu próxima defensa es considerada un Bloqueo Perfecto automático.",
    iconKey: "sidestep",
    category: CardCategory.PROTECCION,
    rarity: CardRarity.LEGENDARIA,
    synergyEffect: "Sinergia Protección: Te curas 1 HP al activar el Bloqueo Perfecto."
  },
  {
    id: 20,
    name: "El Muro de Vóxel",
    type: CardType.TRICK,
    timing: TrickTiming.PREPARED_STANCE,
    description: "Pone un obstáculo de 4 HP frente a un aliado para absorber daño.",
    iconKey: "brick_wall",
    category: CardCategory.PROTECCION,
    rarity: CardRarity.RARA,
    synergyEffect: "Sinergia Protección: Otorga +1 HP de curación a quien lo respalde."
  },

  // ==========================================
  // CLASE ECONOMÍA (VERDE) | ABASTO Y ROBOS (21 - 30)
  // Sinergia: Robas 1 carta adicional de la pila | Rechazo: Debes descartar 1 carta de tu mano
  // ==========================================
  {
    id: 21,
    name: "El Morral Vendedado",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Tu límite de mano inactiva sube de 2 a 3 cartas.",
    iconKey: "backpack",
    category: CardCategory.ECONOMIA,
    rarity: CardRarity.BASICA,
    synergyEffect: "Sinergia Economía: Robas 1 carta adicional de la pila general al equipar.",
    isFierro: true
  },
  {
    id: 22,
    name: "El Biberón Rascado",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Robas 2 cartas al cruzar umbrales de vida (múltiplos de 5) en lugar de 1.",
    iconKey: "baby_bottle",
    category: CardCategory.ECONOMIA,
    rarity: CardRarity.RARA,
    synergyEffect: "Sinergia Economía: Robas 1 carta de la pila general de inmediato.",
    isFierro: true
  },
  {
    id: 23,
    name: "El Trago del Azar",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Permite relanzar 1 dado tuyo al inicio de tu turno.",
    iconKey: "lucky_flask",
    category: CardCategory.ECONOMIA,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "Sinergia Economía: Robas 1 carta adicional al equipar.",
    isFierro: true
  },
  {
    id: 24,
    name: "El Soplador de Chispas",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Recuperas 1 HP cada vez que descartes cartas de tu mano.",
    iconKey: "bellows",
    category: CardCategory.ECONOMIA,
    rarity: CardRarity.BASICA,
    synergyEffect: "Sinergia Economía: Robas 1 carta de la pila al equipar.",
    isFierro: true
  },
  {
    id: 25,
    name: "El Raspa-Bolsillos",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Robas 1 carta cada vez que un enemigo active un Truco.",
    iconKey: "pickpocket_hook",
    category: CardCategory.ECONOMIA,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "Sinergia Economía: Robas 1 carta extra inmediata al equipar.",
    isFierro: true
  },
  {
    id: 26,
    name: "La Chicha Energética",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Tienes 1 Acción Principal extra en este turno.",
    iconKey: "energy_drink",
    category: CardCategory.ECONOMIA,
    rarity: CardRarity.RARA,
    synergyEffect: "Sinergia Economía: Robas 1 carta adicional de la pila general."
  },
  {
    id: 27,
    name: "La Apuesta del Callejón",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Pierdes 2 HP voluntariamente para robar 3 cartas de la pila.",
    iconKey: "dice_cup_icon",
    category: CardCategory.ECONOMIA,
    rarity: CardRarity.RARA,
    synergyEffect: "Sinergia Economía: Robas 1 cuarta carta de bonificación (total 4)."
  },
  {
    id: 28,
    name: "La Mezclada de Mazo",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Todos descartan su mano y roban la misma cantidad de vuelta.",
    iconKey: "deck_shuffle",
    category: CardCategory.ECONOMIA,
    rarity: CardRarity.BASICA,
    synergyEffect: "Sinergia Economía: Tú robas +1 carta extra por encima de los demás."
  },
  {
    id: 29,
    name: "El Hallazgo Rascado",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Rescata 1 carta de tu cementerio (descarte) y ponla en tu mano.",
    iconKey: "recycle_bin",
    category: CardCategory.ECONOMIA,
    rarity: CardRarity.BASICA,
    synergyEffect: "Sinergia Economía: Robas además 1 carta de la pila de robo."
  },
  {
    id: 30,
    name: "El Paga-Diario",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Robas 2 cartas ahora, pero no puedes robar nada el próximo turno.",
    iconKey: "loan_cash",
    category: CardCategory.ECONOMIA,
    rarity: CardRarity.LEGENDARIA,
    synergyEffect: "Sinergia Economía: Robas 3 cartas ahora en lugar de 2."
  },

  // ==========================================
  // CLASE TÁCTICA (PÚRPURA) | CONTROL Y ANULACIÓN (31 - 40)
  // Sinergia: El rival objetivo pierde su Acción Libre | Rechazo: Quedas Silenciado por 1 turno
  // ==========================================
  {
    id: 31,
    name: "El Apaga-Luz (Dardo)",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Al hacer daño, silencias las Habilidades del rival por 2 rondas.",
    iconKey: "blowgun",
    category: CardCategory.TACTICA,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "Sinergia Táctica: El rival atacado pierde su Acción Libre.",
    isFierro: true
  },
  {
    id: 32,
    name: "El Traba-Turnos (Candado)",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Si el rival saca un 1 atacándote, pierde su Acción 2 de carta.",
    iconKey: "padlock",
    category: CardCategory.TACTICA,
    rarity: CardRarity.BASICA,
    synergyEffect: "Sinergia Táctica: El rival objetivo pierde su Acción Libre.",
    isFierro: true
  },
  {
    id: 33,
    name: "El Grito Ñero",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Reduce forzadamente en 1 todas las tiradas de ataque enemigas en tu línea.",
    iconKey: "war_horn",
    category: CardCategory.TACTICA,
    rarity: CardRarity.RARA,
    synergyEffect: "Sinergia Táctica: El rival pierde su Acción Libre.",
    isFierro: true
  },
  {
    id: 34,
    name: "El Enlace Maldito",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Si recibes daño, el atacante sufre 1 de daño directo garantizado.",
    iconKey: "voodoo_doll",
    category: CardCategory.TACTICA,
    rarity: CardRarity.RARA,
    synergyEffect: "Sinergia Táctica: Anula la Acción Libre del objetivo.",
    isFierro: true
  },
  {
    id: 35,
    name: "El Resbalón",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Invalida mecánicamente el primer Bloqueo Perfecto del enemigo cada ronda.",
    iconKey: "banana_peel",
    category: CardCategory.TACTICA,
    rarity: CardRarity.LEGENDARIA,
    synergyEffect: "Sinergia Táctica: El rival pierde su Acción Libre.",
    isFierro: true
  },
  {
    id: 36,
    name: "El Tropiezo (Zancadilla)",
    type: CardType.TRICK,
    timing: TrickTiming.PREPARED_STANCE,
    description: "Cancela inmediatamente la Acción 1 (Ataque) de un rival al activarse.",
    iconKey: "tripwire",
    category: CardCategory.TACTICA,
    rarity: CardRarity.BASICA,
    synergyEffect: "Sinergia Táctica: El rival pierde su Acción Libre."
  },
  {
    id: 37,
    name: "El Madrugón",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Cambias tu posición en la cola de iniciativa con cualquier otro cubo.",
    iconKey: "alarm_clock",
    category: CardCategory.TACTICA,
    rarity: CardRarity.RARA,
    synergyEffect: "Sinergia Táctica: El objetivo desplazado pierde su Acción Libre."
  },
  {
    id: 38,
    name: "La Desviación (Pararrayos)",
    type: CardType.TRICK,
    timing: TrickTiming.PREPARED_STANCE,
    description: "Rediriges un ataque recibido hacia cualquier otro objetivo (incluso rivales).",
    iconKey: "mirror_shield",
    category: CardCategory.TACTICA,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "Sinergia Táctica: El atacante original pierde su Acción Libre."
  },
  {
    id: 39,
    name: "El Vencedor a Ciegas",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Nadie en la mesa puede usar cartas de Trucos durante la próxima ronda.",
    iconKey: "blindfold",
    category: CardCategory.TACTICA,
    rarity: CardRarity.RARA,
    synergyEffect: "Sinergia Táctica: Todos los rivales pierden su Acción Libre."
  },
  {
    id: 40,
    name: "La Discordia (Chisme)",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Obliga a un enemigo a atacar a su propio aliado en su siguiente turno.",
    iconKey: "whisper",
    category: CardCategory.TACTICA,
    rarity: CardRarity.LEGENDARIA,
    synergyEffect: "Sinergia Táctica: El traidor pierde su Acción Libre."
  },

  // ==========================================
  // CLASE ASTUCIA (AMARILLO) | ROBO Y EVASIÓN (41 - 50)
  // Sinergia: El impacto se vuelve Ineludible (ignora armadura) | Rechazo: Revelas toda tu mano al rival
  // ==========================================
  {
    id: 41,
    name: "La Navaja Dadomada",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "+1 Daño. Ignora habilidades de reducción de daño o armaduras pasivas.",
    iconKey: "switchblade",
    category: CardCategory.ASTUCIA,
    rarity: CardRarity.BASICA,
    synergyEffect: "Sinergia Astucia: El impacto de este turno se vuelve Ineludible.",
    isFierro: true
  },
  {
    id: 42,
    name: "El Pica-Bolsillos",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Al hacer daño, robas 1 carta de la mano del rival.",
    iconKey: "wallet_snatch",
    category: CardCategory.ASTUCIA,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "Sinergia Astucia: Tu impacto es Ineludible (ignora armadura).",
    isFierro: true
  },
  {
    id: 43,
    name: "La Carnada de Cartón",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Quien te ataque debe quemar/descartar la primera carta de su mazo.",
    iconKey: "decoy",
    category: CardCategory.ASTUCIA,
    rarity: CardRarity.BASICA,
    synergyEffect: "Sinergia Astucia: Tu próximo golpe es Ineludible.",
    isFierro: true
  },
  {
    id: 44,
    name: "El Asusta-Novatos",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Rivales con menos de 10 HP sufren un -1 al atacarte.",
    iconKey: "scarecrow",
    category: CardCategory.ASTUCIA,
    rarity: CardRarity.RARA,
    synergyEffect: "Sinergia Astucia: El impacto se vuelve Ineludible.",
    isFierro: true
  },
  {
    id: 45,
    name: "El Amuleto Tramposo",
    type: CardType.WEAPON,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Tu margen de Bloqueo Perfecto se amplía a ±1 del dado rival.",
    iconKey: "loaded_die_necklace",
    category: CardCategory.ASTUCIA,
    rarity: CardRarity.LEGENDARIA,
    synergyEffect: "Sinergia Astucia: Si logras Bloqueo, tu contraataque es Ineludible.",
    isFierro: true
  },
  {
    id: 46,
    name: "El Despalomo Directo",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Robas el arma equipada en la mesa del rival y te la pones tú mismo.",
    iconKey: "weapon_steal",
    category: CardCategory.ASTUCIA,
    rarity: CardRarity.SUPER_RARA,
    synergyEffect: "Sinergia Astucia: Tu próximo ataque con esa arma es Ineludible."
  },
  {
    id: 47,
    name: "El Pega y Corre",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Cambias de objetivo DESPUÉS de que el defensor original tire su dado de bloqueo.",
    iconKey: "hit_and_run",
    category: CardCategory.ASTUCIA,
    rarity: CardRarity.RARA,
    synergyEffect: "Sinergia Astucia: El nuevo objetivo sufre impacto Ineludible."
  },
  {
    id: 48,
    name: "La Desaparición",
    type: CardType.TRICK,
    timing: TrickTiming.PREPARED_STANCE,
    description: "Te vuelves intocable a los ataques directos por 1 ronda entera.",
    iconKey: "vanishing_smoke",
    category: CardCategory.ASTUCIA,
    rarity: CardRarity.LEGENDARIA,
    synergyEffect: "Sinergia Astucia: Al reaparecer, tu primer ataque es Ineludible."
  },
  {
    id: 49,
    name: "El Cambiazo",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "Cambia una carta de tu mano por una del cementerio rival.",
    iconKey: "card_swap",
    category: CardCategory.ASTUCIA,
    rarity: CardRarity.BASICA,
    synergyEffect: "Sinergia Astucia: Tu próximo ataque de este turno es Ineludible."
  },
  {
    id: 50,
    name: "El Despecho (Golpe Bajo)",
    type: CardType.TRICK,
    timing: TrickTiming.RITUAL_ACTION,
    description: "2 de Daño e invalida todas las pasivas del rival por esta ronda.",
    iconKey: "low_blow",
    category: CardCategory.ASTUCIA,
    rarity: CardRarity.RARA,
    synergyEffect: "Sinergia Astucia: Los 2 de daño son Ineludibles (ignora armaduras)."
  }
];

export function createShuffledDeck(): GameCard[] {
  const deck = [...ALL_CARDS];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
