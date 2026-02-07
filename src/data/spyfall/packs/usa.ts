import { SpyfallPack } from "@/types/spyfall";

const getImg = (name: string) => `/spyfall/usa/${name}.jpg`;

export const usa: SpyfallPack = {
  id: 'usa',
  name: { ru: 'США', en: 'USA' },
  emoji: '🇺🇸',
  locations: [
    {
      id: 'white_house',
      name: { ru: 'Белый Дом', en: 'White House' },
      image: getImg('whitehouse'),
      roles: [
        { name: { ru: 'Президент', en: 'President' } },
        { name: { ru: 'Агент Секретной службы', en: 'Secret Service Agent' } },
        { name: { ru: 'Пресс-секретарь', en: 'Press Secretary' } },
        { name: { ru: 'Уборщик', en: 'Cleaner' } },
        { name: { ru: 'Журналист', en: 'Journalist' } },
      ]
    },
    {
      id: 'hollywood',
      name: { ru: 'Голливуд', en: 'Hollywood' },
      image: getImg('hollywood'),
      roles: [
        { name: { ru: 'Кинозвезда', en: 'Movie Star' } },
        { name: { ru: 'Папарацци', en: 'Paparazzi' } },
        { name: { ru: 'Режиссер', en: 'Director' } },
        { name: { ru: 'Каскадер', en: 'Stuntman' } },
        { name: { ru: 'Продюсер', en: 'Producer' } },
      ]
    },
    {
      id: 'diner',
      name: { ru: 'Забегаловка', en: 'Diner' },
      image: getImg('diner'),
      roles: [
        { name: { ru: 'Официантка', en: 'Waitress' } },
        { name: { ru: 'Дальнобойщик', en: 'Trucker' } },
        { name: { ru: 'Шериф', en: 'Sheriff' } },
        { name: { ru: 'Байкер', en: 'Biker' } },
        { name: { ru: 'Повар', en: 'Cook' } },
      ]
    }
  ]
};