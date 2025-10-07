import React, { useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { initialData } from '../../data/initialData'
import styles from './classes.module.css'
import { v4 as uuidv4 } from 'uuid'
import Button from '../../components/Button/button'


export default function Classes(){
const [data, setData] = useLocalStorage('school:data', initialData)
const [name, setName] = useState('')


function addClass(){
    if (!name.trim()) return
    const id = name.replace(/\s+/g,'')
    const next = {...data, classes: [...data.classes, { id, name, students: 0 }]}
    setData(next)
    setName('')
}


function removeClass(id){
    const next = {...data, classes: data.classes.filter(c=>c.id!==id)}
    setData(next)
}


return (
    <div className={styles.card}>
        <h2 style={{color: '#252B42'}}>Классы</h2>
        <p className={styles.p}>1 этап - добавьте класс</p>
        <div className={styles.next}><Button to="/teachers" text="Дальше"/></div>
        <div style={{display:'flex',gap:8}}>
            <input className="input" placeholder="Например: 5А" value={name} onChange={e=>setName(e.target.value)} />
            <button className={styles.button} onClick={addClass}>Добавить</button>
        </div>


        <ul>
            {data.classes.map(c=> (
                <li key={c.id} style={{marginTop:8}}>
                    <b style={{color: '#252B42'}}>{c.name}</b> 
                    <button className={styles.remove} onClick={()=>removeClass(c.id)}>Удалить</button>
                </li>
            ))}
        </ul>
    </div>
)
}