import { SpyfallPack } from "@/types/spyfall";

const getImg = (name: string) => `/spyfall/horror/${name}.jpg`;

export const horror: SpyfallPack = {
  id: 'horror',
  name: { ru: 'Хоррор', en: 'Horror' },
  emoji: '👻',
  locations: [
    {
      id: 'graveyard',
      name: { ru: 'Кладбище', en: 'Graveyard' },
      image: getImg('graveyard'),
      roles: [
        { name: { ru: 'Могильщик', en: 'Gravedigger' } },
        { name: { ru: 'Зомби', en: 'Zombie' } },
        { name: { ru: 'Священник', en: 'Priest' } },
        { name: { ru: 'Гот', en: 'Goth' } },
        { name: { ru: 'Призрак', en: 'Ghost' } },
        { name: { ru: 'Вдова', en: 'Widow' } },
      ]
    },
    {
      id: 'asylum',
      name: { ru: 'Психбольница', en: 'Asylum' },
      image: getImg('asylum'),
      roles: [
        { name: { ru: 'Психиатр', en: 'Psychiatrist' } },
        { name: { ru: 'Буйный пациент', en: 'Mad Patient' } },
        { name: { ru: 'Медбрат', en: 'Nurse' } },
        { name: { ru: 'Посетитель', en: 'Visitor' } },
        { name: { ru: 'Охранник', en: 'Guard' } },
      ]
    },
    {
      id: 'cult_meeting',
      name: { ru: 'Собрание культа', en: 'Cult Meeting' },
      image: getImg('cult'),
      roles: [
        { name: { ru: 'Лидер культа', en: 'Cult Leader' } },
        { name: { ru: 'Жертва', en: 'Sacrifice' } },
        { name: { ru: 'Новичок', en: 'Newbie' } },
        { name: { ru: 'Фанатик', en: 'Fanatic' } },
        { name: { ru: 'Шпион полиции', en: 'Undercover Cop' } },
      ]
    }
  ]
};