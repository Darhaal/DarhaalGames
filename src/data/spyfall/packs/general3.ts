import { SpyfallPack } from "@/types/spyfall";

const getImg = (name: string) => `/spyfall/general/${name}.jpg`;

export const general3: SpyfallPack = {
  id: 'general3',
  name: { ru: 'Общее #3', en: 'General #3' },
  emoji: '🌇',
  locations: [
    {
      id: 'train_station',
      name: { ru: 'Вокзал', en: 'Train Station' },
      image: getImg('station'),
      roles: [
        { name: { ru: 'Машинист', en: 'Train Driver' } },
        { name: { ru: 'Пассажир с чемоданом', en: 'Passenger with suitcase' } },
        { name: { ru: 'Кассир', en: 'Ticket Seller' } },
        { name: { ru: 'Полицейский', en: 'Police Officer' } },
        { name: { ru: 'Безбилетник', en: 'Stowaway' } },
      ]
    },
    {
      id: 'restaurant',
      name: { ru: 'Ресторан', en: 'Restaurant' },
      image: getImg('restaurant'),
      roles: [
        { name: { ru: 'Шеф-повар', en: 'Chef' } },
        { name: { ru: 'Официант', en: 'Waiter' } },
        { name: { ru: 'Музыкант', en: 'Musician' } },
        { name: { ru: 'Посетитель', en: 'Customer' } },
        { name: { ru: 'Критик', en: 'Food Critic' } },
      ]
    },
    {
      id: 'library',
      name: { ru: 'Библиотека', en: 'Library' },
      image: getImg('library'),
      roles: [
        { name: { ru: 'Библиотекарь', en: 'Librarian' } },
        { name: { ru: 'Шумный читатель', en: 'Noisy Reader' } },
        { name: { ru: 'Студент', en: 'Student' } },
        { name: { ru: 'Писатель', en: 'Writer' } },
        { name: { ru: 'Охранник', en: 'Security' } },
      ]
    }
  ]
};