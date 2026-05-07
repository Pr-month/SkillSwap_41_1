import { testUsers } from './user.array';

export const SkillsData = [
  {
    title: 'Основы живописи и композиции',
    description:
      'Изучение базовых техник рисования, работа с цветом, светом и композицией.',
    category: 'Творчество и искусство',
    images: ['example/art1.png', 'example/art2.png'],
    ownerEmail: testUsers[0].email,
  },
  {
    title: 'Frontend разработка на React',
    description:
      'Создание современных пользовательских интерфейсов с использованием React, хуков и REST API.',
    category: 'IT и программирование',
    images: ['example/react1.png', 'example/react2.png'],
    ownerEmail: testUsers[0].email,
  },
  {
    title: 'UX/UI дизайн интерфейсов',
    description:
      'Проектирование удобных интерфейсов, работа с пользовательским опытом и прототипирование.',
    category: 'Дизайн и UX/UI',
    images: ['example/uiux1.png'],
    ownerEmail: testUsers[0].email,
  },
  {
    title: 'Графический дизайн в Figma',
    description:
      'Создание макетов, работа с компонентами и дизайн-системами в Figma.',
    category: 'Дизайн и UX/UI',
    images: ['example/figma1.png'],
    ownerEmail: testUsers[1].email,
  },
  {
    title: 'Основы digital-маркетинга',
    description:
      'Продвижение продуктов через соцсети, SEO и контекстную рекламу.',
    category: 'Маркетинг и продажи',
    images: ['example/marketing1.png'],
    ownerEmail: testUsers[1].email,
  },
  {
    title: 'Навыки преподавания и обучения',
    description:
      'Методики эффективного обучения, построение курсов и работа с аудиторией.',
    category: 'Образование и обучение',
    images: ['example/education1.png'],
    ownerEmail: testUsers[1].email,
  },
];
