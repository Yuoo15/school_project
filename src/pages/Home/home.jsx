import React from 'react'
import styles from './home.module.css'
import Button from '../../components/Button/button'
import Button_green from '../../components/button_green/button_green'
import { users } from '../../data/db'
import { useAuth } from '../../hooks/forlogun'  

export default function Home() {
  const { isAuth } = useAuth();
  const currentUser = users.find(u => u.name);
  const name = currentUser?.name

  return (
    <>
      <div className={styles.main}>
        <div className={styles.text}>
          <p className={styles.nad}>Добро пожаловать, {name}!</p>
          <h1 className={styles.h1}>School<br /> scheduler</h1>
          <p className={styles.p}>Нажмите на кнопку чтобы начать</p>
          <div className={styles.buttons}>
            <div className={styles.start}>
              <Button to="/classes" text="Начать" />
            </div>
            <div className={styles.button}>
              <Button_green to="/about" text="Узнать больше" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
