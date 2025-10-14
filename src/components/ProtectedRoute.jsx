import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/forlogun";

export default function ProtectedRoute({ children, role }) {
  const { isAuth } = useAuth();
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && isAuth.status !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
