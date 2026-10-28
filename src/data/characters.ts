import { CardCategory, CharacterDef, CharacterType } from '../types/game';

// ============================================================
// ROSTER OFICIAL — GDD "Guerra Cubita" (Páginas 7-9)
// Cada cubo tiene un ADN del Barrio:
//   Primaria (define su Habilidad Activa) · Secundaria (define su Pasiva)
//   Neutra (funciona normal) · Anti-clases (Antisinergia / Rechazo)
// ============================================================

const B = CardCategory.BRUTA;
const P = CardCategory.PROTECCION;
const E = CardCategory.ECONOMIA;
const T = CardCategory.TACTICA;
const A = CardCategory.ASTUCIA;

export const CHARACTERS: Record<CharacterType, CharacterDef> = {
  [CharacterType.FLAUCUBISTA_DESAFINADO]: {
    type: CharacterType.FLAUCUBISTA_DESAFINADO,
    displayName: "Flaucubista Desafinado",
    title: "El Músico Callejero",
    description: "Activa: Elige un número. Si acierta su D5, hace 2 de daño ineludible a TODOS los demás cubos y se cura 2 HP. Si falla, sufre la mitad de su tirada.",
    abilityName: "Concierto Caótico",
    abilityDescription: "Apuesta un número al D5: acierto = 2 de daño ineludible a todos y te curas 2. Fallo = sufres la mitad de tu tirada.",
    abilityCooldownMax: 0,
    passiveName: "Acorde Violento",
    passiveDescription: "Cada vez que recibes daño directo, tu siguiente ataque básico gana +1 de daño base.",
    primaryColor: "#FF7043",
    secondaryColor: "#FFCC80",
    avatar: "/assets/clay_flaucubista_avatar_1792370593880.jpg",
    dna: { primaria: B, secundaria: A, neutra: P, antiClases: [E, T] },
    classes: [B, A],
    signatureSuperpowerName: "Sonata Solar",
    signatureSuperpowerDesc: "Cura 3 HP a tu héroe y suma +1 a tu próxima apuesta de dado.",
    model3dImage: "/assets/aistudio/haz_lo_mismo_de_la_20261021082502_b88f6e95.jpg",
    hasCustom3DModel: true,
    selectionQuote: "¡Mi flauta desafinada romperá el ritmo de tu defensa!",
    selectionVideo: "/assets/aistudio/Character_playing_flute_in_lands__20261021085554_c104978e.mp4",
    actionVideos: {
      attack: "/assets/aistudio/Character_playing_flute_in_lands__20261021085554_c104978e.mp4",
      ability: "/assets/aistudio/Character_playing_flute_in_lands__20261021085554_c104978e.mp4",
      perfectBlock: "/assets/aistudio/Character_playing_flute_in_lands__20261021085554_c104978e.mp4",
      victory: "/assets/aistudio/Character_playing_flute_in_lands__20261021085554_c104978e.mp4"
    }
  },

  // ------------------------------------------------------------
  // CUBITO DE HIELO — Reubicado como Clase Táctica (Control puro).
  // El GDD no lo lista en el roster oficial; se conserva por
  // compatibilidad con partidas guardadas usando su nuevo ADN.
  // ------------------------------------------------------------
  [CharacterType.CUBITO_DE_HIELO]: {
    type: CharacterType.CUBITO_DE_HIELO,
    displayName: "Cubito de Hielo",
    title: "El Congelador Urbano",
    description: "Activa (Cooldown 2 turnos): Congela a un rival (sufre Mal de Ojo y pierde su próximo turno). Al activarla, él no puede usar/equipar cartas ese turno.",
    abilityName: "Congelación Glacial",
    abilityDescription: "Aplica Mal de Ojo: el rival pierde su próximo turno y sus bloqueos.",
    abilityCooldownMax: 2,
    passiveName: "Frente Frío",
    passiveDescription: "Reduce en 1 todo daño recibido proveniente de tiradas ≥ 4.",
    primaryColor: "#29B6F6",
    secondaryColor: "#E1F5FE",
    avatar: "/assets/clay_cubito_hielo_avatar_1792370955445.jpg",
    dna: { primaria: T, secundaria: P, neutra: B, antiClases: [E, A] },
    classes: [T, P],
    signatureSuperpowerName: "Ventisca Glacial",
    signatureSuperpowerDesc: "Congela a un rival y otorga 2 puntos de barrera de hielo.",
    hasCustom3DModel: false,
    selectionQuote: "¡Te vas a quedar frío antes del primer turno!"
  },

  // ------------------------------------------------------------
  // HADA AL CUBO — Reubicada como Clase Economía (Abasto puro).
  // Tampoco pertenece al roster oficial del GDD; se conserva por
  // compatibilidad con su nuevo ADN económico.
  // ------------------------------------------------------------
  [CharacterType.HADA_AL_CUBO]: {
    type: CharacterType.HADA_AL_CUBO,
    displayName: "Hada al Cubo",
    title: "La Maga del Asfalto",
    description: "Pasiva (Monopolio Táctico): Límite de mano 4, roba 2 cartas al robar y puede tener 2 cartas equipadas simultáneas.",
    abilityName: "Aleteo Arcano",
    abilityDescription: "Capacidad expandida de cartas en mano (4) y en mesa (2).",
    abilityCooldownMax: 0,
    passiveName: "Monopolio Táctico",
    passiveDescription: "Límite de mano 4. Roba 2 cartas cuando robas. 2 ranuras de equipo.",
    primaryColor: "#EC407A",
    secondaryColor: "#FCE4EC",
    avatar: "/assets/clay_hada_avatar_1792371050013.jpg",
    dna: { primaria: E, secundaria: T, neutra: A, antiClases: [B, P] },
    classes: [E, T],
    signatureSuperpowerName: "Florecimiento Arcano",
    signatureSuperpowerDesc: "Roba 2 cartas del Mazo Global y recupera 2 HP de inmediato.",
    model3dImage: "/assets/aistudio/imagen_20261021105417_a2b1cde0.jpg",
    hasCustom3DModel: true,
    selectionQuote: "¡Aunque por ahora mi magia solo llega al cuadrado, pronto podrá ser al cubo!",
    selectionVideo: "/assets/aistudio/Floral_mage_performing_introduct__20261021105405_5ff3d331.mp4",
    actionVideos: {
      attack: "/assets/aistudio/Floral_mage_performing_introduct__20261021105405_5ff3d331.mp4",
      ability: "/assets/aistudio/Floral_mage_performing_introduct__20261021105405_5ff3d331.mp4",
      perfectBlock: "/assets/aistudio/Floral_mage_performing_introduct__20261021105405_5ff3d331.mp4",
      victory: "/assets/aistudio/Floral_mage_performing_introduct__20261021105405_5ff3d331.mp4"
    }
  },

  [CharacterType.CUBOGRO]: {
    type: CharacterType.CUBOGRO,
    displayName: "Cubogro",
    title: "La Bestia de Callejón",
    description: "Sin inventario ni cartas. Su cuerpo es su arma. Activa: Duplica su tirada de ataque (solo si saca 4 o más).",
    abilityName: "Furia Demoledora",
    abilityDescription: "Si tu tirada de ataque es 4, 5 o 6, el daño infligido se duplica.",
    abilityCooldownMax: 0,
    passiveName: "Piel de Piedra",
    passiveDescription: "No puede tener cartas en mano ni equipar armas. Reduce todo daño mágico/recibido en 1.",
    primaryColor: "#66BB6A",
    secondaryColor: "#33691E",
    avatar: "/assets/clay_cubogro_avatar_1792370941533.jpg",
    dna: { primaria: B, secundaria: P, neutra: T, antiClases: [E, A] },
    classes: [B, P],
    signatureSuperpowerName: "Aplastamiento Brutal",
    signatureSuperpowerDesc: "Duplica el daño de tu próximo ataque si sacas 4 o más.",
    model3dImage: "/assets/aistudio/haz_el_modelado_3d_del_20261021081850_a47cb491.jpg",
    hasCustom3DModel: true,
    selectionQuote: "¡GRAAAGH! ¡CUBOGRO APLASTA CON EL DOBLE DE FURIA!",
    selectionVideo: "/assets/aistudio/Cubogro_monster_performing_intro__20261021090559_01012c99.mp4",
    actionVideos: {
      attack: "/assets/aistudio/Cubogro_monster_performing_intro__20261021090559_01012c99.mp4",
      ability: "/assets/aistudio/Cubogro_monster_performing_intro__20261021090559_01012c99.mp4",
      perfectBlock: "/assets/aistudio/Cubogro_monster_performing_intro__20261021090559_01012c99.mp4",
      victory: "/assets/aistudio/Cubogro_monster_performing_intro__20261021090559_01012c99.mp4"
    }
  },

  [CharacterType.GLADIACUBON]: {
    type: CharacterType.GLADIACUBON,
    displayName: "Gladiacubon",
    title: "El Coloso Blindado",
    description: "Activa: Daño fijo sin dados. Golpe bajo de 2 de daño que ignora armaduras pasivas y escudos de bloqueo.",
    abilityName: "Embate de Coliseo",
    abilityDescription: "Golpe fijo de 2 de daño ineludible que ignora pasivas defensivas.",
    abilityCooldownMax: 0,
    passiveName: "Coraza",
    passiveDescription: "Mitiga a la mitad cualquier daño ≥ 3. Ranura extra de equipo permanente.",
    primaryColor: "#FFA726",
    secondaryColor: "#5D4037",
    avatar: "/assets/clay_gladiacubon_avatar_1792370982398.jpg",
    dna: { primaria: P, secundaria: B, neutra: T, antiClases: [E, A] },
    classes: [P, B],
    signatureSuperpowerName: "Embate de Coliseo",
    signatureSuperpowerDesc: "Gana 3 de armadura y contraataca con 2 de daño directo.",
    model3dImage: "/assets/aistudio/haz_el_mismo_modelado_3d_20261021103223_7d3897a5.jpg",
    hasCustom3DModel: true,
    selectionQuote: "¡Cuando un cubo libre muere, pierde el placer de la vida... la muerte es su única libertad!",
    selectionVideo: "/assets/aistudio/Gladiator_holding_sword_and_shield_20261021104138_15ddb307.mp4",
    actionVideos: {
      attack: "/assets/aistudio/Gladiator_holding_sword_and_shield_20261021104138_15ddb307.mp4",
      ability: "/assets/aistudio/Gladiator_holding_sword_and_shield_20261021104138_15ddb307.mp4",
      perfectBlock: "/assets/aistudio/Gladiator_holding_sword_and_shield_20261021104138_15ddb307.mp4",
      victory: "/assets/aistudio/Gladiator_holding_sword_and_shield_20261021104138_15ddb307.mp4"
    }
  },

  [CharacterType.DRACUBON]: {
    type: CharacterType.DRACUBON,
    displayName: "Dracubon",
    title: "El Azote Carmesí",
    description: "Activa: Atacas a DOS rivales a la vez. Si uno falla su Bloqueo Perfecto, el otro tampoco puede tirar dado defensivo.",
    abilityName: "Llamarada Gemela",
    abilityDescription: "Impacta a 2 rivales simultáneamente; el fallo de uno anula el bloqueo del otro.",
    abilityCooldownMax: 0,
    passiveName: "Fuego Amigo",
    passiveDescription: "Si un aliado tuyo recibe daño directo, tu siguiente ataque gana +1 de quemado.",
    primaryColor: "#E53935",
    secondaryColor: "#212121",
    avatar: "/assets/clay_dracubon_avatar_1792371037184.jpg",
    dna: { primaria: B, secundaria: T, neutra: A, antiClases: [P, E] },
    classes: [B, T],
    signatureSuperpowerName: "Aliento Dracónico",
    signatureSuperpowerDesc: "Inflige 2 de daño explosivo ineludible a todos los rivales.",
    hasCustom3DModel: false,
    selectionQuote: "¡Arderán dos por el precio de uno bajo mi fuego!"
  },

  [CharacterType.RACUBITERO]: {
    type: CharacterType.RACUBITERO,
    displayName: "Racubitero",
    title: "El Ratero de Cartas",
    description: "Activa: Copias el efecto exacto de la última carta de Truco usada por cualquier jugador (sin gastar recursos).",
    abilityName: "Robo Relámpago",
    abilityDescription: "Copia el efecto de la última carta jugada en la mesa.",
    abilityCooldownMax: 0,
    passiveName: "Mano Lisa",
    passiveDescription: "Al hacer daño efectivo, robas 1 carta del rival golpeado (2 si sacas 5 o 6).",
    primaryColor: "#AB47BC",
    secondaryColor: "#4A148C",
    avatar: "/assets/clay_racubitero_avatar_1792370926078.jpg",
    dna: { primaria: E, secundaria: A, neutra: B, antiClases: [P, T] },
    classes: [E, A],
    signatureSuperpowerName: "Saqueo de Guante Blanco",
    signatureSuperpowerDesc: "Roba 1 carta de la mano de cada rival activo.",
    hasCustom3DModel: false,
    selectionQuote: "¡Lo tuyo ahora es mío, mano vacía te vas a quedar!"
  },

  [CharacterType.PIRATA]: {
    type: CharacterType.PIRATA,
    displayName: "Pirata",
    title: "El Temerario de la Esquina",
    description: "Activa (Cooldown 3 rondas): Cancela la Acción Principal (Ataque) del objetivo elegido. Si ya atacó, cancela su Acción de Carta.",
    abilityName: "Abordaje Cúbico",
    abilityDescription: "Cancela la acción principal (o de carta) del rival elegido.",
    abilityCooldownMax: 3,
    passiveName: "Parche Pirata",
    passiveDescription: "Si fallas tu Bloqueo, puedes descartar 1 carta para reducir el daño a la mitad.",
    primaryColor: "#26A69A",
    secondaryColor: "#004D40",
    avatar: "/assets/clay_pirata_avatar_1792370969022.jpg",
    dna: { primaria: T, secundaria: A, neutra: E, antiClases: [B, P] },
    classes: [T, A],
    signatureSuperpowerName: "Salva Bucanera",
    signatureSuperpowerDesc: "Dispara 3 cañonazos y desequipa el arma de un rival.",
    hasCustom3DModel: false,
    selectionQuote: "¡Al que se acerque le robo el turno y el timón!"
  },

  [CharacterType.CUBINARCA]: {
    type: CharacterType.CUBINARCA,
    displayName: "Cubinarca",
    title: "El Padrino de la Cuadrícula",
    description: "Activa: Ordenas a un rival atacar a su propio aliado. Si se niega, queda congelado (Mal de Ojo) y no podrá tirar bloqueos.",
    abilityName: "Decreto Mafioso",
    abilityDescription: "Fuerza al rival a atacar a su aliado; la desobediencia congela su turno.",
    abilityCooldownMax: 0,
    passiveName: "Omertá",
    passiveDescription: "Mientras tengas cartas en Mesa, tus aliados reciben -1 de daño entrante.",
    primaryColor: "#FFD700",
    secondaryColor: "#3E2723",
    avatar: "/assets/clay_cubinarca_avatar_1792371024538.jpg",
    dna: { primaria: T, secundaria: P, neutra: B, antiClases: [E, A] },
    classes: [T, P],
    signatureSuperpowerName: "Decreto Imperial",
    signatureSuperpowerDesc: "Cura 3 HP a tu escuadra y refuerza sus escudos.",
    hasCustom3DModel: false,
    selectionQuote: "¡Aquí se ataca a quien la familia ordene!"
  },

  [CharacterType.CUBINJA]: {
    type: CharacterType.CUBINJA,
    displayName: "Cubinja",
    title: "La Sombra del D5",
    description: "Activa: Tu daño de ataque se divide en dos mitades contra objetivos distintos. No puede curarse con cartas.",
    abilityName: "Doble Tajo Shinobi",
    abilityDescription: "Divide tu daño de ataque entre dos objetivos diferentes.",
    abilityCooldownMax: 0,
    passiveName: "Avaricia",
    passiveDescription: "Puede equipar armas ilimitadas. Sus bloqueos fallados no evitan daño pero le roban 1 carta al atacante.",
    primaryColor: "#424242",
    secondaryColor: "#212121",
    avatar: "/assets/clay_cubinja_avatar_1792370912245.jpg",
    dna: { primaria: A, secundaria: B, neutra: E, antiClases: [P, T] },
    classes: [A, B],
    signatureSuperpowerName: "Furia Shinobi",
    signatureSuperpowerDesc: "Lanza 3 dados de ataque y suma todos los impactos.",
    hasCustom3DModel: false,
    selectionQuote: "¡Dos golpes, doble impacto mortal desde las sombras!"
  },

  [CharacterType.CUBICULA]: {
    type: CharacterType.CUBICULA,
    displayName: "Cubícula",
    title: "El Conde Sanguíneo",
    description: "Activa: Sacrificas 2 HP para forzar al rival a relanzar su dado de bloqueo; tú obtienes el resultado más alto.",
    abilityName: "Vampirismo Cúbico",
    abilityDescription: "Sacrifica 2 HP y fuerza el relance del bloqueo enemigo a tu favor.",
    abilityCooldownMax: 0,
    passiveName: "Sed Eterna",
    passiveDescription: "Se cura el equivalente a cualquier daño efectivo ≥ 3 que inflija.",
    primaryColor: "#8E24AA",
    secondaryColor: "#B71C1C",
    avatar: "/assets/clay_cubicula_avatar_1792370995932.jpg",
    dna: { primaria: P, secundaria: E, neutra: A, antiClases: [B, T] },
    classes: [P, E],
    signatureSuperpowerName: "Festín Carmesí",
    signatureSuperpowerDesc: "Drena 3 HP directamente del rival con mayor vida.",
    model3dImage: "/assets/aistudio/imagen_20261021111133_462e6d7e.jpg",
    hasCustom3DModel: true,
    selectionQuote: "¡Mi cubivida será eterna... incluso si debo arrebatártela tuya!",
    selectionVideo: "/assets/aistudio/Vampire_character_performing_int__20261021111116_fb5bd30b.mp4",
    actionVideos: {
      attack: "/assets/aistudio/Vampire_character_performing_int__20261021111116_fb5bd30b.mp4",
      ability: "/assets/aistudio/Vampire_character_performing_int__20261021111116_fb5bd30b.mp4",
      perfectBlock: "/assets/aistudio/Vampire_character_performing_int__20261021111116_fb5bd30b.mp4",
      victory: "/assets/aistudio/Vampire_character_performing_int__20261021111116_fb5bd30b.mp4"
    }
  },

  [CharacterType.TRAMCUBOSO]: {
    type: CharacterType.TRAMCUBOSO,
    displayName: "Tramcuboso",
    title: "El Tahúr del Asfalto",
    description: "Activa: Cambia una carta de tu mano por la primera carta boca arriba del cementerio (descarte global).",
    abilityName: "Dados Cargados",
    abilityDescription: "Trueca una carta de tu mano por una del cementerio público.",
    abilityCooldownMax: 0,
    passiveName: "Cara de Suerte",
    passiveDescription: "Sus tiradas de 1 cuentan como 2. Al robar carta, mira 2 y escoge 1.",
    primaryColor: "#00ACC1",
    secondaryColor: "#006064",
    avatar: "/assets/clay_tramcuboso_avatar_1792371008477.jpg",
    dna: { primaria: E, secundaria: A, neutra: T, antiClases: [B, P] },
    classes: [E, A],
    signatureSuperpowerName: "Dado de Oro Trucado",
    signatureSuperpowerDesc: "Fija el próximo dado de ataque en 5 automáticamente.",
    hasCustom3DModel: false,
    selectionQuote: "¡La casa nunca pierde cuando los dados ruedan a mi favor!"
  },

  [CharacterType.CAMBIAFORMAS]: {
    type: CharacterType.CAMBIAFORMAS,
    displayName: "Cambiaformas",
    title: "El Clon Mutante",
    description: "Comodín de apoyo: transforma su ADN primario/secundario en el de otro personaje distinto cada ronda.",
    abilityName: "Metamorfosis Callejera",
    abilityDescription: "Adopta el kit completo de otro personaje cada ronda.",
    abilityCooldownMax: 0,
    passiveName: "Espejo Roto",
    passiveDescription: "Recibe exactamente la misma cantidad de daño que el último rival que te golpeó (mitad redondeada hacia abajo).",
    primaryColor: "#7E57C2",
    secondaryColor: "#311B92",
    avatar: "/assets/clay_cubita_launcher_icon_1792370607827.jpg",
    // Comodín: todas las clases le son neutras (no sufre Rechazo)
    dna: { primaria: T, secundaria: A, neutra: B, antiClases: [P, E] },
    classes: [B, P, E, T, A],
    isJoker: true,
    signatureSuperpowerName: "Prisma de Clases",
    signatureSuperpowerDesc: "Activa todas las sinergias heroicas de clase a la vez.",
    hasCustom3DModel: false,
    selectionQuote: "¡Soy todos y ninguno! ¡Prepárate para la sorpresa de cada ronda!"
  }
};

export const CHARACTER_LIST = Object.values(CHARACTERS);
