import React from 'react'
import { useAuth } from '../../hooks/forlogun'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { initialData } from '../../data/initialData'
import ScheduleGrid from '../../components/ScheduleGrid'
import { users } from '../../data/db'

export default function ScheduleKid() {
  const { isAuth, logout } = useAuth()
  const user = users.find(u => u.username === isAuth?.username)
  const name = user?.name || 'Гость'
  const isKid = isAuth?.status === 'kid'
  const [data] = useLocalStorage('school:data', initialData)

  if (!isKid) {
    return <div>Доступ запрещён</div>
  }

  return (
    <div>
      <h1>Расписание для ученика</h1>
      <p>Здраствуйте, {name}!</p>
      <button onClick={() => logout(() => {})}>Выйти</button>
      {data.classes.map((c) => (
        <ScheduleGrid
          key={c.id}
          clsId={c.id}
          schedule={data.schedule}
          setSchedule={null}
          subjects={data.subjects}
          teachers={data.teachers}
          settings={data.settings}
          isAdmin={false}
        />
      ))}
    </div>
  )
}
