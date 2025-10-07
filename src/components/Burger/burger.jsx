import styles from './burger.module.css'
import React, { useState } from 'react';
import {NavLink} from 'react-router-dom'

export default function BurgerMenu() {
    const [open, setOpen] = useState(false);
    return (
    <div className={styles.burgerContainer}>
    <div
    className={`${styles.burgerIcon} ${open ? styles.open : ''}`}
    onClick={() => setOpen(!open)}
    >
    <span></span>
    <span></span>
    <span></span>
</div>

    <nav className={`${styles.burgerMenu} ${open ? styles.active : ''}`}>
        <ul className={styles.nav}>
            <li className={styles.nav__item}><NavLink style={({isActive})=>isActive ? {fontWeight: "bold", color: '#96BB7C'} : {}} className={styles.link} to="/">Home</NavLink></li>
            <li className={styles.nav__item}><NavLink style={({isActive})=>isActive ? {fontWeight: "bold", color: '#96BB7C'} : {}} className={styles.link} to="classes">Классы</NavLink></li>
            <li className={styles.nav__item}><NavLink style={({isActive})=>isActive ? {fontWeight: "bold", color: '#96BB7C'} : {}} className={styles.link} to="teachers">Учителя</NavLink></li>
            <li className={styles.nav__item}><NavLink style={({isActive})=>isActive ? {fontWeight: "bold", color: '#96BB7C'} : {}} className={styles.link} to="subjects">Предметы</NavLink></li>
            <li className={styles.nav__item}><NavLink style={({isActive})=>isActive ? {fontWeight: "bold", color: '#96BB7C'} : {}} className={styles.link} to="schedule">Расписание</NavLink></li>
            <li className={styles.nav__item}><NavLink style={({isActive})=>isActive ? {fontWeight: "bold", color: '#96BB7C'} : {}} className={styles.link} to="settings">Настройки</NavLink></li>
        </ul>
    </nav>
</div>
);

}