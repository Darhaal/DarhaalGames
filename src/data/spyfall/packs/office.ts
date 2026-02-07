import { SpyfallPack } from "@/types/spyfall";

const getImg = (name: string) => `/spyfall/office/${name}.jpg`;

export const office: SpyfallPack = {
  id: 'office',
  name: { ru: 'Офис', en: 'Office' },
  emoji: '💼',
  locations: [
    {
      id: 'open_space',
      name: { ru: 'Опенспейс', en: 'Open Space' },
      image: getImg('openspace'),
      roles: [
        { name: { ru: 'Босс', en: 'Boss' } },
        { name: { ru: 'Стажер', en: 'Intern' } },
        { name: { ru: 'Сисадмин', en: 'Sysadmin' } },
        { name: { ru: 'Менеджер по продажам', en: 'Sales Manager' } },
        { name: { ru: 'Секретарь', en: 'Secretary' } },
        { name: { ru: 'Уставший работник', en: 'Tired Worker' } },
      ]
    },
    {
      id: 'meeting_room',
      name: { ru: 'Переговорка', en: 'Meeting Room' },
      image: getImg('meeting'),
      roles: [
        { name: { ru: 'Докладчик', en: 'Speaker' } },
        { name: { ru: 'Скучающий сотрудник', en: 'Bored Employee' } },
        { name: { ru: 'Инвестор', en: 'Investor' } },
        { name: { ru: 'Опоздавший', en: 'Latecomer' } },
        { name: { ru: 'HR', en: 'HR' } },
      ]
    },
    {
      id: 'corporate_party',
      name: { ru: 'Корпоратив', en: 'Corporate Party' },
      image: getImg('party'),
      roles: [
        { name: { ru: 'Пьяный бухгалтер', en: 'Drunk Accountant' } },
        { name: { ru: 'Ведущий', en: 'MC' } },
        { name: { ru: 'Генеральный директор', en: 'CEO' } },
        { name: { ru: 'Диджей', en: 'DJ' } },
        { name: { ru: 'Сотрудник с женой', en: 'Employee with wife' } },
      ]
    }
  ]
};