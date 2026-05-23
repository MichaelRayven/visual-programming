import {
  CalendarIcon,
  CheckIcon,
  FileSpreadsheetIcon,
  KeyIcon,
  MailIcon,
  UserIcon,
} from "lucide-react";
import { type SubmitEventHandler, useState } from "react";
import { Button } from "@/components/button";
import { FieldGroup, FieldInput, FieldLabel } from "@/components/field";
import { useDocumentList } from "@/hooks/useDocumentStore";
import { useAppDispatch, useAppSelector } from "@/store";
import { authActions } from "@/store/authSlice";
import { uiActions } from "@/store/uiSlice";
import "./profile.css";

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const documents = useDocumentList();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameSaved, setNameSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleUpdateProfile: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (user) {
      dispatch(
        authActions.setUser({
          ...user,
          name: name.trim(),
          email: email.trim(),
        })
      );
      setNameSaved(true);
      dispatch(
        uiActions.addNotification({
          message: "Имя профиля успешно обновлено!",
          type: "success",
        })
      );
      setTimeout(() => setNameSaved(false), 2500);
    }
  };

  const handleChangePassword: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 8) {
      setErrorMsg("Пароль должен содержать не менее 8 символов");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Пароли не совпадают");
      return;
    }

    setPasswordSaved(true);
    setPassword("");
    setConfirmPassword("");
    dispatch(
      uiActions.addNotification({
        message: "Пароль успешно изменен!",
        type: "success",
      })
    );
    setTimeout(() => setPasswordSaved(false), 2500);
  };

  return (
    <div className="profile-container">
      <div className="profile-grid">
        {/* Left Side: Avatar and stats card */}
        <div className="profile-card profile-sidebar-card">
          <div className="profile-avatar-large">
            <UserIcon size={48} />
          </div>
          <h2 className="profile-user-name">{user?.name || "Пользователь"}</h2>
          <p className="profile-user-email">{user?.email}</p>

          <span className="profile-divider-horizontal" />

          <div className="profile-stats-list">
            <div className="profile-stat-item">
              <div className="profile-stat-icon">
                <FileSpreadsheetIcon size={18} />
              </div>
              <div className="profile-stat-details">
                <span className="profile-stat-value">{documents.length}</span>
                <span className="profile-stat-label">Всего таблиц</span>
              </div>
            </div>

            <div className="profile-stat-item">
              <div className="profile-stat-icon">
                <CalendarIcon size={18} />
              </div>
              <div className="profile-stat-details">
                <span className="profile-stat-value">24.05.2026</span>
                <span className="profile-stat-label">Дата регистрации</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Settings Forms */}
        <div className="profile-settings-wrapper">
          {/* Main Info Form */}
          <div className="profile-card profile-form-card">
            <h3 className="profile-card-title">Личные данные</h3>
            <form onSubmit={handleUpdateProfile}>
              <FieldGroup>
                <FieldLabel htmlFor="name">Ваше имя</FieldLabel>
                <FieldInput
                  id="name"
                  type="text"
                  icon={UserIcon}
                  className="profile-input-field"
                  value={name}
                  required
                  onChange={(e) => setName(e.target.value)}
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="email">Электронная почта</FieldLabel>
                <FieldInput
                  id="email"
                  type="email"
                  icon={MailIcon}
                  className="profile-input-field"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FieldGroup>

              <div className="profile-form-footer">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={nameSaved}
                >
                  {nameSaved ? (
                    <>
                      <CheckIcon size={16} />
                      Сохранено
                    </>
                  ) : (
                    "Сохранить изменения"
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="profile-card profile-form-card">
            <h3 className="profile-card-title">Безопасность</h3>
            <form onSubmit={handleChangePassword}>
              <FieldGroup>
                <FieldLabel htmlFor="password">Новый пароль</FieldLabel>
                <FieldInput
                  id="password"
                  type="password"
                  icon={KeyIcon}
                  placeholder="Минимум 8 символов"
                  className="profile-input-field"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="confirm-password">
                  Подтверждение пароля
                </FieldLabel>
                <FieldInput
                  id="confirm-password"
                  type="password"
                  icon={KeyIcon}
                  placeholder="Повторите пароль"
                  className="profile-input-field"
                  value={confirmPassword}
                  required
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </FieldGroup>

              {errorMsg && <p className="profile-error-message">{errorMsg}</p>}

              <div className="profile-form-footer">
                <Button
                  type="submit"
                  variant="outline"
                  size="md"
                  disabled={passwordSaved}
                >
                  {passwordSaved ? (
                    <>
                      <CheckIcon size={16} />
                      Пароль изменен
                    </>
                  ) : (
                    "Обновить пароль"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
