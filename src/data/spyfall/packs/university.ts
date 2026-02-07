import { SpyfallPack } from "@/types/spyfall";

const getImg = (name: string) => `/spyfall/uni/${name}.jpg`;

export const university: SpyfallPack = {
  id: 'university',
  name: { ru: 'Универ', en: 'University' },
  emoji: '🎓',
  locations: [
    {
      id: 'lecture_hall',
      name: { ru: 'Лекционный зал', en: 'Lecture Hall' },
      image: getImg('lecture'),
      roles: [
        { name: { ru: 'Профессор', en: 'Professor' } },
        { name: { ru: 'Студент с ноутбуком', en: 'Student with Laptop' } },
        { name: { ru: 'Опоздавший', en: 'Latecomer' } },
        { name: { ru: 'Аспирант', en: 'PhD Student' } },
        { name: { ru: 'Староста', en: 'Group Leader' } },
      ]
    },
    {
      id: 'dorm',
      name: { ru: 'Общежитие', en: 'Dormitory' },
      image: getImg('dorm'),
      roles: [
        { name: { ru: 'Комендант', en: 'Warden' } },
        { name: { ru: 'Студент-тусовщик', en: 'Party Student' } },
        { name: { ru: 'Ботан', en: 'Nerd' } },
        { name: { ru: 'Гость', en: 'Guest' } },
        { name: { ru: 'Сосед по комнате', en: 'Roommate' } },
      ]
    }
  ]
};