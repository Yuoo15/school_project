import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/forlogun";
import { users } from "../../data/db";
import { useState, useEffect } from "react";

export default ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { isAuth } = useAuth();

  useEffect(() => {
    const foundUser = users.find(
      u => u.username === isAuth?.username && u.password === isAuth?.password
    );
    setUser(foundUser || null);
    setLoading(false);
  }, [isAuth]);

  if (loading) return <div>Проверка доступа...</div>;

  if (user) {
    return <>{children}</>;
  } else {
    return <Navigate to="/login" state={{ from: location }} />;
  }
};
