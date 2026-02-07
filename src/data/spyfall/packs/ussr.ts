import { SpyfallPack } from "@/types/spyfall";

const getImg = (name: string) => `/spyfall/ussr/${name}.jpg`;

export const ussr: SpyfallPack = {
  id: 'ussr',
  name: { ru: 'СССР', en: 'USSR' },
  emoji: '☭',
  locations: [
    {
      id: 'gulag',
      name: { ru: 'ГУЛАГ', en: 'Gulag' },
      image: getImg('gulag'),
      roles: [
        { name: { ru: 'Начальник лагеря', en: 'Camp Chief' } },
        { name: { ru: 'Заключенный', en: 'Prisoner' } },
        { name: { ru: 'Охранник с собакой', en: 'Guard with dog' } },
        { name: { ru: 'Повар', en: 'Cook' } },
        { name: { ru: 'Политрук', en: 'Political Officer' } },
      ]
    },
    {
      id: 'kolkhoz',
      name: { ru: 'Колхоз', en: 'Kolkhoz' },
      image: getImg('kolkhoz'),
      roles: [
        { name: { ru: 'Председатель', en: 'Chairman' } },
        { name: { ru: 'Доярка', en: 'Milkmaid' } },
        { name: { ru: 'Тракторист', en: 'Tractor Driver' } },
        { name: { ru: 'Агроном', en: 'Agronomist' } },
        { name: { ru: 'Пионер', en: 'Pioneer' } },
      ]
    },
    {
      id: 'khrushchevka',
      name: { ru: 'Кухня в Хрущевке', en: 'Khrushchevka Kitchen' },
      image: getImg('kitchen'),
      roles: [
        { name: { ru: 'Диссидент', en: 'Dissident' } },
        { name: { ru: 'Соседка', en: 'Neighbor' } },
        { name: { ru: 'Слесарь', en: 'Plumber' } },
        { name: { ru: 'Бабушка', en: 'Babushka' } },
        { name: { ru: 'Интеллигент', en: 'Intellectual' } },
      ]
    }
  ]
};