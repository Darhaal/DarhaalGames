import { SpyfallPack } from "@/types/spyfall";

const getImg = (name: string) => `/spyfall/games/${name}.jpg`;

export const gaming: SpyfallPack = {
  id: 'gaming',
  name: { ru: 'Игры', en: 'Gaming' },
  emoji: '🎮',
  locations: [
    {
      id: 'minecraft',
      name: { ru: 'Minecraft: Шахта', en: 'Minecraft: Mine' },
      image: getImg('minecraft'),
      roles: [
        { name: { ru: 'Стив', en: 'Steve' } },
        { name: { ru: 'Крипер', en: 'Creeper' } },
        { name: { ru: 'Житель деревни', en: 'Villager' } },
        { name: { ru: 'Эндермен', en: 'Enderman' } },
        { name: { ru: 'Зомби', en: 'Zombie' } },
        { name: { ru: 'Алекс', en: 'Alex' } },
      ]
    },
    {
      id: 'terraria',
      name: { ru: 'Terraria: Ад', en: 'Terraria: Underworld' },
      image: getImg('terraria'),
      roles: [
        { name: { ru: 'Гид', en: 'Guide' } },
        { name: { ru: 'Игрок', en: 'Player' } },
        { name: { ru: 'Демон', en: 'Demon' } },
        { name: { ru: 'Стена Плоти', en: 'Wall of Flesh' } },
        { name: { ru: 'Гоблин-изобретатель', en: 'Goblin Tinkerer' } },
      ]
    },
    {
      id: 'amongus',
      name: { ru: 'Among Us: Корабль', en: 'Among Us: Skeld' },
      image: getImg('amongus'),
      roles: [
        { name: { ru: 'Предатель', en: 'Impostor' } },
        { name: { ru: 'Член экипажа', en: 'Crewmate' } },
        { name: { ru: 'Призрак', en: 'Ghost' } },
        { name: { ru: 'Капитан', en: 'Captain' } },
        { name: { ru: 'Инженер', en: 'Engineer' } },
      ]
    }
  ]
};