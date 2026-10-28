import { CardCategory, CharacterDef, CharacterType } from '../types/game';

export const CHARACTERS: Record<CharacterType, CharacterDef> = {
  [CharacterType.FLAUCUBISTA_DESAFINADO]: {
    type: CharacterType.FLAUCUBISTA_DESAFINADO,
    displayName: "Flaucubista Desafinado",
    title: "El Músico Callejero · Daño en Área",
    description: "Apuesta un número del 1 al 5. Si acierta su tirada, hace 2 de daño ineludible a toda la mesa y se cura la mitad del número. Si falla, sufre autodaño igual a la mitad de su tirada.",
    abilityName: "Apuesta Ineludible",
    abilityDescription: "Apuesta 1-5 al dado: si acierta causa 2 daño ineludible a toda la mesa y se cura. Si falla, sufre autodaño.",
    passiveName: "Acorde Violento",
    passiveDescription: "Cada vez que sufre daño (incluido autodaño), su próximo ataque gana +1 al daño base.",
    abilityCooldownMax: 0,
    primaryColor: "#F59E0B",
    secondaryColor: "#EF4444",
    avatar: "/assets/clay_flaucubista_avatar_1792370593880.jpg",
    classes: [CardCategory.ASTUCIA, CardCategory.BRUTA],
    adn: {
      primaria: CardCategory.ASTUCIA,
      secundaria: CardCategory.BRUTA,
      neutra: CardCategory.ECONOMIA,
      antiClases: [CardCategory.PROTECCION, CardCategory.TACTICA]
    },
    signatureSuperpowerName: "Acorde Callejero",
    signatureSuperpowerDesc: "Activa Apuesta Ineludible garantizando acierto en el próximo turno.",
    selectionQuote: "¡Mi melodía desafinada romperá el ritmo de tu defensa!"
  },

  [CharacterType.CUBITO_DE_HIELO]: {
    type: CharacterType.CUBITO_DE_HIELO,
    displayName: "Cubito de Hielo",
    title: "El Congelador Urbano · Control",
    description: "Congela a un rival. El objetivo pierde su próximo turno de ataque y no puede lanzar dados de bloqueo esa ronda (CD: 2). En el turno que congela, Cubito no puede usar cartas.",
    abilityName: "Congelamiento",
    abilityDescription: "Congela a un rival. El objetivo pierde su próximo ataque y dados de bloqueo esa ronda.",
    passiveName: "Coraza de Escarcha",
    passiveDescription: "Mientras su habilidad esté en enfriamiento, gana +1 de Armadura contra ataques.",
    abilityCooldownMax: 2,
    primaryColor: "#8B5CF6",
    secondaryColor: "#3B82F6",
    avatar: "/assets/clay_cubito_hielo_avatar_1792370955445.jpg",
    classes: [CardCategory.TACTICA, CardCategory.PROTECCION],
    adn: {
      primaria: CardCategory.TACTICA,
      secundaria: CardCategory.PROTECCION,
      neutra: CardCategory.ECONOMIA,
      antiClases: [CardCategory.BRUTA, CardCategory.ASTUCIA]
    },
    signatureSuperpowerName: "Ventisca Glacial",
    signatureSuperpowerDesc: "Congela a un rival y otorga 2 puntos de barrera de escarcha.",
    selectionQuote: "¡Te vas a quedar tieso antes de que ruede tu dado!"
  },

  [CharacterType.HADA_AL_CUBO]: {
    type: CharacterType.HADA_AL_CUBO,
    displayName: "Hada al Cubo",
    title: "La Maga del Asfalto · Soporte Logístico",
    description: "Gasta su acción para robar 2 cartas de la pila general y transfiere 1 de ellas inmediatamente a un aliado sin gastar acción extra.",
    abilityName: "Suministro Mágico",
    abilityDescription: "Roba 2 cartas de la pila general y transfiere 1 de ellas de inmediato a un aliado.",
    passiveName: "Monopolio Táctico",
    passiveDescription: "Su límite de mano es de 4 cartas. Puede tener 2 cartas de Fierro/Equipamiento activas en mesa simultáneamente.",
    abilityCooldownMax: 0,
    primaryColor: "#10B981",
    secondaryColor: "#8B5CF6",
    avatar: "/assets/clay_hada_avatar_1792371050013.jpg",
    classes: [CardCategory.ECONOMIA, CardCategory.TACTICA],
    adn: {
      primaria: CardCategory.ECONOMIA,
      secundaria: CardCategory.TACTICA,
      neutra: CardCategory.PROTECCION,
      antiClases: [CardCategory.BRUTA, CardCategory.ASTUCIA]
    },
    signatureSuperpowerName: "Monopolio Arcano",
    signatureSuperpowerDesc: "Roba 2 cartas adicionales y cura 2 HP a toda su escuadra.",
    selectionQuote: "¡Aunque por ahora mi magia solo llega al cuadrado, pronto será al cubo!"
  },

  [CharacterType.CUBOGRO]: {
    type: CharacterType.CUBOGRO,
    displayName: "Cubogro",
    title: "La Bestia de Callejón · Fuerza Bruta",
    description: "Cualquier tirada de dado de ataque <= 3 se duplica al impactar (1 hace 2; 2 hace 4; 3 hace 6 de daño puro). Piel de Piedra: Tiene 0 ranuras de inventario (no usa cartas) y posee 25 HP Máximo.",
    abilityName: "Aplastamiento",
    abilityDescription: "Cualquier tirada de dado de ataque <= 3 se duplica al impactar (1->2; 2->4; 3->6).",
    passiveName: "Piel de Piedra",
    passiveDescription: "0 ranuras de inventario (no usa, roba ni equipa cartas). Posee 25 HP Máximo en lugar de 20.",
    abilityCooldownMax: 0,
    primaryColor: "#EF4444",
    secondaryColor: "#3B82F6",
    avatar: "/assets/clay_cubogro_avatar_1792370981926.jpg",
    classes: [CardCategory.BRUTA, CardCategory.PROTECCION],
    adn: {
      primaria: CardCategory.BRUTA,
      secundaria: CardCategory.PROTECCION,
      neutra: CardCategory.ASTUCIA,
      antiClases: [CardCategory.ECONOMIA, CardCategory.TACTICA]
    },
    signatureSuperpowerName: "Golpe de Falla",
    signatureSuperpowerDesc: "Añade +3 de daño garantizado al próximo impacto de Aplastamiento.",
    selectionQuote: "¡Cubogro no necesita trucos ni papeles, solo aplastar!"
  },

  [CharacterType.GLADIACUBON]: {
    type: CharacterType.GLADIACUBON,
    displayName: "Gladiacubon",
    title: "El Baluarte Callejero · Tanque Frontal",
    description: "Ejecuta Cobertura sobre un aliado. Absorbe ataques dirigidos a él y usa su propio dado para intentar Bloqueos Perfectos.",
    abilityName: "Intercepción",
    abilityDescription: "Escuda a un aliado absorbiendo ataques entrantes y bloqueando con su propio dado.",
    passiveName: "Coraza",
    passiveDescription: "Reduce a la mitad todo daño recibido que sea >= 3. Tiene 1 ranura de equipo extra permanentemente (total 2).",
    abilityCooldownMax: 0,
    primaryColor: "#3B82F6",
    secondaryColor: "#EF4444",
    avatar: "/assets/clay_gladiacubon_avatar_1792370939523.jpg",
    classes: [CardCategory.PROTECCION, CardCategory.BRUTA],
    adn: {
      primaria: CardCategory.PROTECCION,
      secundaria: CardCategory.BRUTA,
      neutra: CardCategory.TACTICA,
      antiClases: [CardCategory.ECONOMIA, CardCategory.ASTUCIA]
    },
    signatureSuperpowerName: "Muralla de Espartaco",
    signatureSuperpowerDesc: "Otorga escudo de absorción total a toda la línea aliada por 1 turno.",
    selectionQuote: "¡Tras este escudo de cartón reforzado nadie pasa!"
  },

  [CharacterType.DRACUBON]: {
    type: CharacterType.DRACUBON,
    displayName: "Dracubon",
    title: "El Fénix Callejero · Ruptura de Líneas",
    description: "Ataca a dos rivales a la vez con una sola tirada de dado. Él elige a cuál de los dos le toca hacer la tirada de bloqueo por ambos.",
    abilityName: "Aliento",
    abilityDescription: "Ataca a dos rivales a la vez con una sola tirada de dado.",
    passiveName: "Escamas",
    passiveDescription: "No posee bloqueo normal. Si al ser atacado su dado de defensa coincide con el rival, devuelve el 100% del daño al atacante.",
    abilityCooldownMax: 0,
    primaryColor: "#EF4444",
    secondaryColor: "#F59E0B",
    avatar: "/assets/clay_dracubon_avatar_1792371037703.jpg",
    classes: [CardCategory.BRUTA, CardCategory.ASTUCIA],
    adn: {
      primaria: CardCategory.BRUTA,
      secundaria: CardCategory.ASTUCIA,
      neutra: CardCategory.PROTECCION,
      antiClases: [CardCategory.ECONOMIA, CardCategory.TACTICA]
    },
    signatureSuperpowerName: "Llamarada Doble",
    signatureSuperpowerDesc: "Su próximo Aliento inflige 1 daño adicional ineludible a ambos objetivos.",
    selectionQuote: "¡Mi aliento quema dos casillas con un solo giro de dado!"
  },

  [CharacterType.RACUBITERO]: {
    type: CharacterType.RACUBITERO,
    displayName: "Racubitero",
    title: "El Saqueador de Bolsillos · Desarme",
    description: "Si causa daño efectivo, roba 1 carta de la mano del rival. Si saca un 5 puro al atacar, roba 2 cartas.",
    abilityName: "Hurto Sigiloso",
    abilityDescription: "Roba 1 carta al dañar (roba 2 si saca 5 al atacar).",
    passiveName: "Desarme en Cadena",
    passiveDescription: "En Bloqueo Perfecto, el atacante pierde toda su mano. Racubitero relanza: si saca 5, toda la mesa enemiga pierde la mano y él roba 2.",
    abilityCooldownMax: 0,
    primaryColor: "#F59E0B",
    secondaryColor: "#10B981",
    avatar: "/assets/clay_racubitero_avatar_1792370926078.jpg",
    classes: [CardCategory.ASTUCIA, CardCategory.ECONOMIA],
    adn: {
      primaria: CardCategory.ASTUCIA,
      secundaria: CardCategory.ECONOMIA,
      neutra: CardCategory.TACTICA,
      antiClases: [CardCategory.BRUTA, CardCategory.PROTECCION]
    },
    signatureSuperpowerName: "Vaciado de Bolsillo",
    signatureSuperpowerDesc: "Roba 2 cartas al azar del rival y descarta las armas equipadas de su mesa.",
    selectionQuote: "¡Lo que entra en mi rango termina en mis bolsillos!"
  },

  [CharacterType.PIRATA]: {
    type: CharacterType.PIRATA,
    displayName: "Pirata",
    title: "El Temerario del Callejón · Castigo",
    description: "Aplica activamente el 'Mal de Ojo' a un objetivo, anulando por completo su próximo turno (CD: 3). CUALQUIER enemigo que decida atacarlo directamente sufre el 'Mal de Ojo' y pierde su próximo turno.",
    abilityName: "Maldición del Ancla",
    abilityDescription: "Aplica activamente Mal de Ojo a un rival anulando su próximo turno (CD: 3).",
    passiveName: "Mal de Ojo Represivo",
    passiveDescription: "CUALQUIER enemigo que decida atacarlo directamente sufre Mal de Ojo y pierde su próximo turno.",
    abilityCooldownMax: 3,
    primaryColor: "#8B5CF6",
    secondaryColor: "#F59E0B",
    avatar: "/assets/clay_pirata_avatar_1792370969022.jpg",
    classes: [CardCategory.TACTICA, CardCategory.ASTUCIA],
    adn: {
      primaria: CardCategory.TACTICA,
      secundaria: CardCategory.ASTUCIA,
      neutra: CardCategory.BRUTA,
      antiClases: [CardCategory.ECONOMIA, CardCategory.PROTECCION]
    },
    signatureSuperpowerName: "Juicio Pirata",
    signatureSuperpowerDesc: "Silencia y cancela el turno de dos enemigos simultáneamente.",
    selectionQuote: "¡Al que se acerque le robo el turno y le clavo el ancla!"
  },

  [CharacterType.CUBINARCA]: {
    type: CharacterType.CUBINARCA,
    displayName: "Cubinarca",
    title: "El Padrino de la Cuadrícula · Manipulador",
    description: "Tras atacar o bloquear efectivo, emite una orden a la víctima: a quién atacar (incluso aliados), transferir 1 carta global, o desequipar arma. Si desobedece, pierde la capacidad de bloquear hasta que cumpla.",
    abilityName: "Orden Imperativa",
    abilityDescription: "Tras dañar o bloquear, ordena a quién atacar o desequipar.",
    passiveName: "Discordia",
    passiveDescription: "Si el rival desobedece la orden dictada, pierde la capacidad de lanzar dados de bloqueo de forma indefinida hasta cumplirla.",
    abilityCooldownMax: 0,
    primaryColor: "#8B5CF6",
    secondaryColor: "#10B981",
    avatar: "/assets/clay_cubinarca_avatar_1792371024538.jpg",
    classes: [CardCategory.TACTICA, CardCategory.ECONOMIA],
    adn: {
      primaria: CardCategory.TACTICA,
      secundaria: CardCategory.ECONOMIA,
      neutra: CardCategory.PROTECCION,
      antiClases: [CardCategory.BRUTA, CardCategory.ASTUCIA]
    },
    signatureSuperpowerName: "Decreto de Familia",
    signatureSuperpowerDesc: "Obliga a un enemigo a atacar inmediatamente a uno de sus propios aliados.",
    selectionQuote: "¡En esta cuadra se ataca y se bloquea como la familia ordene!"
  },

  [CharacterType.CUBINJA]: {
    type: CharacterType.CUBINJA,
    displayName: "Cubinja",
    title: "La Sombra del D6 · Hiper-Carry",
    description: "Ataca lanzando el dado DOS veces y sumando ambos dados. Equipa armas ILIMITADAS en mesa. Prohibido usar cartas Truco. Su Bloqueo Perfecto NUNCA mitiga daño (solo roba carta).",
    abilityName: "Danza de Hojas",
    abilityDescription: "Ataca lanzando dos dados y sumando ambos. Puede inyectar efectos de armas.",
    passiveName: "Avaricia",
    passiveDescription: "Equipa armas ILIMITADAS en mesa. Prohibido usar cartas Truco. Su Bloqueo Perfecto nunca mitiga daño (solo roba carta).",
    abilityCooldownMax: 0,
    primaryColor: "#EF4444",
    secondaryColor: "#F59E0B",
    avatar: "/assets/clay_cubinja_avatar_1792370912245.jpg",
    classes: [CardCategory.BRUTA, CardCategory.ASTUCIA],
    adn: {
      primaria: CardCategory.BRUTA,
      secundaria: CardCategory.ASTUCIA,
      neutra: CardCategory.TACTICA,
      antiClases: [CardCategory.PROTECCION, CardCategory.ECONOMIA]
    },
    signatureSuperpowerName: "Arsenal Infinito",
    signatureSuperpowerDesc: "Lanza 3 dados de ataque y activa todas sus armas a la vez.",
    selectionQuote: "¡Dos dados, filo doble, y todas las armas de la cuadra en mi cinturón!"
  },

  [CharacterType.CUBICULA]: {
    type: CharacterType.CUBICULA,
    displayName: "Cubícula",
    title: "La Condesa Sanguínea · Vampirismo",
    description: "Si inflige un daño efectivo >= 3, se cura HP en una cantidad exactamente igual al daño infligido. En Bloqueo Perfecto: relanza el dado, devuelve la mitad de ese dado en daño y se cura el total.",
    abilityName: "Festín Sangriento",
    abilityDescription: "Ataque con robo de vida: si inflige >= 3 daño, se cura exactamente el daño hecho.",
    passiveName: "Reflejo de Noche",
    passiveDescription: "En Bloqueo Perfecto relanza el dado: devuelve la mitad en daño al atacante y se cura el total en HP.",
    abilityCooldownMax: 0,
    primaryColor: "#3B82F6",
    secondaryColor: "#F59E0B",
    avatar: "/assets/clay_cubicula_avatar_1792370995932.jpg",
    classes: [CardCategory.PROTECCION, CardCategory.ASTUCIA],
    adn: {
      primaria: CardCategory.PROTECCION,
      secundaria: CardCategory.ASTUCIA,
      neutra: CardCategory.BRUTA,
      antiClases: [CardCategory.ECONOMIA, CardCategory.TACTICA]
    },
    signatureSuperpowerName: "Drenaje Nocturno",
    signatureSuperpowerDesc: "Roba 3 HP directamente del rival más fuerte y cura a su escuadrón.",
    selectionQuote: "¡Tu sangre nutre mis dados de plastilina oscura!"
  },

  [CharacterType.TRAMCUBOSO]: {
    type: CharacterType.TRAMCUBOSO,
    displayName: "Tramcuboso",
    title: "El Tahúr del Asfalto · Acaparador de Azar",
    description: "Al robar cartas de la pila general, extrae 2, elige la más conveniente para su mano y descarta la otra. Lanza el dado dos veces tanto al atacar como al defender, eligiendo siempre la tirada que más le favorezca.",
    abilityName: "Selección Afortunada",
    abilityDescription: "Al robar extrae 2 cartas, elige 1 y descarta la otra.",
    passiveName: "Dados Trucados",
    passiveDescription: "Lanza el dado dos veces al atacar y al defender, eligiendo siempre la tirada más favorable.",
    abilityCooldownMax: 0,
    primaryColor: "#10B981",
    secondaryColor: "#F59E0B",
    avatar: "/assets/clay_tramcuboso_avatar_1792371008477.jpg",
    classes: [CardCategory.ECONOMIA, CardCategory.ASTUCIA],
    adn: {
      primaria: CardCategory.ECONOMIA,
      secundaria: CardCategory.ASTUCIA,
      neutra: CardCategory.TACTICA,
      antiClases: [CardCategory.BRUTA, CardCategory.PROTECCION]
    },
    signatureSuperpowerName: "Dado de Oro",
    signatureSuperpowerDesc: "Fija su tirada de dado en 5 o 6 según su conveniencia en este turno.",
    selectionQuote: "¡La casa nunca pierde cuando mis dados están cargados!"
  },

  [CharacterType.CAMBIAFORMAS]: {
    type: CharacterType.CAMBIAFORMAS,
    displayName: "Cambiaformas",
    title: "El Comodín de Barrio · El Mutilador de Clases",
    description: "Al inicio de cada ronda se transforma en cualquier otro personaje de la mesa, adoptando de inmediato su Habilidad Activa, Pasiva, restricciones y su ADN EXACTO (clases y anti-clases).",
    abilityName: "Mimetismo",
    abilityDescription: "Adopta la Habilidad Activa de cualquier otro cubo de la arena cada ronda.",
    passiveName: "Adopción de Esencia",
    passiveDescription: "Copia de forma integral la Habilidad Pasiva, restricciones y el ADN EXACTO (clases y anti-clases).",
    abilityCooldownMax: 0,
    primaryColor: "#8B5CF6",
    secondaryColor: "#10B981",
    avatar: "/assets/clay_cubita_launcher_icon_1792370607827.jpg",
    classes: [CardCategory.BRUTA, CardCategory.ASTUCIA],
    adn: {
      primaria: CardCategory.BRUTA,
      secundaria: CardCategory.ASTUCIA,
      neutra: CardCategory.TACTICA,
      antiClases: [CardCategory.ECONOMIA, CardCategory.PROTECCION]
    },
    signatureSuperpowerName: "Transmutación Total",
    signatureSuperpowerDesc: "Permite elegir manualmente qué personaje copiar durante las próximas dos rondas.",
    selectionQuote: "¡Soy el reflejo de tu propia estrategia, pero mejorada!"
  }
};

export const CHARACTER_LIST = Object.values(CHARACTERS);
