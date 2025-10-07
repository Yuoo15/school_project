import React from 'react'
import styles from './home.module.css'
import Button from '../../components/Button/button'
import Button_green from '../../components/button_green/button_green'

export default function Home(){
return (
    <>
    <div className={styles.main}>
        <div className={styles.text}>
            <p className={styles.nad}>Алгоритм для составления расписания</p>
            <h1 className={styles.h1}>School<br /> scheduler</h1>
            <p className={styles.p}>Нажмите на кнопку что бы начать</p>
            <div className={styles.buttons}>
                <div className={styles.start}><Button to="/classes" text="Начать"/></div>
                <div className={styles.button}><Button_green to="/about" text="Узнать больше"/></div>
                </div>
            
        </div>
    </div>
    </>
)
}