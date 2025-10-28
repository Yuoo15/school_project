import React, { useState } from 'react'
import { useStorage } from '../../hooks/useStorage'
import { initialData } from '../../data/initialData'
import styles from './classes.module.css'
import Button from '../../components/Button/button'

export default function Classes() {
  const [data, setData, { loading, error }] = useStorage('school:data', initialData)
  const [name, setName] = useState('')
  const [lessonsPerDay, setLessonsPerDay] = useState(7)
  const [editingId, setEditingId] = useState(null)

  function addClass() {
    if (!name.trim()) {
      alert('❌ Введите название класса')
      return
    }

    const id = name.replace(/\s/g, '')
    
    if (data.classes.some(c => c.id === id)) {
      alert('❌ Класс с таким названием уже существует')
      return
    }

    const next = {
      ...data,
      classes: [...data.classes, { id, name, lessonsPerDay: Number(lessonsPerDay) }]
    }
    setData(next)
    setName('')
    setLessonsPerDay(7)
    alert('✅ Класс добавлен!')
  }

  function removeClass(id) {
    if (!confirm('❓ Удалить класс? Это также удалит его расписание.')) return
    
    const newSchedule = { ...data.schedule }
    delete newSchedule[id]
    
    const next = {
      ...data,
      classes: data.classes.filter(c => c.id !== id),
      schedule: newSchedule
    }
    setData(next)
    alert('✅ Класс удален')
  }

  function updateClass(id) {
    if (!name.trim()) {
      alert('❌ Введите название класса')
      return
    }

    const next = {
      ...data,
      classes: data.classes.map(c =>
        c.id === id ? { ...c, name, lessonsPerDay: Number(lessonsPerDay) } : c
      )
    }
    setData(next)
    setEditingId(null)
    setName('')
    setLessonsPerDay(7)
    alert('✅ Класс обновлен!')
  }

  function startEdit(cls) {
    setEditingId(cls.id)
    setName(cls.name)
    setLessonsPerDay(cls.lessonsPerDay || 7)
  }

  function cancelEdit() {
    setEditingId(null)
    setName('')
    setLessonsPerDay(7)
  }

  if (loading) {
    return (
      <div className={styles.card}>
        <h2>⏳ Загрузка...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.card}>
        <h2>❌ Ошибка загрузки данных</h2>
        <p>{error.message}</p>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <h2 style={{ color: '#252B42' }}>🎓 Управление классами</h2>
      <p className={styles.p}>Шаг 1 - добавьте классы вашей школы</p>
      <div className={styles.next}>
        <Button to="/teachers" text="Дальше →" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginTop: 20 }}>
        <input
          className="input"
          placeholder="Название класса (например: 11А, 7Б, 9В)"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ flex: 1 }}>
            <span style={{ display: 'block', marginBottom: 8, color: '#252B42', fontWeight: 500 }}>
              Уроков в день:
            </span>
            <input
              className="input"
              type="number"
              min={5}
              max={8}
              value={lessonsPerDay}
              onChange={e => setLessonsPerDay(e.target.value)}
            />
          </label>
        </div>
          <button className={styles.button} onClick={addClass}>
            Добавить класс
          </button>
        
      </div>

      <div style={{ marginTop: 30 }}>
        <h3 style={{ color: '#252B42' }}>📋 Список классов ({data.classes.length})</h3>
        {data.classes.length === 0 ? (
          <p style={{ color: '#999', fontStyle: 'italic' }}>Пока нет классов. Добавьте первый!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {data.classes.map(c => (
              <li key={c.id} style={{ 
                marginTop: 12, 
                padding: 12, 
                background: '#f8f9fa', 
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <b style={{ color: '#252B42', fontSize: 16 }}>{c.name}</b>
                  <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: 14 }}>
                    📚 {c.lessonsPerDay || 7} уроков в день
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className={styles.remove}
                    onClick={() => removeClass(c.id)}
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>


    </div>
  )
}