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

  console.log(`\n🎯 ГЕНЕРАЦИЯ РАСПИСАНИЯ`);
  console.log(`📚 Классов: ${classes.length}, Учителей: ${teachers.length}\n`);

  const bySubject = Object.fromEntries((subjects || []).map(s => [s.id, s]));
  const teacherMap = Object.fromEntries((teachers || []).map(t => [t.id, t]));

  const teachersBySubject = {};
  for (const s of subjects) {
    teachersBySubject[s.id] = teachers.filter(t => t.subjects?.includes(s.id));
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

  function getClassLevel(classId) {
    const num = parseInt(String(classId).replace(/\D/g, ''), 10);
    if (num >= 10) return 'senior';
    if (num >= 7) return 'middle';
    return 'junior';
  }

  function getPositionScoreByDifficulty(p, difficulty, d, grid) {
    // Оптимальные позиции: сложные в начало, нормальные в середину, лёгкие в конец
    let score = 0;
    
    if (difficulty === 'hard') {
      score = p <= 2 ? 10 : p <= 4 ? 5 : 0;
    } else if (difficulty === 'normal') {
      score = p >= 2 && p <= 4 ? 10 : p <= 6 ? 5 : 0;
    } else {
      score = p >= 4 ? 10 : p >= 2 ? 5 : 0;
    }

    // Штраф если рядом стоит сложный предмет и мы хотим сложный
    if (difficulty === 'hard') {
      if (p > 0 && grid[d][p - 1] && bySubject[grid[d][p - 1].subjectId]?.difficulty === 'hard') {
        score -= 5;
      }
      if (p < periods - 1 && grid[d][p + 1] && bySubject[grid[d][p + 1].subjectId]?.difficulty === 'hard') {
        score -= 5;
      }
    }

    return Math.max(0, score);
  }

  function generateBase() {
    console.log(`⚡ ФАЗА 1: Создание расписания`);
    
    const result = {};
    const globalTeacherOccupancy = {};
    
    teachers.forEach(t => {
      globalTeacherOccupancy[t.id] = Array.from({ length: DAYS }, () => Array(periods).fill(false));
    });

    for (const cls of classes) {
      const classId = cls.id;
      const classLevel = getClassLevel(classId);

      const subjectsForClass = subjects.filter(s => {
        if (classLevel === 'middle' && s.id === 'nvp') return false;
        if (classLevel !== 'senior' && s.id === 'law') return false;
        return hoursForClass(s, classId) > 0;
      });

      // Создаём список всех уроков
      const allLessons = [];
      subjectsForClass.forEach(s => {
        const hours = hoursForClass(s, classId);
        for (let i = 0; i < hours; i++) {
          allLessons.push(s.id);
        }
      });

      const totalRequired = allLessons.length;
      
      if (totalRequired === 0) {
        result[classId] = Array.from({ length: DAYS }, () => Array(periods).fill(null));
        continue;
      }

      if (totalRequired > DAYS * periods) {
        console.log(`❌ Слишком много часов для ${classId}`);
        return null;
      }

      const grid = Array.from({ length: DAYS }, () => Array(periods).fill(null));
      const lessonsCopy = [...allLessons];

      function canPlace(subId, teacherId, d, p) {
        if (!subId || !teacherId) return false;
        if (!teacherMap[teacherId]?.subjects?.includes(subId)) return false;
        if (globalTeacherOccupancy[teacherId][d][p]) return false;
        if (grid[d][p]) return false;

        // Нет двух одинаковых подряд
        if (p > 0 && grid[d][p - 1]?.subjectId === subId) return false;

        // Нет двух сложных предметов подряд
        const subject = bySubject[subId];
        if (subject.difficulty === 'hard' && p > 0) {
          const prevLesson = grid[d][p - 1];
          if (prevLesson && bySubject[prevLesson.subjectId]?.difficulty === 'hard') {
            return false;
          }
        }
        if (subject.difficulty === 'hard' && p < periods - 1) {
          const nextLesson = grid[d][p + 1];
          if (nextLesson && bySubject[nextLesson.subjectId]?.difficulty === 'hard') {
            return false;
          }
        }
        
        return true;
      }

      // Попытка разместить все уроки
      let attempts = 0;
      const maxRetries = 1000;

      while (lessonsCopy.length > 0 && attempts < maxRetries) {
        attempts++;
        let placed = false;

        // Берём первый урок из списка
        const lessonIdx = 0;
        const subId = lessonsCopy[lessonIdx];
        const subject = bySubject[subId];

        // Ищем лучшее место для этого урока
        let bestSlot = null;
        let bestScore = -1;

        for (let d = 0; d < DAYS; d++) {
          for (let p = 0; p < periods; p++) {
            if (!grid[d][p]) {
              const possTeachers = teachersBySubject[subId] || [];
              
              for (const t of possTeachers) {
                if (canPlace(subId, t.id, d, p)) {
                  const score = getPositionScoreByDifficulty(p, subject.difficulty, d, grid);
                  
                  if (score > bestScore) {
                    bestScore = score;
                    bestSlot = { d, p, teacherId: t.id };
                  }
                  
                  // Если нашли идеальное место, не ищем дальше
                  if (score >= 10) break;
                }
              }
            }
          }
        }

        // Размещаем в лучшем найденном месте
        if (bestSlot) {
          const { d, p, teacherId } = bestSlot;
          grid[d][p] = { subjectId: subId, teacherId };
          globalTeacherOccupancy[teacherId][d][p] = true;
          lessonsCopy.splice(lessonIdx, 1);
          placed = true;
        }

        if (!placed) {
          console.log(`⚠️  Не могу разместить ${subId} для класса ${classId}`);
          return null;
        }
      }

      if (lessonsCopy.length > 0) {
        console.log(`❌ Класс ${classId}: осталось ${lessonsCopy.length} неразмещённых уроков`);
        return null;
      }

      result[classId] = grid;
    }

    return result;
  }

  function evaluateQuality(schedule) {
    console.log(`\n📊 ФАЗА 2: Оценка качества`);
    
    let totalScore = 0;
    let criticalCount = 0;

    for (const cls of classes) {
      const grid = schedule[cls.id];
      if (!grid) continue;

      let violations = 0;
      let critical = 0;

      for (let d = 0; d < DAYS; d++) {
        for (let p = 0; p < periods; p++) {
          const lesson = grid[d][p];
          if (!lesson) continue;

          const subject = bySubject[lesson.subjectId];
          const diff = subject?.difficulty;

          // Критическое: сложные в конце
          if (diff === 'hard' && p >= 5) {
            violations += 5;
            critical++;
          }

          // Критическое: лёгкие предметы должны быть в конце
          // (физ-ра и подобные - это light предметы)
          if (subject.difficulty === 'light' && p < 5) {
            // Это не критично, просто предпочтение
          }

          // Два одинаковых подряд
          if (p > 0 && grid[d][p - 1]?.subjectId === lesson.subjectId) {
            violations += 2;
          }
        }
      }

      const score = Math.max(0, 100 - violations * 3);
      totalScore += score;
      criticalCount += critical;

      const emoji = critical > 0 ? '❌' : score < 80 ? '⚠️' : '✅';
      console.log(`   ${emoji} ${cls.name}: ${score}/100`);
    }

    const avgScore = Math.round(totalScore / classes.length);
    return { avgScore, criticalCount };
  }

  let bestSchedule = null;
  let bestScore = 0;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (Date.now() - start > timeLimitMs) break;

    console.log(`\n━━━ ПОПЫТКА ${attempt + 1}/${maxAttempts} ━━━`);

    const base = generateBase();
    if (!base) {
      console.log(`❌ Не удалось`);
      continue;
    }

    const { avgScore, criticalCount } = evaluateQuality(base);

    if (avgScore > bestScore) {
      bestScore = avgScore;
      bestSchedule = base;
      console.log(`🏆 НОВЫЙ РЕЗУЛЬТАТ: ${avgScore}/100`);
    }

    if (criticalCount === 0 && avgScore >= 85) {
      console.log(`✅ Хорошее расписание найдено`);
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
    console.log(`   🧠 Сложные в начало дня`);
    console.log(`   📚 Нормальные в середину`);
    console.log(`   😴 Лёгкие в конец`);
    console.log(`   👨‍🏫 Учёт занятости учителей`);
    
    return bestSchedule;
  }

  console.warn('\n❌ Расписание не составлено');
  return null;
}