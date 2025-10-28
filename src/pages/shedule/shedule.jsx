import React, { useState } from 'react'
import { useStorage } from '../../hooks/useStorage'
import { initialData } from '../../data/initialData'
import ScheduleGrid from '../../components/ScheduleGrid'
import { generateAllSchedulesBacktracking } from '../../utils/generator'
import styles from './shedule.module.css'
import { useAuth } from '../../hooks/forlogun'

export default function Schedule() {
  const { isAuth } = useAuth()
  const isAdmin = isAuth?.status === 'admin'
  const [data, setData, { loading }] = useStorage('school:data', initialData)
  const [error, setError] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [success, setSuccess] = useState(false)

  function setSchedule(schedule) {
    setData({ ...data, schedule })
  }

  function onGenerate() {
    setError(null)
    setSuccess(false)
    setGenerating(true)
    
    if (data.classes.length === 0) {
      setError('❌ Добавьте хотя бы один класс!')
      setGenerating(false)
      return
    }
    
    if (data.teachers.length === 0) {
      setError('❌ Добавьте хотя бы одного учителя!')
      setGenerating(false)
      return
    }
    
    if (data.subjects.length === 0) {
      setError('❌ Добавьте хотя бы один предмет!')
      setGenerating(false)
      return
    }

    setTimeout(() => {
      try {
        console.log('Начинаем генерацию расписания...')
        
        const generated = generateAllSchedulesBacktracking({
          classes: data.classes,
          subjects: data.subjects,
          teachers: data.teachers,
          settings: data.settings,
        })
        
        if (!generated) {
          setError(
            '❌ Не удалось составить расписание.\n\n' +
            'Возможные причины:\n' +
            '• Недостаточно учителей для предметов\n' +
            '• Слишком много часов на день\n' +
            '• Конфликт в расписании учителей\n\n' +
            'Проверьте консоль для подробностей.'
          )
        } else {
          setSchedule(generated)
          setSuccess(true)
          setTimeout(() => setSuccess(false), 5000)
        }
      } catch (err) {
        console.error('Ошибка генерации:', err)
        setError('❌ Произошла ошибка при генерации расписания: ' + err.message)
      } finally {
        setGenerating(false)
      }
    }, 300)
  }

  if (loading) {
    return (
      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>⏳ Загрузка...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <h2>Генератор расписания</h2>
        <p style={{ lineHeight: 1.6, color: '#666' }}>
          Автоматическая генерация расписания с учётом всех правил и ограничений.
          Система учитывает сложность предметов, нагрузку учителей и оптимальное распределение по дням.
        </p>
        
        <div style={{ 
          marginTop: 20, 
          padding: 16, 
          background: '#f8f9fa', 
          borderRadius: 8,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12
        }}>
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>Классов</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#252B42' }}>
              {data.classes.length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>Учителей</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#252B42' }}>
              {data.teachers.length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>Предметов</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#252B42' }}>
              {data.subjects.length}
            </div>
          </div>
        </div>

        <button 
          className={styles.button} 
          onClick={onGenerate}
          disabled={generating}
          style={{ 
            marginTop: 20,
            opacity: generating ? 0.6 : 1,
            cursor: generating ? 'not-allowed' : 'pointer'
          }}
        >
          {generating ? 'Генерация...' : 'Сгенерировать расписание'}
        </button>

        {success && (
          <div style={{ 
            marginTop: 16, 
            padding: 16, 
            background: '#d4edda', 
            border: '2px solid #28a745',
            borderRadius: 8,
            color: '#155724'
          }}>
            <strong>✅ Расписание успешно сгенерировано!</strong>
            <p style={{ margin: '8px 0 0 0', fontSize: 14 }}>
              Проверьте таблицы ниже
            </p>
          </div>
        )}

        {error && (
          <div style={{ 
            marginTop: 16, 
            padding: 16, 
            background: '#f8d7da', 
            border: '2px solid #dc3545',
            borderRadius: 8,
            color: '#721c24'
          }}>
            <strong>Ошибка!</strong>
            <pre style={{ 
              margin: '8px 0 0 0', 
              fontSize: 13, 
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit'
            }}>
              {error}
            </pre>
          </div>
        )}
      </div>

      {data.classes.map((c) => (
        <ScheduleGrid
          key={c.id}
          clsId={c.id}
          schedule={data.schedule}
          setSchedule={isAdmin ? setSchedule : null}
          subjects={data.subjects}
          teachers={data.teachers}
          settings={data.settings}
          isAdmin={isAdmin}
        />
      ))}
      
      {data.classes.length === 0 && (
        <div className={styles.card}>
          <h3>📭 Нет классов</h3>
          <p>Сначала добавьте классы на <a href="/classes">странице классов</a></p>
        </div>
      )}
    </div>
  )
}