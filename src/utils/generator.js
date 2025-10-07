// src/utils/generator.js
// Backtracking generator compatible with the project data model:
// classes: [{id, name}], subjects: [{id,name,hoursPerWeek,difficulty}], teachers: [{id,name,subjects: [subjectId,...]}]
// settings: { days, periodsPerDay, maxLessonsPerDay, noHeavyConsecutive }
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateAllSchedulesBacktracking({ classes, subjects, teachers, settings, timeLimitMs = 5000, maxAttempts = 4 }) {
  const start = Date.now();
  const days = settings?.days ?? 5;
  const periods = settings?.periodsPerDay ?? 7;
  const maxLessonsPerDay = settings?.maxLessonsPerDay ?? periods;
  const noHeavyConsecutive = !!settings?.noHeavyConsecutive;

  // maps
  const bySubject = Object.fromEntries(subjects.map(s => [s.id, s]));
  const teacherMap = Object.fromEntries(teachers.map(t => [t.id, t]));

  // helper: timeout
  function timedOut() { return Date.now() - start > timeLimitMs; }

  // Try multiple attempts (to avoid bad locking order)
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (timedOut()) break;

    // teacher occupancy: teacherId -> days x periods boolean
    const teacherOccupied = {};
    teachers.forEach(t => {
      teacherOccupied[t.id] = Array.from({ length: days }, () => Array(periods).fill(false));
    });

    // decide order of classes for this attempt (shuffle except first attempt)
    const classOrder = attempt === 0 ? [...classes] : shuffleArray(classes);

    const result = {};
    let fail = false;

    // Solve class by class
    for (const cls of classOrder) {
      if (timedOut()) { fail = true; break; }

      // remaining hours for each subject for this class (use hoursPerWeek)
      const remaining = {};
      subjects.forEach(s => { remaining[s.id] = s.hoursPerWeek ?? 0 });

      // grid for this class
      const grid = Array.from({ length: days }, () => Array(periods).fill(null));
      const perDayCount = Array(days).fill(0);

      // positions list (sequential day->period)
      const positions = [];
      for (let d = 0; d < days; d++) for (let p = 0; p < periods; p++) positions.push([d, p]);

      // simple pruning: total required hours
      const totalRequired = Object.values(remaining).reduce((a,b)=>a+b,0);
      if (totalRequired === 0) {
        result[cls.id] = grid;
        continue;
      }

      // backtracking
      let solved = false;

      function canPlace(subId, teacherId, d, p) {
        if (remaining[subId] <= 0) return false;
        if (perDayCount[d] >= maxLessonsPerDay) return false;
        if (!teacherId) return false;
        if (!teacherMap[teacherId]) return false;
        if (!teacherMap[teacherId].subjects.includes(subId)) return false;
        if (teacherOccupied[teacherId][d][p]) return false;
        // no same subject twice in a row
        if (p > 0) {
          const prev = grid[d][p-1];
          if (prev && prev.subjectId === subId) return false;
          if (noHeavyConsecutive) {
            const prevDiff = bySubject[prev?.subjectId]?.difficulty;
            const curDiff = bySubject[subId]?.difficulty;
            if (prevDiff === 'hard' && curDiff === 'hard') return false;
          }
        }
        return true;
      }

      function backtrack(index) {
        if (timedOut()) return false;
        if (index === positions.length) return true;

        // quick feasibility prune:
        const slotsLeft = positions.length - index;
        const needLeft = Object.values(remaining).reduce((a,b)=>a+b,0);
        if (needLeft > slotsLeft) return false;

        const [d, p] = positions[index];

        // build candidate subjects sorted by largest remaining (heuristic)
        const subjectCandidates = Object.keys(remaining).filter(sid => remaining[sid] > 0)
          .sort((a,b) => remaining[b] - remaining[a]);

        for (const sid of subjectCandidates) {
          // possible teachers for this subject
          const possibleTeachers = teachers.filter(t => t.subjects.includes(sid));
          for (const t of possibleTeachers) {
            const tid = t.id;
            if (!canPlace(sid, tid, d, p)) continue;

            // place
            grid[d][p] = { subjectId: sid, teacherId: tid };
            remaining[sid] -= 1;
            teacherOccupied[tid][d][p] = true;
            perDayCount[d]++;

            if (backtrack(index + 1)) return true;

            // revert
            grid[d][p] = null;
            remaining[sid] += 1;
            teacherOccupied[tid][d][p] = false;
            perDayCount[d]--;
          }
        }

        // Optionally leave cell empty if there is room (only if feasible)
        const totalRemaining = Object.values(remaining).reduce((a,b)=>a+b,0);
        if (totalRemaining <= slotsLeft - 1) {
          // leave empty
          if (backtrack(index + 1)) return true;
        }

        return false;
      }

      solved = backtrack(0);

      if (!solved) {
        // fail this attempt (try different class order)
        fail = true;
        break;
      } else {
        // record grid and continue — teacherOccupied already updated
        result[cls.id] = grid;
      }
    } // end for classes

    if (!fail) {
      // success for this attempt
      return result;
    }
    // else try next attempt (re-initialize teacherOccupied)
  } // end attempts

  console.warn('generateAllSchedulesBacktracking: не удалось найти расписание в отведённое время или попытки.');
  return null;
}
