export const initialData = {
  classes: [
    { id: '11A', name: '11А' },
    { id: '11B', name: '11Б' },
    { id: '7B', name: '7Б' },
    { id: '7A', name: '7A' }
  ],

  teachers: [
    { id: 't1', name: 'Иванов И.И.', subjects: ['rus_lit', 'rus'] },
    { id: 't2', name: 'Серикова А.А.', subjects: ['kaz_lit'] },
    { id: 't3', name: 'Касымов Б.Б.', subjects: ['hist_kaz', 'world_hist'] },
    { id: 't4', name: 'Петров П.П.', subjects: ['algebra'] },
    { id: 't17', name: 'Саидов К.К.', subjects: ['algebra'] }, 
    { id: 't18', name: 'Медетова Л.Л.', subjects: ['geometry'] },
    { id: 't19', name: 'Васильев И.И.', subjects: ['geometry'] }, 
    { id: 't5', name: 'Сидоров С.С.', subjects: ['inf'] },
    { id: 't6', name: 'Джонсон М.', subjects: ['eng'] },
    { id: 't7', name: 'Алиева Г.Г.', subjects: ['culture'] },
    { id: 't8', name: 'Смирнова Л.Л.', subjects: ['rus_lit2'] },
    { id: 't9', name: 'Иманбаева С.С.', subjects: ['bio'] },
    { id: 't10', name: 'Ахметов Р.Р.', subjects: ['religion'] },
    { id: 't11', name: 'Жумагалиев А.А.', subjects: ['pe'] },
    { id: 't12', name: 'Каримов Е.Е.', subjects: ['geo'] },
    { id: 't13', name: 'Нуркеева А.А.', subjects: ['global_comp'] },
    { id: 't14', name: 'Абдулин Т.Т.', subjects: ['nvp'] },
    { id: 't15', name: 'Сагындыков Б.Б.', subjects: ['law'] },
    { id: 't16', name: 'Классный руководитель', subjects: ['class_hour'] }
  ],

  subjects: [
    { id: 'rus_lit', name: 'Русский язык и литература', hoursPerWeek: 2, difficulty: 'normal' },
    { id: 'kaz_lit', name: 'Казахский язык и литература', hoursPerWeek: 3, difficulty: 'hard' },
    { id: 'hist_kaz', name: 'История Казахстана', hoursPerWeek: 2, difficulty: 'normal' },
    { id: 'algebra', name: 'Алгебра', hoursPerWeek: 4, difficulty: 'hard' },
    { id: 'geometry', name: 'Геометрия', hoursPerWeek: 3, difficulty: 'hard' },
    { id: 'inf', name: 'Информатика', hoursPerWeek: 2, difficulty: 'normal' }, 
    { id: 'eng', name: 'Английский язык', hoursPerWeek: 3, difficulty: 'normal' },
    { id: 'culture', name: 'Физическая культура', hoursPerWeek: 1, difficulty: 'light' },
    { id: 'rus_lit2', name: 'Русская литература', hoursPerWeek: 2, difficulty: 'normal' },
    { id: 'bio', name: 'Биология', hoursPerWeek: 1, difficulty: 'normal' },
    { id: 'religion', name: 'Регионоведение', hoursPerWeek: 1, difficulty: 'light' },
    { id: 'pe', name: 'Физическая культура', hoursPerWeek: 2, difficulty: 'light' },
    { id: 'world_hist', name: 'Всемирная история', hoursPerWeek: 1, difficulty: 'normal' },
    { id: 'geo', name: 'География', hoursPerWeek: 3, difficulty: 'normal' },
    { id: 'global_comp', name: 'Глобальная компетенция', hoursPerWeek: 1, difficulty: 'light' },
    { id: 'rus', name: 'Русский язык', hoursPerWeek: 1, difficulty: 'normal' },
    { id: 'nvp', name: 'НВП', hoursPerWeek: 1, difficulty: 'light' },
    { id: 'law', name: 'Основы права', hoursPerWeek: 1, difficulty: 'normal' },
    { id: 'class_hour', name: 'Классный час', hoursPerWeek: 1, difficulty: 'light' }
  ],

  settings: {
    days: 5,
    periodsPerDay: 7,
    maxLessonsPerDay: 8,
    noHeavyConsecutive: true,
    maxSameSubjectPerDay: 4,
    difficultyPlacement: {
      hard: [1, 2, 3, 4, 5],     
      normal: [0, 1, 2, 3, 4, 5, 6],
      light: [0, 1, 2, 3, 4, 5, 6]
    }
  },

  schedule: {}
};
