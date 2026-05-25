import {
  AlertCircleIcon,
  FileSpreadsheetIcon,
  LockIcon,
  MailIcon,
  UserIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/button";
import {
  FieldError,
  FieldGroup,
  FieldInput,
  FieldLabel,
} from "@/components/field";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useRegisterForm } from "../hooks/useRegisterForm";
import styles from "../RegisterPage.module.css";

export function RegisterForm() {
  const { formState, errors, loading, handleChange, handleSubmit } =
    useRegisterForm();

  return (
    <div className={styles.registerCardInner}>
      <div className={styles.registerHeader}>
        <div className={styles.registerLogoWrapper}>
          <FileSpreadsheetIcon size={24} />
        </div>
        <h1 className={styles.registerTitle}>Регистрация</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.registerForm} noValidate>
        {errors.form && (
          <div className={styles.registerErrorAlert} role="alert">
            <AlertCircleIcon
              size={18}
              className={styles.registerErrorAlertIcon}
            />
            <span>{errors.form}</span>
          </div>
        )}

        <FieldGroup>
          <FieldLabel htmlFor="name-input">Имя</FieldLabel>
          <FieldInput
            id="name-input"
            type="text"
            icon={UserIcon}
            placeholder="Иван"
            value={formState.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={loading}
            autoComplete="name"
            error={!!errors.name}
            required
          />
          {errors.name && (
            <FieldError className="flex items-center gap-2">
              <AlertCircleIcon size={12} />
              {errors.name}
            </FieldError>
          )}
        </FieldGroup>

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
            <FieldError className="flex items-center gap-2">
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
            placeholder="Минимум 8 символов"
            value={formState.password}
            onChange={(e) => handleChange("password", e.target.value)}
            disabled={loading}
            autoComplete="new-password"
            error={!!errors.password}
            required
          />
          {errors.password && (
            <FieldError className="flex items-center gap-2">
              <AlertCircleIcon size={12} />
              {errors.password}
            </FieldError>
          )}
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="confirm-password-input">
            Подтверждение пароля
          </FieldLabel>
          <FieldInput
            id="confirm-password-input"
            type="password"
            icon={LockIcon}
            placeholder="Повторите пароль"
            value={formState.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            disabled={loading}
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            required
          />
          {errors.confirmPassword && (
            <FieldError className="flex items-center gap-2">
              <AlertCircleIcon size={12} />
              {errors.confirmPassword}
            </FieldError>
          )}
        </FieldGroup>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className={styles.btnSubmitRegister}
          disabled={loading}
        >
          {loading ? (
            <>
              <LoadingSpinner size={18} className={styles.registerSpinner} />
              Создание аккаунта...
            </>
          ) : (
            "Зарегистрироваться"
          )}
        </Button>

        <div className={styles.registerFooterLink}>
          <span>Уже есть аккаунт? </span>
          <Link to="/login" className={styles.authLink}>
            Войти
          </Link>
        </div>
      </form>
    </div>
  );
}
