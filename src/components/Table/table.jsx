import React from "react";
import styles from './table.module.css'
export default()=>{
    return(
        <>
            <table border="1" className={styles.table}>
                <caption style={{margin: 10}}>Таблица ранжирования предметов по трудности</caption>
                <tr bgcolor="#96BB7C" style={{color:'white'}}>
                    <th>№</th>
                    <th>Предмет</th>
                    <th>Количество баллов</th>
                </tr>
                <tr>
                    <td>1</td>
                    <td>Математика, русский язык (для школ с казахским языком обучения),<br /> казахский язык (для школ с неказахским языком обучения)</td>
                    <td>11</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>Иностранный язык, изучение предметов на иностранном языке</td>
                    <td>10</td>
                </tr>
                <tr>
                    <td>3</td>
                    <td>Физика, химия, информатика, биология</td>
                    <td>9</td>
                </tr>
                <tr>
                    <td>4</td>
                    <td>История, Человек, Общество, Право</td>
                    <td>8</td>
                </tr>
                <tr>
                    <td>5</td>
                    <td>Казахский язык, литература (для школ с казахским языком обучения),<br /> Русский язык, литература (для школ с неказахским языком обучения)</td>
                    <td>7</td>
                </tr>
                <tr>
                    <td>6</td>
                    <td>Естествознание, география, самопознание, НВП</td>
                    <td>6</td>
                </tr>
                <tr>
                    <td>7</td>
                    <td>Физкультура</td>
                    <td>5</td>
                </tr>
                <tr>
                    <td>8</td>
                    <td>Труд, технология</td>
                    <td>4</td>
                </tr>
                <tr>
                    <td>9</td>
                    <td>Чертение</td>
                    <td>3</td>
                </tr>
                <tr>
                    <td>10</td>
                    <td>ИЗО</td>
                    <td>2</td>
                </tr>
                <tr>
                    <td>11</td>
                    <td>Музыка</td>
                    <td>1</td>
                </tr>
</table>
        </>
    )
}