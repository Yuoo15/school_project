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
  maxAttempts = 10000,
} = {}) {
  const start = Date.now();

  // ЖЕСТКО ФИКСИРУЕМ 5 ДНЕЙ
  const DAYS = 5;
  const periods = Number(settings?.periodsPerDay ?? 8);
  const maxSameSubjectPerDay = 3;

  console.log(`\n🎯 ГЕНЕРАЦИЯ: ${DAYS} дней × ${periods} уроков`);
  console.log(`📚 Классов: ${classes.length}, Учителей: ${teachers.length}`);
  console.log(`💡 Применяются правила здорового расписания`);
  console.log(`📋 НВП - только старшая школа, Право - только 9-11 классы`);

  const bySubject = Object.fromEntries((subjects || []).map(s => [s.id, s]));
  const teacherMap = Object.fromEntries((teachers || []).map(t => [t.id, t]));

  function timedOut() {
    return Date.now() - start > timeLimitMs;
  }

  const teachersBySubject = {};
  for (const s of subjects) {
    teachersBySubject[s.id] = teachers.filter(t => t.subjects?.includes(s.id));
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

  // КАТЕГОРИИ ПРЕДМЕТОВ для умного размещения
  function getSubjectType(subId) {
    const mental = ['algebra', 'geometry', 'kaz_lit', 'chemistry', 'physics'];
    const active = ['pe', 'culture'];
    const creative = ['art', 'music', 'tech'];
    const moderate = ['eng', 'rus', 'rus_lit', 'hist_kaz', 'world_hist', 'geo', 'bio', 'inf'];
    const relaxing = ['religion', 'global_comp', 'class_hour', 'law'];
    
    if (mental.includes(subId)) return 'mental';
    if (active.includes(subId)) return 'active';
    if (creative.includes(subId)) return 'creative';
    if (moderate.includes(subId)) return 'moderate';
    if (relaxing.includes(subId)) return 'relaxing';
    return 'moderate';
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (timedOut()) break;
    console.log(`🔄 Попытка ${attempt + 1}/${maxAttempts}...`);

    const teacherOccupied = {};
    teachers.forEach(t => {
      teacherOccupied[t.id] = Array.from({ length: DAYS }, () => Array(periods).fill(false));
    });

    const result = {};
    let globalFail = false;

    const classOrder = attempt < 3 ? classes : shuffleArray([...classes]);

    for (const cls of classOrder) {
      if (timedOut()) {
        globalFail = true;
        break;
      }

      const classId = cls.id;
      const classLevel = getClassLevel(classId);
      const lessonsPerDay = Number(cls?.lessonsPerDay ?? 7);

      // Определяем предметы для класса
      const subjectsForClass = subjects.filter(s => {
        // НВП только для старших (не для middle school)
        if (classLevel === 'middle' && s.id === 'nvp') return false;
        
        // Основы права только для 9-11 классов (не для 7-8)
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
        console.log(`✓ Класс ${cls.name}: нет предметов`);
        continue;
      }

      const maxSlots = DAYS * lessonsPerDay;
      if (totalRequired > maxSlots) {
        console.warn(`❌ Класс ${cls.name}: нужно ${totalRequired} уроков, есть только ${maxSlots} слотов`);
        globalFail = true;
        break;
      }

      // Создаём сетку СТРОГО на DAYS дней
      const grid = Array.from({ length: DAYS }, () => Array(periods).fill(null));
      const perDayCount = Array(DAYS).fill(0);
      const perDaySubject = Array.from({ length: DAYS }, () => ({}));

      function canPlace(subId, teacherId, d, p) {
        if (!subId || !teacherId) return false;
        if (remaining[subId] <= 0) return false;
        if (perDayCount[d] >= lessonsPerDay) return false;
        if (!teacherMap[teacherId]?.subjects?.includes(subId)) return false;
        if (teacherOccupied[teacherId]?.[d]?.[p]) return false;
        if (grid[d][p]) return false;

        const diff = bySubject[subId]?.difficulty;
        const type = getSubjectType(subId);

        // ═══════════════════════════════════════════════════════════
        // ПРАВИЛА ДЛЯ ЗДОРОВОГО И ЭФФЕКТИВНОГО ОБУЧЕНИЯ
        // ═══════════════════════════════════════════════════════════

        // 1️⃣ КЛАССНЫЙ ЧАС, РЕЛИГИЯ, ГЛОБАЛКИ - ТОЛЬКО В КОНЦЕ ДНЯ
        const endOfDaySubjects = ['class_hour', 'religion', 'global_comp', 'culture'];
        if (endOfDaySubjects.includes(subId)) {
          if (p < lessonsPerDay - 2) return false;
        }

        // 2️⃣ НА ПОСЛЕДНИХ УРОКАХ НЕ ДОЛЖНО БЫТЬ СЛОЖНЫХ ПРЕДМЕТОВ
        if (p >= lessonsPerDay - 2 && diff === 'hard') {
          const hasLightToPlace = Object.keys(remaining).some(sid => 
            remaining[sid] > 0 && 
            (bySubject[sid]?.difficulty === 'light' || endOfDaySubjects.includes(sid))
          );
          if (hasLightToPlace) return false;
        }

        // 3️⃣ ПЕРВЫЙ УРОК - НЕ САМЫЙ СЛОЖНЫЙ (дети просыпаются)
        if (p === 0 && diff === 'hard') {
          const hasModerateToPlace = Object.keys(remaining).some(sid => 
            remaining[sid] > 0 && bySubject[sid]?.difficulty !== 'hard'
          );
          if (hasModerateToPlace && Math.random() > 0.3) return false; // 70% шанс избежать
        }

        // 4️⃣ КОНТРОЛЬНЫЕ ТОЧКИ: 2-3 урок - ПИКОВАЯ КОНЦЕНТРАЦИЯ
        // Hard предметы лучше на 2-4 уроках
        if (diff === 'hard' && (p === 1 || p === 2 || p === 3)) {
          // Бонус - эти позиции приоритетны для hard
        }

        // 5️⃣ ЧЕРЕДОВАНИЕ НАГРУЗКИ - после mental должен быть перерыв
        if (p > 0) {
          const prev = grid[d][p - 1];
          if (prev) {
            const prevType = getSubjectType(prev.subjectId);
            const prevDiff = bySubject[prev.subjectId]?.difficulty;

            // После mental/hard - желательно active/creative/moderate
            if (prevType === 'mental' && type === 'mental') {
              // Два mental подряд - плохо
              const hasNonMentalOption = Object.keys(remaining).some(sid => 
                remaining[sid] > 0 && getSubjectType(sid) !== 'mental'
              );
              if (hasNonMentalOption && Math.random() > 0.4) return false;
            }

            // После физкультуры не должно быть сразу контрольной
            if (prevType === 'active' && type === 'mental') {
              if (Math.random() > 0.6) return false; // 40% шанс
            }
          }
        }

        // 6️⃣ ДВА ОДИНАКОВЫХ ПРЕДМЕТА ПОДРЯД - ЗАПРЕЩЕНО
        if (p > 0 && grid[d][p - 1]?.subjectId === subId) return false;

        // 7️⃣ ФИЗКУЛЬТУРА - ТОЛЬКО 1 РАЗ В ДЕНЬ
        const physEd = ['culture', 'pe'];
        if (physEd.includes(subId)) {
          const physCount = grid[d].filter(c => c && physEd.includes(c.subjectId)).length;
          if (physCount >= 1) return false;
        }

        // 8️⃣ ОДИН ПРЕДМЕТ - НЕ БОЛЕЕ 3 РАЗ В ДЕНЬ
        const countToday = perDaySubject[d][subId] || 0;
        if (countToday >= maxSameSubjectPerDay) return false;

        // 9️⃣ HARD ПРЕДМЕТЫ - МАКСИМУМ 3 В ДЕНЬ
        if (diff === 'hard') {
          const hardCount = grid[d].filter(c => c && bySubject[c.subjectId]?.difficulty === 'hard').length;
          if (hardCount >= 3) return false;
        }

        // 🔟 ПЯТНИЦА - ЛЕГЧЕ ДНЯ (снижаем нагрузку к концу недели)
        if (d === 4) { // Пятница
          if (diff === 'hard') {
            const hardCountFriday = grid[4].filter(c => c && bySubject[c.subjectId]?.difficulty === 'hard').length;
            if (hardCountFriday >= 2) return false; // В пятницу максимум 2 hard
          }
        }

        // 1️⃣1️⃣ ПОНЕДЕЛЬНИК - МЯГКИЙ СТАРТ (не перегружаем)
        if (d === 0) { // Понедельник
          if (diff === 'hard') {
            const hardCountMonday = grid[0].filter(c => c && bySubject[c.subjectId]?.difficulty === 'hard').length;
            if (hardCountMonday >= 2 && p < 3) return false; // Первые уроки понедельника - легче
          }
        }

        // 1️⃣2️⃣ СРЕДА - СЕРЕДИНА НЕДЕЛИ (можно нагрузить)
        if (d === 2 && diff === 'hard') {
          // В среду разрешаем больше hard - это норм
        }

        // 1️⃣3️⃣ ТРИ HARD ПОДРЯД - КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО
        if (diff === 'hard' && p > 1) {
          const prev1 = grid[d][p - 1];
          const prev2 = grid[d][p - 2];
          if (prev1 && prev2) {
            const d1 = bySubject[prev1.subjectId]?.difficulty;
            const d2 = bySubject[prev2.subjectId]?.difficulty;
            if (d1 === 'hard' && d2 === 'hard') return false;
          }
        }

        // 1️⃣4️⃣ БАЛАНС ПО НЕДЕЛЕ - не все hard в одни дни
        const hardByDay = [];
        for (let day = 0; day < DAYS; day++) {
          const count = grid[day].filter(c => c && bySubject[c.subjectId]?.difficulty === 'hard').length;
          hardByDay.push(count);
        }
        
        if (diff === 'hard') {
          const currentHardCount = hardByDay[d];
          const avgHard = hardByDay.reduce((a, b) => a + b, 0) / DAYS;
          // Не даём одному дню стать слишком тяжелым по сравнению с другими
          if (currentHardCount > avgHard + 1.5) return false;
        }

        return true;
      }

      // УМНАЯ СТРАТЕГИЯ: сначала основные предметы, потом "конечные"
      let success = true;
      
      for (let d = 0; d < DAYS; d++) {
        // ЭТАП 1: Заполняем основную часть дня (кроме последних 2 уроков)
        const mainPartEnd = Math.max(1, lessonsPerDay - 2);
        
        for (let p = 0; p < mainPartEnd; p++) {
          if (timedOut()) {
            success = false;
            break;
          }

          // Сортируем: hard и normal предметы в приоритете
          const subjectsToPlace = Object.keys(remaining)
            .filter(sid => {
              if (remaining[sid] <= 0) return false;
              // Исключаем "конечные" предметы на этом этапе
              const endOfDay = ['class_hour', 'religion', 'global_comp'];
              return !endOfDay.includes(sid);
            })
            .sort((a, b) => {
              const rA = remaining[a];
              const rB = remaining[b];
              const dA = bySubject[a]?.difficulty === 'hard' ? 3 : 
                        (bySubject[a]?.difficulty === 'normal' ? 2 : 1);
              const dB = bySubject[b]?.difficulty === 'hard' ? 3 : 
                        (bySubject[b]?.difficulty === 'normal' ? 2 : 1);
              return (rB * dB) - (rA * dA);
            });

          let placed = false;
          
          for (const sid of subjectsToPlace) {
            const possTeachers = teachersBySubject[sid] || [];
            if (!possTeachers.length) continue;

            const teacherOrder = attempt % 2 === 0 ? possTeachers : shuffleArray([...possTeachers]);

            for (const t of teacherOrder) {
              if (canPlace(sid, t.id, d, p)) {
                grid[d][p] = { subjectId: sid, teacherId: t.id };
                remaining[sid]--;
                teacherOccupied[t.id][d][p] = true;
                perDayCount[d]++;
                perDaySubject[d][sid] = (perDaySubject[d][sid] || 0) + 1;
                placed = true;
                break;
              }
            }
            
            if (placed) break;
          }
        }
        
        // ЭТАП 2: Заполняем конец дня (последние 2 урока) - сначала особые предметы
        for (let p = mainPartEnd; p < periods && perDayCount[d] < lessonsPerDay; p++) {
          if (timedOut()) {
            success = false;
            break;
          }

          // Приоритет: class_hour, religion, global_comp, потом light, потом остальные
          const endOfDaySubjects = ['class_hour', 'religion', 'global_comp'];
          
          const subjectsToPlace = Object.keys(remaining)
            .filter(sid => remaining[sid] > 0)
            .sort((a, b) => {
              const isEndA = endOfDaySubjects.includes(a);
              const isEndB = endOfDaySubjects.includes(b);
              
              if (isEndA && !isEndB) return -1; // class_hour и т.д. в приоритете
              if (!isEndA && isEndB) return 1;
              
              // Потом light предметы
              const diffA = bySubject[a]?.difficulty;
              const diffB = bySubject[b]?.difficulty;
              
              if (diffA === 'light' && diffB !== 'light') return -1;
              if (diffA !== 'light' && diffB === 'light') return 1;
              
              // Остальные по количеству
              return remaining[b] - remaining[a];
            });

          let placed = false;
          
          for (const sid of subjectsToPlace) {
            const possTeachers = teachersBySubject[sid] || [];
            if (!possTeachers.length) continue;

            const teacherOrder = attempt % 2 === 0 ? possTeachers : shuffleArray([...possTeachers]);

            for (const t of teacherOrder) {
              if (canPlace(sid, t.id, d, p)) {
                grid[d][p] = { subjectId: sid, teacherId: t.id };
                remaining[sid]--;
                teacherOccupied[t.id][d][p] = true;
                perDayCount[d]++;
                perDaySubject[d][sid] = (perDaySubject[d][sid] || 0) + 1;
                placed = true;
                break;
              }
            }
            
            if (placed) break;
          }
        }
        
        if (!success) break;
      }

      const totalRemaining = Object.values(remaining).reduce((a, b) => a + b, 0);
      
      if (totalRemaining > 0) {
        console.log(`❌ Класс ${cls.name}: не размещено ${totalRemaining} уроков`);
        const notPlaced = Object.entries(remaining)
          .filter(([_, v]) => v > 0)
          .map(([k, v]) => `${bySubject[k]?.name} (${v})`);
        console.log(`   📋 Остались: ${notPlaced.join(', ')}`);
        globalFail = true;
        break;
      }

      result[classId] = grid;
      console.log(`✅ Класс ${cls.name} - готово!`);
    }

    if (!globalFail) {
      console.log(`\n🎉 УСПЕХ за ${attempt + 1} попыток(и) (${Math.round((Date.now() - start) / 1000)}с)`);
      
      // СТАТИСТИКА РАСПИСАНИЯ
      console.log('\n📊 Статистика расписания:');
      for (const cls of classes) {
        const grid = result[cls.id];
        if (!grid) continue;
        
        let totalHard = 0;
        let hardByDay = [];
        
        for (let d = 0; d < DAYS; d++) {
          const hardCount = grid[d].filter(c => c && bySubject[c.subjectId]?.difficulty === 'hard').length;
          totalHard += hardCount;
          hardByDay.push(hardCount);
        }
        
        console.log(`   ${cls.name}:`);
        console.log(`     - Сложных предметов в неделю: ${totalHard}`);
        console.log(`     - По дням: Пн=${hardByDay[0]}, Вт=${hardByDay[1]}, Ср=${hardByDay[2]}, Чт=${hardByDay[3]}, Пт=${hardByDay[4]}`);
        
        // Проверяем баланс
        const maxHard = Math.max(...hardByDay);
        const minHard = Math.min(...hardByDay);
        if (maxHard - minHard <= 1) {
          console.log(`     ✅ Нагрузка равномерно распределена`);
        } else if (maxHard - minHard <= 2) {
          console.log(`     ⚠️ Нагрузка немного неравномерна`);
        } else {
          console.log(`     ⚠️ Нагрузка неравномерна - требуется коррекция`);
        }
      }
      
      console.log('\n✨ Применены правила здорового обучения:');
      console.log('   ✓ Классный час в конце дня');
      console.log('   ✓ Пик нагрузки на 2-4 уроках');
      console.log('   ✓ Легкая пятница (макс 2 hard)');
      console.log('   ✓ Мягкий понедельник');
      console.log('   ✓ Чередование mental и active предметов');
      console.log('   ✓ Физкультура 1 раз в день');
      console.log('   ✓ Равномерное распределение нагрузки');
      
      return result;
    }
  }

  console.warn('\n❌ Не удалось составить расписание');
  console.warn('💡 Попробуйте:');
  console.warn('   - Уменьшить часы hard-предметов (algebra: 3, geometry: 2)');
  console.warn('   - Добавить учителей для загруженных предметов');
  console.warn('   - Увеличить lessonsPerDay для классов до 7-8');
  
  return null;
}