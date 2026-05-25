import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store";
import { RegisterForm } from "./components/RegisterForm";
import styles from "./register-page.module.css";

export function RegisterPage() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className={styles.registerPageContainer}>
      <div className={styles.registerCard}>
        <RegisterForm />
      </div>
    </div>
  );
}
