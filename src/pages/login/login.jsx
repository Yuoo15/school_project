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

  const { register, handleSubmit, formState } = useForm({ mode: "onChange" });

  const handler = (data) => {
    const { username, password } = data;
    const found = users.find(
      u => u.username === username && u.password === password
    );
    if (found) {
      login(found, () => {
        navigate(found.status === "admin" ? "/" : "/kid", { replace: true });
      });
    } else {
      alert("Неверный логин или пароль");
    }
  };

  const nameError = formState.errors.username?.message;
  const passError = formState.errors.password?.message;

  return (
    <>
      <h1>Вход</h1>
      <form onSubmit={handleSubmit(handler)} className={styles.form}>
        <input
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

        <button type="submit">Войти</button>
      </form>
    </>
  );
};
