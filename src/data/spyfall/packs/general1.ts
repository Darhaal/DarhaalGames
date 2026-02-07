import { SpyfallPack } from "@/types/spyfall";

const getImg = (name: string) => `/spyfall/general/${name}.jpg`;

export const general1: SpyfallPack = {
  id: 'general1',
  name: { ru: 'Общее #1', en: 'General #1' },
  emoji: '🌍',
  locations: [
    {
      id: 'beach',
      name: { ru: 'Пляж', en: 'Beach' },
      image: getImg('beach'),
      roles: [
        { name: { ru: 'Спасатель', en: 'Lifeguard' } },
        { name: { ru: 'Вор', en: 'Thief' } },
        { name: { ru: 'Серфер', en: 'Surfer' } },
        { name: { ru: 'Продавец мороженого', en: 'Ice Cream Seller' } },
        { name: { ru: 'Турист с камерой', en: 'Tourist' } },
        { name: { ru: 'Ребенок', en: 'Kid' } },
        { name: { ru: 'Нудист', en: 'Nudist' } },
      ]
    },
    {
      id: 'hotel',
      name: { ru: 'Отель', en: 'Hotel' },
      image: getImg('hotel'),
      roles: [
        { name: { ru: 'Портье', en: 'Receptionist' } },
        { name: { ru: 'Горничная', en: 'Maid' } },
        { name: { ru: 'Бармен', en: 'Bartender' } },
        { name: { ru: 'Богатый постоялец', en: 'Rich Guest' } },
        { name: { ru: 'Охранник', en: 'Security' } },
        { name: { ru: 'Швейцар', en: 'Doorman' } },
      ]
    },
    {
      id: 'supermarket',
      name: { ru: 'Супермаркет', en: 'Supermarket' },
      image: getImg('supermarket'),
      roles: [
        { name: { ru: 'Кассир', en: 'Cashier' } },
        { name: { ru: 'Мясник', en: 'Butcher' } },
        { name: { ru: 'Охранник', en: 'Security Guard' } },
        { name: { ru: 'Покупатель с тележкой', en: 'Shopper' } },
        { name: { ru: 'Промоутер', en: 'Promoter' } },
        { name: { ru: 'Менеджер', en: 'Manager' } },
      ]
    },
    {
      id: 'theater',
      name: { ru: 'Театр', en: 'Theater' },
      image: getImg('theater'),
      roles: [
        { name: { ru: 'Актер', en: 'Actor' } },
        { name: { ru: 'Суфлер', en: 'Prompter' } },
        { name: { ru: 'Режиссер', en: 'Director' } },
        { name: { ru: 'Гример', en: 'Makeup Artist' } },
        { name: { ru: 'Зритель в ложе', en: 'Spectator' } },
        { name: { ru: 'Гардеробщик', en: 'Cloakroom Attendant' } },
      ]
    }
  ]
};