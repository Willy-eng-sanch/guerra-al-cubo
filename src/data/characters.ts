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
    description: "Tiene 2 espacios para activables preparados, 1 equipable y hasta 4 cartas en mano. Gasta su acción para robar 2 cartas de la pila general y transfiere 1 de ellas inmediatamente a un aliado sin gastar acción extra.",
    abilityName: "Suministro Mágico",
    abilityDescription: "Roba 2 cartas de la pila general y transfiere 1 de ellas de inmediato a un aliado.",
    passiveName: "Monopolio Táctico",
    passiveDescription: "Tiene 2 espacios para activables preparados, 1 espacio para equipable y un máximo de 4 cartas en mano.",
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
    description: "Paliza Demoledora consume 1 Cúbit y una carga. Si el objetivo no iguala exactamente el dado de ataque con su dado de defensa, pierde la mitad de sus HP actuales (redondeado hacia abajo, mínimo 1), antes de mitigaciones y barreras. Comienza con 1 carga, almacena hasta 2 y recupera una por sacar un 6 natural en combate o conseguir un Bloqueo Perfecto.",
    abilityName: "Paliza Demoledora",
    abilityDescription: "Consume 1 Cúbit y una carga para golpear con la mitad de los HP actuales del objetivo. La coincidencia exacta de dados bloquea el golpe.",
    passiveName: "Piel de Piedra",
    passiveDescription: "25 HP máximos y cero espacios de cartas: no puede robar, usar ni equipar cartas. Comienza con 1 carga de Paliza Demoledora y puede almacenar hasta 2.",
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
    description: "Gasta 1 Cúbit para ejecutar Cobertura sobre un aliado vivo de su escuadrón. Los ataques dirigidos al aliado son interceptados por Gladiacubon, que recibe el impacto y lanza su propio dado para intentar un Bloqueo Perfecto. La cobertura permanece hasta que consiga ese Bloqueo Perfecto. Tras activarla, no puede volver a usar Intercepción durante la ronda siguiente.",
    abilityName: "Intercepción",
    abilityDescription: "Gasta 1 Cúbit. Escuda a un aliado; Gladiacubon intercepta sus ataques y usa su propio dado hasta conseguir un Bloqueo Perfecto. Enfriamiento: una ronda.",
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
    description: "Saqueo Colectivo cuesta 1 Cúbit y tiene 3 rondas de enfriamiento. Con un 6, todos los rivales entregan las cartas de su mano: Racubitero conserva hasta dos, puede repartir una a cada aliado con espacio y devuelve el resto a la Pila General. Si obtiene de 1 a 5, el efecto falla sin daño adicional. Su pasiva Hurto Sigiloso roba 1 carta al causar pérdida real de HP (2 si obtuvo un 5 natural); en Bloqueo Perfecto roba hasta 2 cartas al atacante y devuelve sus armas equipadas a la Pila General.",
    abilityName: "Saqueo Colectivo",
    abilityDescription: "Cuesta 1 Cúbit. Con un 6 reúne las cartas de las manos rivales para repartirlas; con 1–5 no hay efecto. Enfriamiento: 3 rondas.",
    passiveName: "Hurto Sigiloso / Desarme en Cadena",
    passiveDescription: "Al causar pérdida real de HP roba 1 carta, o hasta 2 con un 5 natural. En Bloqueo Perfecto roba hasta 2 cartas de la mano del atacante y devuelve todas sus armas equipadas a la Pila General.",
    abilityCooldownMax: 3,
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
    signatureSuperpowerName: "Saqueo Colectivo",
    signatureSuperpowerDesc: "Con una tirada de 6, reúne las cartas que todos los rivales tengan en su mano para redistribuirlas.",
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
    description: "Préstamo de Arsenal cuesta 1 Cúbit y presta a un aliado los efectos de todas las armas equipadas de Cubinja sin mover físicamente las cartas. Cubinja conserva sus propios efectos. El préstamo dura hasta que el aliado termine su siguiente turno; enfriamiento: 2 rondas. Arsenal Ilimitado permite equipar armas sin límite. Cubinja solo lanza dos dados al atacar y suma ambos; al defender lanza un único dado. No puede activar Trucos, pero puede conservar hasta dos en la mano y transferir uno a otro jugador por 1 Cúbit.",
    abilityName: "Préstamo de Arsenal",
    abilityDescription: "Presta a un aliado los efectos de todas tus armas durante su siguiente turno. Cuesta 1 Cúbit y tiene 2 rondas de enfriamiento.",
    passiveName: "Arsenal Ilimitado",
    passiveDescription: "Equipamiento ilimitado y efectos acumulables. Lanza dos dados solo al atacar y suma ambos. Al defender usa un dado; si coincide con un dado de ataque rival, roba una carta, pero no bloquea ni reduce el daño. No puede activar Trucos, aunque sí transferirlos por 1 Cúbit.",
    abilityCooldownMax: 2,
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
    description: "Transfusión Nocturna permite drenar o donar entre 1 y 6 HP a un aliado. Cada modo cuesta 1 Cúbit; puede usar ambos en el mismo turno. Si usa uno o ambos, los dos entran en enfriamiento compartido de 3 rondas. El donante no puede bajar de 1 HP y el receptor no supera sus HP máximos. Vampirismo cura la pérdida real de HP que cause Cubícula con un ataque cuando sea de 1 a 3 puntos.",
    abilityName: "Transfusión Nocturna",
    abilityDescription: "Elige Drenaje o Donación, selecciona un aliado y transfiere de 1 a 6 HP. Puedes usar ambos modos en el mismo turno, a 1 Cúbit cada uno.",
    passiveName: "Vampirismo",
    passiveDescription: "Cuando un ataque de Cubícula causa entre 1 y 3 puntos de pérdida real de HP, recupera exactamente esa cantidad. No se activa con daño absorbido ni con pérdidas superiores a 3.",
    abilityCooldownMax: 3,
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
    description: "Revolución de la Mesa se activa después de conocer los resultados iniciales de un combate. Cuesta 1 Cúbit y permite relanzar todos los dados que participan en esa resolución; los nuevos resultados sustituyen a los anteriores y son definitivos. Enfriamiento: 2 rondas. Como pasivas, Selección Afortunada roba dos cartas de la Pila General y conserva una; Dados Trucados lanza dos D6 al atacar y al defender y selecciona el resultado más beneficioso.",
    abilityName: "Revolución de la Mesa",
    abilityDescription: "Después de ver la tirada inicial, puedes relanzar todos los dados del enfrentamiento por 1 Cúbit. Los nuevos resultados son definitivos. Enfriamiento: 2 rondas.",
    passiveName: "Selección Afortunada / Dados Trucados",
    passiveDescription: "Al robar, mira dos cartas y conserva una. En cada ataque y defensa lanza dos D6 y elige el resultado que más le beneficie.",
    abilityCooldownMax: 2,
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
    description: "Al inicio de cada ronda elige cualquiera de los otros 12 héroes, aunque no esté presente en la partida. Adopta su habilidad activa, pasiva, clases, ADN, anti-clases y límites de inventario. No puede repetir una forma durante la partida; tras usar las doce, conserva la última hasta el final.",
    abilityName: "Mimetismo",
    abilityDescription: "Elige una de las otras doce formas al inicio de cada ronda. No puedes repetir ninguna.",
    passiveName: "Adopción de Esencia",
    passiveDescription: "Copia por completo los atributos, clases, anti-clases, habilidades y reglas de inventario de la forma elegida. Si el nuevo límite es menor, el jugador decide qué conservar; el excedente vuelve a la Pila General.",
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
