import {
  AlertCircleIcon,
  FileSpreadsheetIcon,
  LoaderIcon,
  LockIcon,
  MailIcon,
} from "lucide-react";
import { type SubmitEventHandler, useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { authActions } from "@/store/authSlice";
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

  // If already authenticated, redirect immediately to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
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

    // Validate password presence and length
    if (!password) {
      setPasswordError("Введите пароль");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Пароль должен содержать не менее 6 символов");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Demo authentication logic
      const targetEmail = email.trim().toLowerCase();

      if (targetEmail === "michael@example.com" && password === "password123") {
        dispatch(
          authActions.setUser({
            id: "mock-user-123",
            name: "Михаил",
            email: "michael@example.com",
          })
        );
      } else {
        setFormError("Неверный адрес электронной почты или пароль");
        setLoading(false);
      }
    }, 1200);
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
          <div className={`form-group ${emailError ? "has-error" : ""}`}>
            <label htmlFor="email-input" className="form-label">
              Электронная почта
            </label>
            <div className="input-container">
              <MailIcon size={16} className="input-icon-left" />
              <input
                id="email-input"
                type="email"
                className="login-input"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>
            {emailError && (
              <span className="field-error-message">
                <AlertCircleIcon size={12} />
                {emailError}
              </span>
            )}
          </div>

          {/* Password Input Group */}
          <div className={`form-group ${passwordError ? "has-error" : ""}`}>
            <label htmlFor="password-input" className="form-label">
              Пароль
            </label>
            <div className="input-container">
              <LockIcon size={16} className="input-icon-left" />
              <input
                id="password-input"
                type="password"
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                required
              />
            </div>
            {passwordError && (
              <span className="field-error-message">
                <AlertCircleIcon size={12} />
                {passwordError}
              </span>
            )}
          </div>

          {/* Demo account hint card */}
          <div className="demo-info-card">
            <div className="demo-info-title">Демонстрационный аккаунт:</div>
            <div>
              Email:{" "}
              <span className="demo-credentials">michael@example.com</span>
            </div>
            <div style={{ marginTop: "2px" }}>
              Пароль: <span className="demo-credentials">password123</span>
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
                <LoaderIcon size={18} className="login-spinner animate-spin" />
                Выполняется вход...
              </>
            ) : (
              "Войти"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
