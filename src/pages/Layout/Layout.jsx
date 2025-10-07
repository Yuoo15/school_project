import { NavLink, Outlet } from "react-router-dom"
import styles from './Layout.module.css'
import Button from "../../components/Button/button"
import BurgerMenu from "../../components/Burger/burger"
import { useEffect, useState } from "react"

export default()=>{
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return(
        <>
            <header>
                <h1 className={styles.h1}>SS</h1>
                <nav className={styles.nav}>
                    <NavLink className={styles.link} to="/">Home</NavLink>
                    <NavLink className={styles.link} to="classes">Классы</NavLink>
                    <NavLink className={styles.link} to="teachers">Учителя</NavLink>
                    <NavLink className={styles.link} to="subjects">Предметы</NavLink>
                    <NavLink className={styles.link} to="schedule">Расписание</NavLink>
                    <NavLink className={styles.link} to="settings">Настройки</NavLink>
                </nav>
                <span className={styles.button}><Button text="О проекте"/></span>
                {windowWidth <= 550 && <BurgerMenu />}
            </header>
            <main>
                <Outlet />
            </main>
            <footer className={styles.footer}>
            <div className={styles.footer_content}>
                <p>© {new Date().getFullYear()} Общеобразовательная школа имени <b>М. Горького</b></p>
                <p>Все права защищены</p>
            </div>
            </footer>
        </>
    )
}