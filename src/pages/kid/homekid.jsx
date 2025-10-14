import React from 'react'
import { useAuth } from '../../hooks/forlogun'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { initialData } from '../../data/initialData'
import ScheduleGrid from '../../components/ScheduleGrid'

export default function ScheduleKid() {
  const { isAuth } = useAuth()
  const isKid = isAuth?.status === 'kid'
  const [data] = useLocalStorage('school:data', initialData)

  if (!isKid) {
    return <div>Доступ запрещён</div>
  }

  return (
    <div>
      <h1>Расписание для ученика</h1>
      {data.classes.map((c) => (
        <ScheduleGrid
          key={c.id}
          clsId={c.id}
          schedule={data.schedule}
          setSchedule={null} // запрещаем редактировать
          subjects={data.subjects}
          teachers={data.teachers}
          settings={data.settings}
          isAdmin={false}
        />
      ))}
    </div>
  )
}
