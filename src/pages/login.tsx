import {
  AlertCircleIcon,
  FileSpreadsheetIcon,
  LockIcon,
  MailIcon,
} from "lucide-react";
import { type SubmitEventHandler, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/button";
import {
  FieldError,
  FieldGroup,
  FieldInput,
  FieldLabel,
} from "@/components/field";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useAppDispatch, useAppSelector } from "@/store";
import { loginUser } from "@/store/authSlice";
import "./login.css";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || "/dashboard";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);
    setFormError(null);

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

    if (!password) {
      setPasswordError("Введите пароль");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("Пароль должен содержать не менее 8 символов");
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

    const resultAction = await dispatch(loginUser({ email, password }));
    setLoading(false);

    if (loginUser.fulfilled.match(resultAction)) {
      navigate(from, { replace: true });
    } else {
      setFormError(
        (resultAction.payload as string) ||
          "Неверный адрес электронной почты или пароль"
      );
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-wrapper">
            <FileSpreadsheetIcon size={24} />
          </div>
          <h1 className="login-title">Вход в систему</h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {formError && (
            <div className="login-error-alert" role="alert">
              <AlertCircleIcon size={18} className="login-error-alert-icon" />
              <span>{formError}</span>
            </div>
          )}

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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
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

          {/* Demo account hint card */}
          <div className="demo-info-card">
            <div className="demo-info-title">Демонстрационные аккаунты:</div>
            <div className="demo-info-item">
              <strong>Михаил:</strong> michael@example.com / password123
            </div>
            <div>
              <strong>Роман:</strong> roman@example.com / password123
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="btn-submit-login"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size={18} className="login-spinner" />
                Выполняется вход...
              </>
            ) : (
              "Войти"
            )}
          </Button>

          {/* Transition link to registration page */}
          <div className="login-footer-link">
            <span>Нет аккаунта? </span>
            <Link to="/register" className="auth-link">
              Зарегистрироваться
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
