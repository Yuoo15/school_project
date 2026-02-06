import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/forlogun";
import { users } from "../../data/db";
import { useForm } from "react-hook-form";
import styles from "./login.module.css";

export default () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const fromPage = location.state?.from?.pathname || "/";
  // Добавляем стандартные значения
  const { register, handleSubmit, formState } = useForm({
    mode: "onChange",
    defaultValues: {
      username: "admin",
      password: "admin123"
    }
  });
  
  const handler = (data) => {
    const { username, password } = data;
    const found = users.find(
      u => u.username === username && u.password === password
    );
    if (found) {
      login(found, () => {
        if (found.status === "admin") {
          navigate("/", { replace: true });
        } else if (found.status === "teacher") {
          navigate("/teacher-schedule", { replace: true });
        } else if (found.status === "kid") {
          navigate("/kid", { replace: true });
        } else if (found.status === "parent") {
          navigate("/kid", { replace: true });
        } else if (found.status === "guest") {
          navigate("/kid", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      });
    } else {
      alert("Неверный логин или пароль");
    }
  };
  
  const nameError = formState.errors.username?.message;
  const passError = formState.errors.password?.message;
  
  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.h1}>School scheduler</h1>
      </header>
      <div className={styles.container}>
        <h1 className={styles.h1}>Вход</h1>
        <form onSubmit={handleSubmit(handler)} className={styles.form}>
          <input
            className={styles.input}
            type="text"
            placeholder="Введите логин"
            {...register("username", {
              required: "Введите логин",
              minLength: {
                value: 3,
                message: "Минимум 3 символа"
              },
              pattern: {
                value: /^[A-Za-z]+$/i,
                message: "Только английские буквы"
              }
            })}
          />
          {nameError && <p className={styles.error}>{nameError}</p>}
          <input
            className={styles.input}
            type="password"
            placeholder="Введите пароль"
            {...register("password", {
              required: "Введите пароль",
              minLength: {
                value: 5,
                message: "Минимум 5 символов"
              },
              pattern: {
                value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
                message: "Пароль должен содержать буквы и цифры"
              }
            })}
          />
          {passError && <p className={styles.error}>{passError}</p>}
          <button className={styles.button} type="submit">Войти</button>
        </form>
        <a href="https://wa.me/77006540387?text=Здраствуйте%2C%20у%20меня%20проблемы%20со%20входом%20в%20систему">Проблемы со входом в систему?</a>
      </div>
      <footer className={styles.footer}>
        <div className={styles.footer_content}>
          <p>© {new Date().getFullYear()} Разработка сайта - <b>Кантаев Р.A.</b></p>
          <p>Проект для школы им. М. Горького</p>
          <p>Все права защищены</p>
        </div>
      </footer>
    </>
  );
};