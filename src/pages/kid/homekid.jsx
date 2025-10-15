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
  const isKid = isAuth?.status === 'kid'
  const [data] = useLocalStorage('school:data', initialData)

  if (!isKid) {
    return <div>Доступ запрещён</div>
  }

  const clsId = user?.clsId || null
  const studentClass = data.classes.find((c) => c.id === clsId)

  return (
    <div className={style.container}>
      <h1 className={style.h1}>Расписание для ученика</h1>
      <p className={style.p}>Здравствуйте, {name}!</p>
      <p className={style.p}>Ваш класс: {studentClass?.id || 'не найден'}</p>

      <button className={style.button} onClick={() => logout(() => {})}>Выйти</button>

      {studentClass && (
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
      )}
    </div>
  )
}