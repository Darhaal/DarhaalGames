import { SpyfallPack } from "@/types/spyfall";

const getImg = (name: string) => `/spyfall/general/${name}.jpg`;

export const general2: SpyfallPack = {
  id: 'general2',
  name: { ru: 'Общее #2', en: 'General #2' },
  emoji: '🏙️',
  locations: [
    {
      id: 'bank',
      name: { ru: 'Банк', en: 'Bank' },
      image: getImg('bank'),
      roles: [
        { name: { ru: 'Грабитель', en: 'Robber' } },
        { name: { ru: 'Директор банка', en: 'Bank Manager' } },
        { name: { ru: 'Консультант', en: 'Consultant' } },
        { name: { ru: 'Инкассатор', en: 'Armored Car Driver' } },
        { name: { ru: 'Клиент', en: 'Customer' } },
        { name: { ru: 'Охранник', en: 'Guard' } },
      ]
    },
    {
      id: 'spa',
      name: { ru: 'СПА-салон', en: 'Spa' },
      image: getImg('spa'),
      roles: [
        { name: { ru: 'Массажист', en: 'Masseur' } },
        { name: { ru: 'Клиент в маске', en: 'Client' } },
        { name: { ru: 'Администратор', en: 'Admin' } },
        { name: { ru: 'Косметолог', en: 'Cosmetologist' } },
        { name: { ru: 'Уборщик', en: 'Cleaner' } },
      ]
    },
    {
      id: 'police',
      name: { ru: 'Полицейский участок', en: 'Police Station' },
      image: getImg('police'),
      roles: [
        { name: { ru: 'Детектив', en: 'Detective' } },
        { name: { ru: 'Адвокат', en: 'Lawyer' } },
        { name: { ru: 'Преступник', en: 'Criminal' } },
        { name: { ru: 'Дежурный', en: 'Desk Officer' } },
        { name: { ru: 'Свидетель', en: 'Witness' } },
      ]
    }
  ]
};