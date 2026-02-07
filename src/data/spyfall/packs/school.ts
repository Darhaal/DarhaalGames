import { SpyfallPack } from "@/types/spyfall";

const getImg = (name: string) => `/spyfall/school/${name}.jpg`;

export const school: SpyfallPack = {
  id: 'school',
  name: { ru: 'Школа', en: 'School' },
  emoji: '🏫',
  locations: [
    {
      id: 'classroom',
      name: { ru: 'Школьный класс', en: 'Classroom' },
      image: getImg('class'),
      roles: [
        { name: { ru: 'Учитель', en: 'Teacher' } },
        { name: { ru: 'Отличник', en: 'Top Student' } },
        { name: { ru: 'Хулиган', en: 'Bully' } },
        { name: { ru: 'Директор', en: 'Principal' } },
        { name: { ru: 'Спящий ученик', en: 'Sleeping Student' } },
        { name: { ru: 'Новенький', en: 'New Student' } },
      ]
    },
    {
      id: 'cafeteria',
      name: { ru: 'Столовая', en: 'Cafeteria' },
      image: getImg('cafeteria'),
      roles: [
        { name: { ru: 'Повар', en: 'Lunch Lady' } },
        { name: { ru: 'Голодный ученик', en: 'Hungry Student' } },
        { name: { ru: 'Дежурный учитель', en: 'Duty Teacher' } },
        { name: { ru: 'Уборщица', en: 'Cleaner' } },
        { name: { ru: 'Популярная девочка', en: 'Popular Girl' } },
      ]
    },
    {
      id: 'gym',
      name: { ru: 'Физкультура', en: 'Gym Class' },
      image: getImg('gym'),
      roles: [
        { name: { ru: 'Физрук', en: 'Coach' } },
        { name: { ru: 'Капитан команды', en: 'Team Captain' } },
        { name: { ru: 'Ученик без формы', en: 'Student w/o kit' } },
        { name: { ru: 'Болельщица', en: 'Cheerleader' } },
        { name: { ru: 'Травмированный', en: 'Injured Student' } },
      ]
    }
  ]
};