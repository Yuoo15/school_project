export const initialData = {
    classes: [
        { id: '5A', name: '5А'},
        { id: '7B', name: '7Б' }
    ],
    teachers: [
        { id: 't1', name: 'Иванов И.И.', subjects: ['math'] },
        { id: 't2', name: 'Петров П.П.', subjects: ['rus'] },
        { id: 't3', name: 'Сидорова С.С.', subjects: ['phys'] }
    ],
    subjects: [
        { id: 'math', name: 'Математика', hoursPerWeek: 4, difficulty: 'hard' },
        { id: 'rus', name: 'Русский язык', hoursPerWeek: 4, difficulty: 'normal' },
        { id: 'phys', name: 'Физкультура', hoursPerWeek: 2, difficulty: 'light' }
    ],
    settings: {
        days: 5,
        periodsPerDay: 7,
        maxLessonsPerDay: 7,
        noHeavyConsecutive: true
    },
        schedule: {}
}