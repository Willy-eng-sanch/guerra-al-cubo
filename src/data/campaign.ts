import { CampaignChapter, CharacterType } from '../types/game';

export const DEFAULT_CHAPTERS: CampaignChapter[] = [
  {
    id: 1,
    title: "Capítulo 1: El Callejón de los Novatos",
    subtitle: "Derrota al Cubogro y al Flaucubista en su propio terreno.",
    bossCharacter: CharacterType.CUBOGRO,
    minionCharacters: [CharacterType.FLAUCUBISTA_DESAFINADO],
    rewardDescription: "Desbloquea el Título: 'Brawler Callejero'",
    isUnlocked: true,
    isCompleted: false
  },
  {
    id: 2,
    title: "Capítulo 2: La Esquina del Contrabando",
    subtitle: "Enfrenta al Racubitero y al Tramcuboso sin perder tus cartas.",
    bossCharacter: CharacterType.RACUBITERO,
    minionCharacters: [CharacterType.TRAMCUBOSO],
    rewardDescription: "Desbloquea el Título: 'Tahúr del Asfalto'",
    isUnlocked: true,
    isCompleted: false
  },
  {
    id: 3,
    title: "Capítulo 3: La Azotea Shinobi",
    subtitle: "Resiste el doble filo del Cubinja y la armadura de Gladiacubon.",
    bossCharacter: CharacterType.CUBINJA,
    minionCharacters: [CharacterType.GLADIACUBON, CharacterType.PIRATA],
    rewardDescription: "Desbloquea el Título: 'Sombra Inquebrantable'",
    isUnlocked: true,
    isCompleted: false
  },
  {
    id: 4,
    title: "Capítulo Final: El Trono Cúbico",
    subtitle: "Vence al Conde Cubícula y al Padrino Cubinarca por el dominio total.",
    bossCharacter: CharacterType.CUBICULA,
    minionCharacters: [CharacterType.CUBINARCA, CharacterType.DRACUBON],
    rewardDescription: "Desbloquea el Título: 'Rey de Guerra Cubita'",
    isUnlocked: true,
    isCompleted: false
  }
];
