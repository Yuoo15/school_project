import React, { useState } from 'react'
import { useStorage } from '../../hooks/useStorage'
import { initialData } from '../../data/initialData'
import styles from './subjects.module.css'
import Button from '../../components/Button/button'
import Table from '../../components/Table/table'

export default function Subjects() {
  const [data, setData, { loading, error }] = useStorage('school:data', initialData)
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [hours, setHours] = useState(1)
  const [diff, setDiff] = useState('normal')
  const [editingId, setEditingId] = useState(null)

  function addSubject() {
    if (!id.trim() || !name.trim()) {
      alert('❌ Заполните все поля')
      return
    }

    if (data.subjects.some(s => s.id === id)) {
      alert('❌ Предмет с таким ID уже существует')
      return
    }

    const next = {
      ...data,
      subjects: [...data.subjects, { id, name, hoursPerWeek: Number(hours), difficulty: diff }]
    }
    setData(next)
    setId('')
    setName('')
    setHours(1)
    alert('✅ Предмет добавлен!')
  }

  function removeSubject(_id) {
    if (!confirm('❓ Удалить предмет?')) return
    
    const next = {
      ...data,
      subjects: data.subjects.filter(s => s.id !== _id)
    }
    setData(next)
    alert('✅ Предмет удален')
  }

  function updateSubject(_id) {
    if (!name.trim()) {
      alert('❌ Заполните название')
      return
    }

    const next = {
      ...data,
      subjects: data.subjects.map(s =>
        s.id === _id ? { ...s, name, hoursPerWeek: Number(hours), difficulty: diff } : s
      )
    }
    setData(next)
    setEditingId(null)
    setId('')
    setName('')
    setHours(1)
    alert('✅ Предмет обновлен!')
  }

  function startEdit(subject) {
    setEditingId(subject.id)
    setId(subject.id)
    setName(subject.name)
    setHours(subject.hoursPerWeek)
    setDiff(subject.difficulty)
  }

  function cancelEdit() {
    setEditingId(null)
    setId('')
    setName('')
    setHours(1)
    setDiff('normal')
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
      <h2 style={{ color: '#252B42' }}>📚 Управление предметами</h2>
      <p className={styles.p}>Шаг 3 - добавьте предметы и укажите нагрузку</p>
      <div className={styles.next}>
        <Button to="/schedule" text="Дальше →" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginTop: 20 }}>
        <input
          className="input"
          placeholder="ID предмета (например: math, rus, eng)"
          value={id}
          onChange={e => setId(e.target.value)}
          disabled={editingId !== null}
        />
        <input
          className="input"
          placeholder="Название предмета (например: Математика)"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <label style={{ flex: 1 }}>
            <span style={{ display: 'block', marginBottom: 8, color: '#252B42', fontWeight: 500 }}>
              Часов в неделю:
            </span>
            <input
              className="input"
              type="number"
              min={1}
              max={10}
              value={hours}
              onChange={e => setHours(e.target.value)}
            />
          </label>
          <label style={{ flex: 1 }}>
            <span style={{ display: 'block', marginBottom: 8, color: '#252B42', fontWeight: 500 }}>
              Сложность:
            </span>
            <select className="input" value={diff} onChange={e => setDiff(e.target.value)}>
              <option value="light">Лёгкий</option>
              <option value="normal">Нормальный</option>
              <option value="hard">Тяжёлый</option>
            </select>
          </label>
        </div>

        {editingId ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className={styles.button}
              onClick={() => updateSubject(editingId)}
            >
              💾 Сохранить изменения
            </button>
            <button
              className={styles.remove}
              onClick={cancelEdit}
            >
              ❌ Отмена
            </button>
          </div>
        ) : (
          <button className={styles.button} onClick={addSubject}>
            Добавить предмет
          </button>
        )}
      </div>

      <div style={{ marginTop: 30 }}>
        <h3 style={{ color: '#252B42' }}>📋 Список предметов ({data.subjects.length})</h3>
        {data.subjects.length === 0 ? (
          <p style={{ color: '#999', fontStyle: 'italic' }}>Пока нет предметов. Добавьте первый!</p>
        ) : (
          <ul className={styles.ul} style={{ listStyle: 'none', padding: 0 }}>
            {data.subjects.map(s => (
              <li key={s.id} style={{ 
                marginTop: 12, 
                padding: 12, 
                background: '#f8f9fa', 
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }} className={styles.li}>
                <div>
                  <b style={{ color: '#252B42', fontSize: 16 }}>{s.name}</b>
                  <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: 14 }}>
                    <code style={{ 
                      background: '#e3f2fd', 
                      padding: '2px 6px', 
                      borderRadius: 4,
                      fontSize: 12
                    }}>
                      {s.id}
                    </code>
                    {' '}— {s.hoursPerWeek} ч/н — {
                      s.difficulty === 'hard' ? 'Тяжёлый' :
                      s.difficulty === 'light' ? 'Лёгкий' :
                      'Нормальный'
                    }
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className={styles.button}
                    onClick={() => startEdit(s)}
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                  >
                    Изменить
                  </button>
                  <button
                    className={styles.remove}
                    onClick={() => removeSubject(s.id)}
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

      {data.subjects.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30 }}>
          <Table />
        </div>
      )}
    </div>
  )
}