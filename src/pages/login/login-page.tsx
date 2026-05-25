import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store";
import { LoginForm } from "./components/LoginForm";
import styles from "./login-page.module.css";

export function LoginPage() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className={styles.loginPageContainer}>
      <div className={styles.loginCard}>
        <LoginForm from={from} />
      </div>
    </div>
  );
}
