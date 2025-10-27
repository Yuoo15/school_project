import React, { useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { initialData } from '../../data/initialData'
import styles from './settings.module.css'
import { useAuth } from '../../hooks/forlogun'
import { users } from '../../data/db'
 
export default function Settings(){
    const [data, setData] = useLocalStorage('school:data', initialData)
    const {isAuth, logout} = useAuth()
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('name')
    
    const user = users.find(u => u.username === isAuth?.username)
    const lastname = user?.lastname || ''
    const name = user?.name || 'Гость'
    const status = user?.status || 'guest'
    const photo = user?.avatar || ''
 
    function setSetting(path, value){
        const next = {...data, settings: {...data.settings, [path]: value}}
        setData(next)
    }
 
    // Берём учителей из данных (data.teachers / initialData.teachers)
    const teachersFromData = data?.teachers ?? initialData.teachers ?? []
    const stats = {
        total: users.length,
        students: users.filter(u => u.status === 'kid').length,
        teachers: teachersFromData.length,
        parents: users.filter(u => u.status === 'parent').length
    }
 
     const filteredUsers = users
         .sort((a, b) => {
             if(sortBy === 'name') return a.name.localeCompare(b.name)
             if(sortBy === 'status') return a.status.localeCompare(b.status)
             if(sortBy === 'class') return (a.clsId || '').localeCompare(b.clsId || '')
             return 0
         })
         .filter(u => 
             u.name.toLowerCase().includes(search.toLowerCase()) ||
             u.lastname.toLowerCase().includes(search.toLowerCase())
         )
 
     return (
         <div className={styles.card}>
            <h2 style={{color: '#252B42'}}>Профиль</h2>

            <div className={styles.profile}>
                <div className={styles.userinfo}>
                    <div>
                        <img src={photo} alt={`${name} avatar`} className={styles.photo} />
                    </div>

                    <div className={styles.info}>
                        <h1 className={styles.h1}>Имя: {name}</h1>
                        <h1 className={styles.h1}>Фамилия: {lastname}</h1>
                        <h1 className={styles.h1}>Статус: {status}</h1>
                        <button onClick={()=>logout()} className={styles.button}>Выйти</button>
                    </div>
                </div>

                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <h3>Всего</h3>
                        <p>{stats.total}</p>
                    </div>
                    <div className={styles.stat}>
                        <h3>Учеников</h3>
                        <p>{stats.students}</p>
                    </div>
                    <div className={styles.stat}>
                        <h3>Учителей</h3>
                        <p>{stats.teachers}</p>
                    </div>
                    <div className={styles.stat}>
                        <h3>Родителей</h3>
                        <p>{stats.parents}</p>
                    </div>
                </div>
            </div>

            <div>
                <h1>Список участников школы</h1>
                
                <div className={styles.controls}>
                    <input 
                        type="search"
                        placeholder="Поиск по имени..."
                        className="input"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    
                    <select 
                        className="input" 
                        value={sortBy} 
                        onChange={e => setSortBy(e.target.value)}
                    >
                        <option value="name">По имени</option>
                        <option value="status">По статусу</option>
                        <option value="class">По классу</option>
                    </select>
                </div>

                <div className={styles.schoolinfo}>
                    <div className={styles.users}>
                        {filteredUsers.map(u => (
                            <div key={u.id} className={styles.usercard}>
                                <img src={u.avatar} alt={`${u.name} avatar`} className={styles.smallAvatar} />
                                <div className={styles.inf_user}>
                                    <h3 className={styles.username}>{u.name} {u.lastname}</h3>
                                    <p className={styles.user}>Логин: {u.username}</p>
                                    <p className={styles.user}>Пароль: {'•'.repeat(6)}</p>
                                    {u.clsId && <p className={styles.user}>Класс: {u.clsId}</p>}
                                    <p className={styles.user}>Статус: {u.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
 
            <h2 style={{color: '#252B42'}}>Учителя (из данных расписания)</h2>
            <div className={styles.teacherList}>
                {teachersFromData.map(t => (
                    <div key={t.id} className={styles.usercard}>
                        <div style={{padding: 8}}>
                            <h3 className={styles.username}>{t.name}</h3>
                            <p className={styles.user}>id: {t.id}</p>
                            <p className={styles.user}>Предметы: {(t.subjects || []).join(', ')}</p>
                        </div>
                    </div>
                ))}
            </div>
+
             <h2 style={{color: '#252B42'}}>Настройки</h2>
             <div className={styles.settings}>
                 <label style={{color: '#252B42'}}>
                     Уроков в день:&nbsp;
                     <input 
                         className="input" 
                         type="number" 
                         min="1"
                         max="12"
                         value={data.settings.periodsPerDay} 
                         onChange={e=>setSetting('periodsPerDay', Number(e.target.value))} 
                     />
                 </label>

                <button 
                    className={styles.button} 
                    onClick={()=>{
                        if(window.confirm('Вы уверены? Все данные будут сброшены.')) {
                            localStorage.clear()
                            alert('Данные сброшены.')
                            window.location.reload()
                        }
                    }}
                >
                    Сбросить значения до стандартных данных
                </button>
             </div>
         </div>
     )
 }