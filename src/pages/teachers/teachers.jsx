import React, { useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { initialData } from '../../data/initialData'
import styles from './teachers.module.css'
import Button from '../../components/Button/button'

export default function Teachers(){
    const [data, setData] = useLocalStorage('school:data', initialData)
    const [name, setName] = useState('')
    const [subjectsInput, setSubjectsInput] = useState('')


    function addTeacher(){
        if (!name.trim()) return
        const subs = subjectsInput.split(',').map(s=>s.trim()).filter(Boolean)
        const id = 't'+Date.now()
        const next = {...data, teachers: [...data.teachers, { id, name, subjects: subs }]}
        setData(next)
        setName('')
        setSubjectsInput('')
    }


    function removeTeacher(id){ setData({...data, teachers: data.teachers.filter(t=>t.id!==id)}) }


    return (
        <div className={styles.card}>
            <h2 style={{color: '#252B42'}}>Учителя</h2>
            <p className={styles.p}>2 этап - добавьте учителей</p>
            <div className={styles.next}><Button to="/subjects" text="Дальше"/></div>
            <div style={{display: 'flex', flexDirection:'column', gap: 15}}>
                <input className="input" placeholder="ФИО" value={name} onChange={e=>setName(e.target.value)} />
                <input className="input" placeholder="id (math, rus)" value={subjectsInput} onChange={e=>setSubjectsInput(e.target.value)} />
            <button className={styles.button} onClick={addTeacher}>Добавить учителя</button>
        </div>


        <ul>
            {data.teachers.map(t=> (
                <li key={t.id} style={{marginTop:8}}>
                <b style={{color: '#252B42'}}>{t.name}</b> — {t.subjects.join(', ')}
                <button className={styles.remove} onClick={()=>removeTeacher(t.id)}>Удалить</button>
                </li>
            ))}
            </ul>
        </div>
    )
}