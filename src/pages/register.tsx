import {
  AlertCircleIcon,
  FileSpreadsheetIcon,
  LockIcon,
  MailIcon,
  UserIcon,
} from "lucide-react";
import { type SubmitEventHandler, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/button";
import {
  FieldError,
  FieldGroup,
  FieldInput,
  FieldLabel,
} from "@/components/field";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useAppDispatch, useAppSelector } from "@/store";
import { registerUser } from "@/store/authSlice";
import "./register.css";

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);

  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard immediately
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateForm = (): boolean => {
    let isValid = true;
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setFormError(null);

    // Validate Name
    if (!name.trim()) {
      setNameError("Введите имя");
      isValid = false;
    }

    // Validate Email
    if (!email.trim()) {
      setEmailError("Введите адрес электронной почты");
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError("Неверный формат адреса электронной почты");
        isValid = false;
      }
    }

    // Validate Password (>= 8 characters as per PRD)
    if (!password) {
      setPasswordError("Введите пароль");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("Пароль должен содержать не менее 8 символов");
      isValid = false;
    }

    // Validate Password Confirmation
    if (!confirmPassword) {
      setConfirmPasswordError("Подтвердите пароль");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Пароли не совпадают");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setFormError(null);

    const resultAction = await dispatch(
      registerUser({ name, email, password })
    );
    setLoading(false);

    if (registerUser.fulfilled.match(resultAction)) {
      navigate("/dashboard", { replace: true });
    } else {
      setFormError(
        (resultAction.payload as string) || "Ошибка при регистрации"
      );
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-card">
        <div className="register-header">
          <div className="register-logo-wrapper">
            <FileSpreadsheetIcon size={24} />
          </div>
          <h1 className="register-title">Регистрация</h1>
        </div>

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          {formError && (
            <div className="register-error-alert" role="alert">
              <AlertCircleIcon
                size={18}
                className="register-error-alert-icon"
              />
              <span>{formError}</span>
            </div>
          )}

          {/* Name Input Group */}
          <FieldGroup>
            <FieldLabel htmlFor="name-input">Имя</FieldLabel>
            <FieldInput
              id="name-input"
              type="text"
              icon={UserIcon}
              placeholder="Иван"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoComplete="name"
              error={!!nameError}
              required
            />
            {nameError && (
              <FieldError className="flex items-center gap-2">
                <AlertCircleIcon size={12} />
                {nameError}
              </FieldError>
            )}
          </FieldGroup>

          {/* Email Input Group */}
          <FieldGroup>
            <FieldLabel htmlFor="email-input">Электронная почта</FieldLabel>
            <FieldInput
              id="email-input"
              type="email"
              icon={MailIcon}
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              error={!!emailError}
              required
            />
            {emailError && (
              <FieldError className="flex items-center gap-2">
                <AlertCircleIcon size={12} />
                {emailError}
              </FieldError>
            )}
          </FieldGroup>

          {/* Password Input Group */}
          <FieldGroup>
            <FieldLabel htmlFor="password-input">Пароль</FieldLabel>
            <FieldInput
              id="password-input"
              type="password"
              icon={LockIcon}
              placeholder="Минимум 8 символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              error={!!passwordError}
              required
            />
            {passwordError && (
              <FieldError className="flex items-center gap-2">
                <AlertCircleIcon size={12} />
                {passwordError}
              </FieldError>
            )}
          </FieldGroup>

          {/* Confirm Password Input Group */}
          <FieldGroup>
            <FieldLabel htmlFor="confirm-password-input">
              Подтверждение пароля
            </FieldLabel>
            <FieldInput
              id="confirm-password-input"
              type="password"
              icon={LockIcon}
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              error={!!confirmPasswordError}
              required
            />
            {confirmPasswordError && (
              <FieldError className="flex items-center gap-2">
                <AlertCircleIcon size={12} />
                {confirmPasswordError}
              </FieldError>
            )}
          </FieldGroup>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="btn-submit-register"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size={18} className="register-spinner" />
                Создание аккаунта...
              </>
            ) : (
              "Зарегистрироваться"
            )}
          </Button>

          {/* Transition link back to login page */}
          <div className="register-footer-link">
            <span>Уже есть аккаунт? </span>
            <Link to="/login" className="auth-link">
              Войти
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
