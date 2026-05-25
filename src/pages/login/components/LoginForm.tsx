import {
  AlertCircleIcon,
  FileSpreadsheetIcon,
  LockIcon,
  MailIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  FieldError,
  FieldGroup,
  FieldInput,
  FieldLabel,
} from "@/components/ui/field";
import { useLoginForm } from "../hooks/useLoginForm";
import styles from "../login-page.module.css";

type LoginFormProps = {
  from: string;
};

export function LoginForm({ from }: LoginFormProps) {
  const { formState, errors, loading, handleChange, handleSubmit } =
    useLoginForm(from);

  return (
    <div className={styles.loginCardInner}>
      <div className={styles.loginHeader}>
        <div className={styles.loginLogoWrapper}>
          <FileSpreadsheetIcon size={24} />
        </div>
        <h1 className={styles.loginTitle}>Вход в систему</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.loginForm} noValidate>
        {errors.form && (
          <div className={styles.loginErrorAlert} role="alert">
            <AlertCircleIcon size={18} className={styles.loginErrorAlertIcon} />
            <span>{errors.form}</span>
          </div>
        )}

        <FieldGroup>
          <FieldLabel htmlFor="email-input">Электронная почта</FieldLabel>
          <FieldInput
            id="email-input"
            type="email"
            icon={MailIcon}
            placeholder="email@example.com"
            value={formState.email}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={loading}
            autoComplete="email"
            error={!!errors.email}
            required
          />
          {errors.email && (
            <FieldError>
              <AlertCircleIcon size={12} />
              {errors.email}
            </FieldError>
          )}
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="password-input">Пароль</FieldLabel>
          <FieldInput
            id="password-input"
            type="password"
            icon={LockIcon}
            placeholder="••••••••"
            value={formState.password}
            onChange={(e) => handleChange("password", e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            error={!!errors.password}
            required
          />
          {errors.password && (
            <FieldError>
              <AlertCircleIcon size={12} />
              {errors.password}
            </FieldError>
          )}
        </FieldGroup>

        <div className={styles.demoInfoCard}>
          <div className={styles.demoInfoTitle}>Демонстрационные аккаунты:</div>
          <div className={styles.demoInfoItem}>
            <strong>Михаил:</strong> michael@example.com / password123
          </div>
          <div>
            <strong>Роман:</strong> roman@example.com / password123
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className={styles.btnSubmitLogin}
          disabled={loading}
        >
          {loading ? (
            <>
              <LoadingSpinner size={18} className={styles.loginSpinner} />
              Выполняется вход...
            </>
          ) : (
            "Войти"
          )}
        </Button>

        <div className={styles.loginFooterLink}>
          <span>Нет аккаунта? </span>
          <Link to="/register" className={styles.authLink}>
            Зарегистрироваться
          </Link>
        </div>
      </form>
    </div>
  );
}
