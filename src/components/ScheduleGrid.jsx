import React from "react";
import { useParams } from "react-router-dom";

export default function ScheduleGrid({
  clsId: propClsId,
  schedule: scheduleProp,
  setSchedule,
  subjects = [],
  teachers = [],
  settings = {},
  isAdmin = true, // добавляем пропс для проверки прав
}) {
  const params = useParams();
  const clsId = propClsId || params.clsId || null;

  const days = Number(settings?.days ?? 5);
  const periods = Number(settings?.periodsPerDay ?? 6);

  const safeSchedule = scheduleProp && typeof scheduleProp === "object" ? scheduleProp : {};

  // пустая сетка
  const makeEmptyGrid = () =>
    Array.from({ length: days }, () => Array.from({ length: periods }, () => null));

  const grid = Array.isArray(safeSchedule[clsId]) ? safeSchedule[clsId] : makeEmptyGrid();

  const teacherMap = Object.fromEntries((teachers || []).map((t) => [t.id, t]));

  function updateCell(dayIdx, periodIdx, newValue) {
    if (!isAdmin) return;

    const newSchedule = { ...safeSchedule };

    if (!Array.isArray(newSchedule[clsId])) {
      newSchedule[clsId] = makeEmptyGrid();
    } else {
      newSchedule[clsId] = newSchedule[clsId].map((row) => Array.from(row));
    }

    newSchedule[clsId][dayIdx][periodIdx] = newValue;

    if (typeof setSchedule === "function") {
      try {
        setSchedule(newSchedule);
      } catch (err) {
        console.error("Ошибка при setSchedule:", err);
      }
    } else {
      console.error("setSchedule не функция:", setSchedule);
    }
  }

  if (!clsId) {
    return (
      <div className="card">
        <h3>Расписание</h3>
        <p>Класс не выбран — передайте prop <b>clsId</b> или используйте маршрут с параметром.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Расписание — класс {clsId}</h3>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>День / Урок</th>
              {Array.from({ length: periods }).map((_, i) => (
                <th key={i}>{i + 1}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: days }).map((_, d) => (
              <tr key={d}>
                <th>День {d + 1}</th>

                {Array.from({ length: periods }).map((_, p) => {
                  const cell = (grid[d] && grid[d][p]) || null;
                  return (
                    <td key={p}>
                      <div>
                        <select
                          className="input"
                          value={cell?.subjectId ?? ""}
                          disabled={!isAdmin} // запрет редактирования для детей
                          onChange={(e) => {
                            if (!isAdmin) return;
                            const sid = e.target.value || null;
                            if (!sid) {
                              updateCell(d, p, null);
                              return;
                            }
                            const t = (teachers || []).find((t) => (t.subjects || []).includes(sid));
                            updateCell(d, p, { subjectId: sid, teacherId: t ? t.id : null });
                          }}
                        >
                          <option value="">—</option>
                          {(subjects || []).map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>

                        <div style={{ marginTop: 6, fontSize: 12, color: "#444" }}>
                          {cell?.teacherId ? (teacherMap[cell.teacherId]?.name ?? cell.teacherId) : ""}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
