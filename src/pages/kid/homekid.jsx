import React from 'react'
import { useAuth } from '../../hooks/forlogun'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { initialData } from '../../data/initialData'
import ScheduleGrid from '../../components/ScheduleGrid'
import { users } from '../../data/db'
import style from './kid.module.css'

export default function ScheduleKid() {
  const { isAuth, logout } = useAuth()
  const user = users.find(u => u.username === isAuth?.username)
  const name = user?.name || 'Гость'
  const lastname = user?.lastname || ''
  const isKid = isAuth?.status === 'kid'
  const [data] = useLocalStorage('school:data', initialData)

  if (!isKid) {
    return (
      <div className={style.denied}>
        <h2>Доступ запрещён</h2>
        <p>Эта страница доступна только для учеников</p>
        <button className={style.button} onClick={logout}>Вернуться</button>
      </div>
    )
  }

  const clsId = user?.clsId || null
  const studentClass = data.classes?.find((c) => c.id === clsId)
  
  const classmates = users.filter(u => 
    u.status === 'kid' && 
    u.clsId === user.clsId && 
    u.id !== user.id
  )

  return (
    <div className={style.container}>
      <div className={style.header}>
        <div className={style.profile}>
          <img src={user.avatar} alt={name} className={style.avatar} />
          <div className={style.userInfo}>
            <h1 className={style.name}>{name} {lastname}</h1>
            <p className={style.class}>Класс: {studentClass?.id || 'Не назначен'}</p>
            <button className={style.button} onClick={logout}>Выйти</button>
          </div>
        </div>

        <div className={style.stats}>
          <div className={style.stat}>
            <h3>Предметов</h3>
            <p>{data.subjects?.length || 0}</p>
          </div>
          <div className={style.stat}>
            <h3>Одноклассников</h3>
            <p>{classmates.length}</p>
          </div>
          <div className={style.stat}>
            <h3>Учителей</h3>
            <p>{data.teachers?.length || 0}</p>
          </div>
        </div>
      </div>

      {studentClass && (
        <div className={style.scheduleSection}>
          <h2 className={style.sectionTitle}>Ваше расписание</h2>
          <div className={style.scheduleContainer}>
            <ScheduleGrid
              key={studentClass.id}
              clsId={studentClass.id}
              schedule={data.schedule}
              setSchedule={null}
              subjects={data.subjects}
              teachers={data.teachers}
              settings={data.settings}
              isAdmin={false}
            />
          </div>
        </div>
      )}

      {classmates.length > 0 && (
        <div className={style.classmatesSection}>
          <h2 className={style.sectionTitle}>Ваши одноклассники</h2>
          <div className={style.classmatesGrid}>
            {classmates.map(mate => (
              <div key={mate.id} className={style.classmateCard}>
                <img src={mate.avatar} alt="" className={style.classmateAvatar} />
                <h3>{mate.name}</h3>
                <p>{mate.lastname}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}