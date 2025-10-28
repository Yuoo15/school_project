import React, { useMemo } from 'react'
import { useStorage } from '../../hooks/useStorage'
import { initialData } from '../../data/initialData'
import { useAuth } from '../../hooks/forlogun'
import styles from './teacherSchedule.module.css'

export default function TeacherSchedule() {

  const { isAuth, logout } = useAuth()
  const [data, , { loading }] = useStorage('school:data', initialData)

  const currentTeacher = useMemo(() => {
    if (!isAuth || isAuth.status !== 'teacher') return null
    
    // Ищем учителя по имени и фамилии
    return data.teachers.find(t => {
      const fullName = `${isAuth.name} ${isAuth.lastname}`
      const teacherName = t.name.toLowerCase()
      const userLastname = isAuth.lastname.toLowerCase()
      const userFullName = fullName.toLowerCase()
      
      return teacherName.includes(userLastname) || 
             teacherName === userFullName ||
             t.name === fullName
    })
  }, [isAuth, data.teachers])

  const teacherSchedule = useMemo(() => {
    if (!currentTeacher || !data.schedule) return []

    const schedule = []
    const dayNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница']

    for (const [classId, grid] of Object.entries(data.schedule)) {
      if (!Array.isArray(grid)) continue

      const className = data.classes.find(c => c.id === classId)?.name || classId

      grid.forEach((day, dayIdx) => {
        if (!Array.isArray(day)) return

        day.forEach((cell, periodIdx) => {
          if (cell && cell.teacherId === currentTeacher.id) {
            const subject = data.subjects.find(s => s.id === cell.subjectId)

            schedule.push({
              day: dayIdx,
              dayName: dayNames[dayIdx] || `День ${dayIdx + 1}`,
              period: periodIdx + 1,
              className,
              classId,
              subjectName: subject?.name || cell.subjectId,
              subjectId: cell.subjectId
            })
          }
        })
      })
    }

    schedule.sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day
      return a.period - b.period
    })

    return schedule
  }, [currentTeacher, data.schedule, data.classes, data.subjects])


  const scheduleByDay = useMemo(() => {
    const grouped = {}
    teacherSchedule.forEach(lesson => {
      if (!grouped[lesson.dayName]) {
        grouped[lesson.dayName] = []
      }
      grouped[lesson.dayName].push(lesson)
    })
    return grouped
  }, [teacherSchedule])

  if (loading) {
    return (
      <div className={styles.card}>
        <h2>⏳ Загрузка...</h2>
      </div>
    )
  }

  if (!isAuth || isAuth.status !== 'teacher') {
    return (
      <div className={styles.card}>
        <h2>🚫 Доступ запрещен</h2>
        <p>Эта страница доступна только для учителей</p>
      </div>
    )
  }

  if (!currentTeacher) {
    return (
      <div className={styles.card}>
        <h2>👨‍🏫 Учитель не найден</h2>
        <p>Ваш профиль не привязан к учителю в системе расписания</p>
        <div style={{ 
          marginTop: 20, 
          padding: 20, 
          background: '#fff3cd', 
          borderRadius: 12,
          border: '2px solid #ffc107'
        }}>
          <p><strong>📋 Ваши данные в системе:</strong></p>
          <p>• Имя: <code>{isAuth.name}</code></p>
          <p>• Фамилия: <code>{isAuth.lastname}</code></p>
          <p>• Статус: <code>{isAuth.status}</code></p>
          
          <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid #ffc107' }} />
          
          <p style={{ marginBottom: 10 }}><strong>💡 Решение:</strong></p>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            Попросите администратора добавить учителя с именем:<br/>
            <code style={{ 
              background: '#fff', 
              padding: '4px 8px', 
              borderRadius: 4,
              display: 'inline-block',
              marginTop: 8
            }}>
              {isAuth.lastname} {isAuth.name.charAt(0)}.{isAuth.name.charAt(0)}.
            </code>
            <br/>или<br/>
            <code style={{ 
              background: '#fff', 
              padding: '4px 8px', 
              borderRadius: 4,
              display: 'inline-block',
              marginTop: 8
            }}>
              {isAuth.name} {isAuth.lastname}
            </code>
          </p>
        </div>
        
        <div style={{ marginTop: 20, padding: 15, background: '#e3f2fd', borderRadius: 8 }}>
          <p style={{ margin: 0, fontSize: 14 }}>
            <strong>📚 Учителя в системе:</strong>
          </p>
          {data.teachers.length === 0 ? (
            <p style={{ margin: '8px 0 0 0', color: '#999', fontStyle: 'italic' }}>
              Нет учителей в системе
            </p>
          ) : (
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
              {data.teachers.map(t => (
                <li key={t.id} style={{ fontSize: 13, marginTop: 4 }}>
                  {t.name} (ID: {t.id})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    )
  }

  const totalLessons = teacherSchedule.length
  const daysWithLessons = Object.keys(scheduleByDay).length
  const uniqueClasses = [...new Set(teacherSchedule.map(l => l.classId))].length

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>📅 Моё расписание</h1>
          <div className={styles.teacherInfo}>
            <h2>{currentTeacher.name}</h2>
            <button className={styles.button} style={{marginBlock: 10}} onClick={logout}>Выйти</button>
            <p className={styles.subjects}>
              📚 Предметы: {currentTeacher.subjects.map(sid => {
                const subj = data.subjects.find(s => s.id === sid)
                return subj?.name || sid
              }).join(', ')}
            </p>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{totalLessons}</div>
            <div className={styles.statLabel}>Уроков в неделю</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{daysWithLessons}</div>
            <div className={styles.statLabel}>Рабочих дней</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{uniqueClasses}</div>
            <div className={styles.statLabel}>Классов</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{currentTeacher.subjects.length}</div>
            <div className={styles.statLabel}>Предметов</div>
          </div>
        </div>

        {teacherSchedule.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>📭 Расписание пока не составлено</h3>
            <p>Администратор должен сгенерировать расписание на странице "Расписание"</p>
          </div>
        ) : (
          <div className={styles.scheduleGrid}>
            {Object.entries(scheduleByDay).map(([dayName, lessons]) => (
              <div key={dayName} className={styles.dayCard}>
                <h3 className={styles.dayTitle}>{dayName}</h3>
                <div className={styles.lessonsList}>
                  {lessons.map((lesson, idx) => (
                    <div key={idx} className={styles.lessonCard}>
                      <div className={styles.lessonPeriod}>{lesson.period}</div>
                      <div className={styles.lessonDetails}>
                        <div className={styles.lessonSubject}>{lesson.subjectName}</div>
                        <div className={styles.lessonClass}>🎓 {lesson.className}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {teacherSchedule.length > 0 && (
        <div className={styles.card}>
          <h3>📊 Детальное расписание</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>День</th>
                  <th>Урок</th>
                  <th>Предмет</th>
                  <th>Класс</th>
                </tr>
              </thead>
              <tbody>
                {teacherSchedule.map((lesson, idx) => (
                  <tr key={idx}>
                    <td>{lesson.dayName}</td>
                    <td>{lesson.period}</td>
                    <td>{lesson.subjectName}</td>
                    <td>{lesson.className}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}