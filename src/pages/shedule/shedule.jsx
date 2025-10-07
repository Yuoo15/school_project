import React, { useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { initialData } from '../../data/initialData'
import ScheduleGrid from '../../components/ScheduleGrid'
import { generateAllSchedulesBacktracking } from '../../utils/generator'
import styles from './shedule.module.css'

export default function Schedule() {
  const [data, setData] = useLocalStorage('school:data', initialData)
  const [error, setError] = useState(null)

  function setSchedule(schedule) {
    setData({ ...data, schedule })
  }

  function onGenerate() {
    setError(null)
    const generated = generateAllSchedulesBacktracking({
      classes: data.classes,
      subjects: data.subjects,
      teachers: data.teachers,
      settings: data.settings,
    })
    if (!generated) {
      setError('❌ Не удалось составить расписание. Попробуйте изменить настройки или данные.')
    } else {
      setSchedule(generated)
    }
  }

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <h2>Генератор расписания</h2>
        <p>
          Нажмите «Сгенерировать», чтобы автоматически заполнить сетки для всех классов (базовый алгоритм).
        </p>
        <button className={styles.button} onClick={onGenerate}>
          Сгенерировать
        </button>

        {error && <div className="error-message">{error}</div>}
      </div>

      {data.classes.map((c) => (
        <ScheduleGrid
          key={c.id}
          clsId={c.id}
          schedule={data.schedule}
          setSchedule={setSchedule}
          subjects={data.subjects}
          teachers={data.teachers}
          settings={data.settings}
        />
      ))}
    </div>
  )
}
