//с генератором мне помог ии
function shuffleArray(arr) {
  const a = [...(arr || [])];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateAllSchedulesBacktracking({
  classes = [],
  subjects = [],
  teachers = [],
  settings = {},
  timeLimitMs = 60000,
  maxAttempts = 100000,
} = {}) {
  const start = Date.now();

  const DAYS = 5;
  const periods = Number(settings?.periodsPerDay ?? 8);

  console.log(`\n🎯 ГЕНЕРАЦИЯ С ГРУППИРОВКОЙ ПРЕДМЕТОВ`);
  console.log(`📚 Классов: ${classes.length}, Учителей: ${teachers.length}\n`);

  const bySubject = Object.fromEntries((subjects || []).map(s => [s.id, s]));
  const teacherMap = Object.fromEntries((teachers || []).map(t => [t.id, t]));

  const teachersBySubject = {};
  for (const s of subjects) {
    teachersBySubject[s.id] = teachers.filter(t => t.subjects?.includes(s.id));
  }

  // 🆕 ГРУППЫ ПРЕДМЕТОВ
  const subjectGroups = {
    math: ['algebra', 'geometry'],
    physed: ['culture', 'pe'],
    languages: ['rus', 'rus_lit', 'rus_lit2', 'kaz_lit', 'eng'],
    endOfDay: ['class_hour', 'religion', 'global_comp']
  };

  function getSubjectGroup(subjectId) {
    for (const [group, subjects] of Object.entries(subjectGroups)) {
      if (subjects.includes(subjectId)) return group;
    }
    return null;
  }

  function getClassLevel(classId) {
    const num = parseInt(String(classId).replace(/\D/g, ''), 10);
    if (num >= 10) return 'senior';
    if (num >= 7) return 'middle';
    return 'junior';
  }

  function hoursForClass(subject, classId) {
    if (!subject) return 0;
    const h = subject.hoursPerWeek;
    if (h == null) return 0;
    if (typeof h === 'number') return Number(h);
    if (typeof h === 'object') {
      const classNum = parseInt(String(classId).replace(/\D/g, ''), 10);
      return Number(h[classNum] ?? h.default ?? 0);
    }
    return Number(h) || 0;
  }

  // ФАЗА 1: Базовое размещение
  function generateBase() {
    console.log(`⚡ ФАЗА 1: Базовое размещение`);
    
    const teacherOccupied = {};
    teachers.forEach(t => {
      teacherOccupied[t.id] = Array.from({ length: DAYS }, () => Array(periods).fill(false));
    });

    const result = {};

    for (const cls of classes) {
      const classId = cls.id;
      const classLevel = getClassLevel(classId);
      const lessonsPerDay = Number(cls?.lessonsPerDay ?? 7);

      const subjectsForClass = subjects.filter(s => {
        if (classLevel === 'middle' && s.id === 'nvp') return false;
        if (classLevel !== 'senior' && s.id === 'law') return false;
        return hoursForClass(s, classId) > 0;
      });

      const remaining = {};
      subjectsForClass.forEach(s => {
        remaining[s.id] = hoursForClass(s, classId);
      });

      const totalRequired = Object.values(remaining).reduce((a, b) => a + b, 0);
      
      if (totalRequired === 0) {
        result[classId] = Array.from({ length: DAYS }, () => Array(periods).fill(null));
        continue;
      }

      if (totalRequired > DAYS * periods) {
        return null;
      }

      const grid = Array.from({ length: DAYS }, () => Array(periods).fill(null));
      const perDaySubject = Array.from({ length: DAYS }, () => ({}));
      const perDayGroup = Array.from({ length: DAYS }, () => ({})); // 🆕 счётчик групп

      function canPlaceBase(subId, teacherId, d, p) {
        if (!subId || !teacherId) return false;
        if (remaining[subId] <= 0) return false;
        if (!teacherMap[teacherId]?.subjects?.includes(subId)) return false;
        if (teacherOccupied[teacherId]?.[d]?.[p]) return false;
        if (grid[d][p]) return false;
        
        // ❌ Два одинаковых предмета подряд
        if (p > 0 && grid[d][p - 1]?.subjectId === subId) return false;
        
        // 🆕 ❌ Два предмета из одной группы подряд
        const group = getSubjectGroup(subId);
        if (group && p > 0) {
          const prevLesson = grid[d][p - 1];
          if (prevLesson && getSubjectGroup(prevLesson.subjectId) === group) {
            return false;
          }
        }
        
        // ❌ Больше 3 уроков одного предмета в день
        const countToday = perDaySubject[d][subId] || 0;
        if (countToday >= 3) return false;

        // 🆕 ❌ Больше 3 уроков одной группы в день (математика!)
        if (group) {
          const groupCountToday = perDayGroup[d][group] || 0;
          if (groupCountToday >= 3) return false;
        }

        // ❌ Физ-ра: только 1 урок в день
        const physEd = ['culture', 'pe'];
        if (physEd.includes(subId)) {
          const physCount = grid[d].filter(c => c && physEd.includes(c.subjectId)).length;
          if (physCount >= 1) return false;
        }

        return true;
      }

      let allSubjects = [];
      for (const sid of Object.keys(remaining)) {
        for (let i = 0; i < remaining[sid]; i++) {
          allSubjects.push(sid);
        }
      }
      allSubjects = shuffleArray(allSubjects);

      for (let d = 0; d < DAYS && allSubjects.length > 0; d++) {
        for (let p = 0; p < periods && allSubjects.length > 0; p++) {
          for (let i = 0; i < allSubjects.length; i++) {
            const sid = allSubjects[i];
            const possTeachers = shuffleArray([...(teachersBySubject[sid] || [])]);
            
            let placedHere = false;
            for (const t of possTeachers) {
              if (canPlaceBase(sid, t.id, d, p)) {
                grid[d][p] = { subjectId: sid, teacherId: t.id };
                teacherOccupied[t.id][d][p] = true;
                perDaySubject[d][sid] = (perDaySubject[d][sid] || 0) + 1;
                
                // 🆕 Обновляем счётчик группы
                const group = getSubjectGroup(sid);
                if (group) {
                  perDayGroup[d][group] = (perDayGroup[d][group] || 0) + 1;
                }
                
                allSubjects.splice(i, 1);
                placedHere = true;
                break;
              }
            }
            if (placedHere) break;
          }
        }
      }

      if (allSubjects.length > 0) {
        return null;
      }

      result[classId] = grid;
    }

    return result;
  }

  // ФАЗА 2: Агрессивная оптимизация
  function aggressiveOptimize(schedule) {
    console.log(`\n🔥 ФАЗА 2: АГРЕССИВНАЯ оптимизация`);
    
    let totalSwaps = 0;
    
    for (const cls of classes) {
      const grid = schedule[cls.id];
      if (!grid) continue;
      
      const lessonsPerDay = Number(cls?.lessonsPerDay ?? 7);
      
      // ШАГ 1: Физ-ра в конец дня
      for (let d = 0; d < DAYS; d++) {
        for (let p = 0; p < lessonsPerDay - 2; p++) {
          const lesson = grid[d][p];
          if (!lesson) continue;
          
          const physEd = ['culture', 'pe'];
          if (physEd.includes(lesson.subjectId)) {
            for (let p2 = lessonsPerDay - 1; p2 >= lessonsPerDay - 2; p2--) {
              const other = grid[d][p2];
              if (other && !physEd.includes(other.subjectId)) {
                if (canSwap(schedule, cls.id, d, p, d, p2)) {
                  [grid[d][p], grid[d][p2]] = [grid[d][p2], grid[d][p]];
                  totalSwaps++;
                  break;
                }
              }
            }
          }
        }
      }
      
      // ШАГ 2: Сложные предметы из конца в середину
      for (let d = 0; d < DAYS; d++) {
        for (let p = lessonsPerDay - 2; p < periods; p++) {
          const lesson = grid[d][p];
          if (!lesson) continue;
          
          const diff = bySubject[lesson.subjectId]?.difficulty;
          if (diff === 'hard') {
            for (let p2 = 1; p2 < lessonsPerDay - 2; p2++) {
              const other = grid[d][p2];
              if (other && bySubject[other.subjectId]?.difficulty !== 'hard') {
                if (canSwap(schedule, cls.id, d, p, d, p2)) {
                  [grid[d][p], grid[d][p2]] = [grid[d][p2], grid[d][p]];
                  totalSwaps++;
                  break;
                }
              }
            }
          }
        }
      }
      
      // ШАГ 3: Классный час в конец
      for (let d = 0; d < DAYS; d++) {
        for (let p = 0; p < lessonsPerDay - 2; p++) {
          const lesson = grid[d][p];
          if (!lesson) continue;
          
          const endOfDay = ['class_hour', 'religion', 'global_comp'];
          if (endOfDay.includes(lesson.subjectId)) {
            for (let p2 = lessonsPerDay - 2; p2 < periods; p2++) {
              const other = grid[d][p2];
              if (other && !endOfDay.includes(other.subjectId)) {
                if (canSwap(schedule, cls.id, d, p, d, p2)) {
                  [grid[d][p], grid[d][p2]] = [grid[d][p2], grid[d][p]];
                  totalSwaps++;
                  break;
                }
              }
            }
          }
        }
      }
    }
    
    console.log(`✨ Сделано замен: ${totalSwaps}`);
  }

  function canSwap(schedule, classId, d1, p1, d2, p2) {
    const grid = schedule[classId];
    const lesson1 = grid[d1][p1];
    const lesson2 = grid[d2][p2];
    
    if (!lesson1 || !lesson2) return false;

    // Проверка занятости учителей
    for (const cls of classes) {
      if (cls.id === classId) continue;
      const otherGrid = schedule[cls.id];
      if (!otherGrid) continue;

      if (otherGrid[d2]?.[p2]?.teacherId === lesson1.teacherId) return false;
      if (otherGrid[d1]?.[p1]?.teacherId === lesson2.teacherId) return false;
    }

    // ❌ Два одинаковых предмета подряд
    if (p1 > 0 && grid[d1][p1-1]?.subjectId === lesson2.subjectId) return false;
    if (p1 < periods-1 && grid[d1][p1+1]?.subjectId === lesson2.subjectId) return false;
    if (p2 > 0 && grid[d2][p2-1]?.subjectId === lesson1.subjectId) return false;
    if (p2 < periods-1 && grid[d2][p2+1]?.subjectId === lesson1.subjectId) return false;

    // 🆕 ❌ Два предмета из одной группы подряд
    const group1 = getSubjectGroup(lesson1.subjectId);
    const group2 = getSubjectGroup(lesson2.subjectId);
    
    if (group2 && p1 > 0) {
      const prev = grid[d1][p1-1];
      if (prev && getSubjectGroup(prev.subjectId) === group2) return false;
    }
    if (group2 && p1 < periods-1) {
      const next = grid[d1][p1+1];
      if (next && getSubjectGroup(next.subjectId) === group2) return false;
    }
    if (group1 && p2 > 0) {
      const prev = grid[d2][p2-1];
      if (prev && getSubjectGroup(prev.subjectId) === group1) return false;
    }
    if (group1 && p2 < periods-1) {
      const next = grid[d2][p2+1];
      if (next && getSubjectGroup(next.subjectId) === group1) return false;
    }

    return true;
  }

  // ФАЗА 3: Оценка качества
  function evaluateQuality(schedule) {
    console.log(`\n📊 ФАЗА 3: Оценка качества`);
    
    let totalScore = 0;
    
    for (const cls of classes) {
      const grid = schedule[cls.id];
      if (!grid) continue;

      const lessonsPerDay = Number(cls?.lessonsPerDay ?? 7);
      let violations = 0;
      let criticalViolations = 0;

      for (let d = 0; d < DAYS; d++) {
        for (let p = 0; p < lessonsPerDay; p++) {
          const lesson = grid[d][p];
          if (!lesson) continue;

          const diff = bySubject[lesson.subjectId]?.difficulty;
          
          // Критические нарушения
          if (p >= lessonsPerDay - 2 && diff === 'hard') {
            violations += 3;
            criticalViolations++;
          }
          
          const physEd = ['culture', 'pe'];
          if (physEd.includes(lesson.subjectId) && p < lessonsPerDay - 2) {
            violations += 3;
            criticalViolations++;
          }
          
          // 🆕 Два урока математики подряд
          if (p > 0) {
            const prev = grid[d][p-1];
            if (prev) {
              const group = getSubjectGroup(lesson.subjectId);
              const prevGroup = getSubjectGroup(prev.subjectId);
              if (group && group === prevGroup && group === 'math') {
                violations += 2;
                criticalViolations++;
              }
            }
          }
          
          // Средние нарушения
          if (p === lessonsPerDay - 1 && diff === 'normal') violations += 1;
          
          const endOfDay = ['class_hour', 'religion', 'global_comp'];
          if (endOfDay.includes(lesson.subjectId) && p < lessonsPerDay - 2) {
            violations += 1;
          }
        }
      }

      const score = Math.max(0, 100 - violations * 5);
      totalScore += score;
      
      let emoji = '✅';
      if (criticalViolations > 0) emoji = '❌';
      else if (score < 80) emoji = '⚠️';
      
      console.log(`   ${emoji} ${cls.name}: ${score}/100 (критических: ${criticalViolations})`);
    }

    const avgScore = Math.round(totalScore / classes.length);
    return { avgScore, totalScore };
  }

  // ОСНОВНОЙ ЦИКЛ
  let bestSchedule = null;
  let bestScore = 0;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (Date.now() - start > timeLimitMs) break;

    console.log(`\n━━━ ПОПЫТКА ${attempt + 1}/${maxAttempts} ━━━`);

    const base = generateBase();
    if (!base) {
      console.log(`❌ Не удалось составить базу`);
      continue;
    }

    aggressiveOptimize(base);
    const { avgScore, totalScore } = evaluateQuality(base);

    if (avgScore > bestScore) {
      bestScore = avgScore;
      bestSchedule = base;
      console.log(`\n🏆 НОВЫЙ ЛУЧШИЙ РЕЗУЛЬТАТ: ${avgScore}/100`);
    }

    if (avgScore >= 95) {
      console.log(`\n🎉 ИДЕАЛЬНОЕ РАСПИСАНИЕ!`);
      break;
    }

    if (avgScore >= 85 && attempt >= 10) {
      console.log(`\n✅ Достаточно хорошее расписание`);
      break;
    }
  }

  if (bestSchedule) {
    const duration = Math.round((Date.now() - start) / 1000);
    console.log(`\n╔════════════════════════════════════╗`);
    console.log(`║  🎉 РАСПИСАНИЕ ГОТОВО!            ║`);
    console.log(`║  Качество: ${bestScore}/100                  ║`);
    console.log(`║  Время: ${duration}с                         ║`);
    console.log(`╚════════════════════════════════════╝`);
    
    console.log(`\n✅ Применены правила:`);
    console.log(`   🧮 НЕТ математики (алгебра+геометрия) подряд`);
    console.log(`   🏃 Физ-ра ТОЛЬКО в конце дня`);
    console.log(`   🧠 Сложные предметы на 2-4 уроках`);
    console.log(`   😴 НЕТ сложных предметов в конце дня`);
    console.log(`   📚 Классный час в конце дня`);
    
    return bestSchedule;
  }

  console.warn('\n❌ Не удалось составить расписание');
  return null;
}