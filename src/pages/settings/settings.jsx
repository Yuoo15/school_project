import React from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { initialData } from '../../data/initialData'
import styles from './settings.module.css'
import { useAuth } from '../../hooks/forlogun'
export default function Settings(){
const [data, setData] = useLocalStorage('school:data', initialData)
    const {logout} = useAuth()


    function setSetting(path, value){
        const next = {...data, settings: {...data.settings, [path]: value}}
        setData(next)
    }

    return (
    <div className={styles.card}>
        <h2 style={{color: '#252B42'}}>Настройки</h2>
            <label style={{color: '#252B42'}}>Дней в неделе: <input className="input" type="number" value={data.settings.days} onChange={e=>setSetting('days', Number(e.target.value))} /></label>
            <label style={{color: '#252B42'}}>Уроков в день: <input className="input" type="number" value={data.settings.periodsPerDay} onChange={e=>setSetting('periodsPerDay', Number(e.target.value))} /></label>
            <label style={{color: '#252B42'}}>Запрет подряд тяжёлых предметов:
            <input style={{marginRight: 10, marginBottom:10}} type="checkbox" checked={data.settings.noHeavyConsecutive} onChange={e=>setSetting('noHeavyConsecutive', e.target.checked)} />
            <button onClick={()=>logout()} className={styles.button}>Выйти</button>
        </label> 
    </div>
    )
}