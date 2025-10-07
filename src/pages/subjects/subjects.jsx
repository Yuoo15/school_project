import React, { useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { initialData } from '../../data/initialData'
import styles from './subjects.module.css'
import Button from '../../components/Button/button'

export default function Subjects(){
    const [data, setData] = useLocalStorage('school:data', initialData)
    const [id, setId] = useState('')
    const [name, setName] = useState('')
    const [hours, setHours] = useState(1)
    const [diff, setDiff] = useState('normal')


    function addSubject(){
        if (!id.trim()||!name.trim()) return
        const next = {...data, subjects: [...data.subjects, { id, name, hoursPerWeek: Number(hours), difficulty: diff }]}
        setData(next)
        setId(''); setName(''); setHours(1)
    }


    function removeSubject(_id){ setData({...data, subjects: data.subjects.filter(s=>s.id!==_id)}) }


    return (
        <div className={styles.card}>
            <h2 style={{color: '#252B42'}}>Предметы</h2>
            <p className={styles.p}>3 этап - добавьте предметы</p>
            <div className={styles.next}><Button to="/schedule" text="Дальше"/></div>
            <div style={{display: 'flex', flexDirection:'column', gap: 15}}>
                <input className="input" placeholder="id (math)" value={id} onChange={e=>setId(e.target.value)} />
                <input className="input" placeholder="Название" value={name} onChange={e=>setName(e.target.value)} />
                <input className="input" placeholder="Сколько часов" type="number" min={1} value={hours} onChange={e=>setHours(e.target.value)} />
                <select className="input" value={diff} onChange={e=>setDiff(e.target.value)}>
                    <option value="light">Лёгкий</option>
                    <option value="normal">Нормальный</option>
                    <option value="hard">Тяжёлый</option>
                </select>
            <button className={styles.button} onClick={addSubject}>Добавить предмет</button>
        </div>


        <ul className={styles.ul}>
            {data.subjects.map(s=> (
                <li key={s.id} style={{marginTop:8}} className={styles.li}>
                    <b>{s.name}</b> ({s.id}) — {s.hoursPerWeek} ч/н — {s.difficulty}
                    <button className={styles.remove} onClick={()=>removeSubject(s.id)}>Удалить</button>
                </li>
            ))}
        </ul>
        </div>
)
}