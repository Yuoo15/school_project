import React, { useState } from 'react'
import { useStorage } from '../../hooks/useStorage'
import { initialData } from '../../data/initialData'
import styles from './teachers.module.css'
import Button from '../../components/Button/button'

export default function Teachers() {
  const [data, setData, { loading, error }] = useStorage('school:data', initialData)
  const [name, setName] = useState('')
  const [subjectsInput, setSubjectsInput] = useState('')
  const [editingId, setEditingId] = useState(null)

  function addTeacher() {
    if (!name.trim()) {
      alert('❌ Введите ФИО учителя')
      return
    }
    
    const subs = subjectsInput.split(',').map(s => s.trim()).filter(Boolean)
    
    if (subs.length === 0) {
      alert('❌ Укажите хотя бы один предмет (через запятую)')
      return
    }

    const invalidSubjects = subs.filter(sid => !data.subjects.find(s => s.id === sid))
    if (invalidSubjects.length > 0) {
      alert(`❌ Неизвестные предметы: ${invalidSubjects.join(', ')}\n\nДоступные: ${data.subjects.map(s => s.id).join(', ')}`)
      return
    }

    const id = 't' + Date.now()
    const newTeacher = { id, name, subjects: subs }
    
    const next = {
      ...data,
      teachers: [...data.teachers, newTeacher]
    }
    
    setData(next)
    setName('')
    setSubjectsInput('')
    alert('✅ Учитель добавлен!')
  }

  function removeTeacher(id) {
    if (!confirm('❓ Удалить учителя? Это может повлиять на расписание.')) return
    
    const next = {
      ...data,
      teachers: data.teachers.filter(t => t.id !== id)
    }
    setData(next)
    alert('✅ Учитель удален')
  }

  function updateTeacher(id) {
    if (!name.trim()) {
      alert('❌ Введите ФИО учителя')
      return
    }

    const subs = subjectsInput.split(',').map(s => s.trim()).filter(Boolean)
    
    if (subs.length === 0) {
      alert('❌ Укажите хотя бы один предмет')
      return
    }

    // Проверяем, что все предметы существуют
    const invalidSubjects = subs.filter(sid => !data.subjects.find(s => s.id === sid))
    if (invalidSubjects.length > 0) {
      alert(`❌ Неизвестные предметы: ${invalidSubjects.join(', ')}\n\nДоступные: ${data.subjects.map(s => s.id).join(', ')}`)
      return
    }

    const next = {
      ...data,
      teachers: data.teachers.map(t => 
        t.id === id ? { ...t, name, subjects: subs } : t
      )
    }
    
    setData(next)
    setEditingId(null)
    setName('')
    setSubjectsInput('')
    alert('✅ Учитель обновлен!')
  }

  function startEdit(teacher) {
    setEditingId(teacher.id)
    setName(teacher.name)
    setSubjectsInput(teacher.subjects.join(', '))
  }

  function cancelEdit() {
    setEditingId(null)
    setName('')
    setSubjectsInput('')
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
      <h2 style={{ color: '#252B42' }}>👨‍🏫 Управление учителями</h2>
      <p className={styles.p}>Шаг 2 - добавьте учителей и укажите их предметы</p>
      <div className={styles.next}>
        <Button to="/subjects" text="Дальше →" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginTop: 20 }}>
        <input
          className="input"
          placeholder="ФИО учителя (например: Иванов И.И.)"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          className="input"
          placeholder="Предметы через запятую (algebra, rus, eng)"
          value={subjectsInput}
          onChange={e => setSubjectsInput(e.target.value)}
        />
        
        {editingId ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button 
              className={styles.button} 
              onClick={() => updateTeacher(editingId)}
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
          <button className={styles.button} onClick={addTeacher}>
            Добавить учителя
          </button>
        )}
      </div>

      <div style={{ marginTop: 30 }}>
        <h3 style={{ color: '#252B42' }}>📋 Список учителей ({data.teachers.length})</h3>
        {data.teachers.length === 0 ? (
          <p style={{ color: '#999', fontStyle: 'italic' }}>Пока нет учителей. Добавьте первого!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {data.teachers.map(t => (
              <li key={t.id} style={{ 
                marginTop: 12, 
                padding: 12, 
                background: '#f8f9fa', 
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <b style={{ color: '#252B42', fontSize: 16 }}>{t.name}</b>
                  <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: 14 }}>
                    📚 Предметы: {t.subjects.map(sid => {
                      const subj = data.subjects.find(s => s.id === sid)
                      return subj?.name || sid
                    }).join(', ')}
                  </p>
                  <p style={{ margin: '2px 0 0 0', color: '#999', fontSize: 12 }}>
                    ID: {t.id}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    className={styles.button} 
                    onClick={() => startEdit(t)}
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                  >
                    Изменить
                  </button>
                  <button 
                    className={styles.remove} 
                    onClick={() => removeTeacher(t.id)}
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