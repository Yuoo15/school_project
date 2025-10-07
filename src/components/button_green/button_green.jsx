import { Link } from 'react-router-dom'
import styles from './button_green.module.css'
export default(props)=>{
    return(
        <>
        <button className={styles.button}><Link className={styles.link} to={props.to}>{props.text}</Link></button>
        </>
    )
}