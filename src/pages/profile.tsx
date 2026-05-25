import {
  CalendarIcon,
  CheckIcon,
  FileSpreadsheetIcon,
  KeyIcon,
  Loader2,
  MailIcon,
  UserIcon,
} from "lucide-react";
import { type SubmitEventHandler, useEffect, useState } from "react";
import { Button } from "@/components/button";
import { FieldGroup, FieldInput, FieldLabel } from "@/components/field";
import { useDocumentList } from "@/hooks/useDocumentStore";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  authActions,
  updateUserPassword,
  updateUserProfile,
} from "@/store/authSlice";
import { fetchDocuments } from "@/store/documentsSlice";
import "./profile.css";

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const documents = useDocumentList();

  // Profile forms states from redux auth slice
  const {
    updateProfileLoading,
    profileError,
    profileSuccess,
    changePasswordLoading,
    passwordError,
    passwordSuccess,
  } = useAppSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordLocalError, setPasswordLocalError] = useState("");

  // Ensure documents count and user data are loaded
  useEffect(() => {
    dispatch(fetchDocuments());
    return () => {
      dispatch(authActions.resetProfileStatus());
      dispatch(authActions.resetPasswordStatus());
    };
  }, [dispatch]);

  // Keep state in sync with loaded user
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // Reset statuses after timeout
  useEffect(() => {
    if (profileSuccess) {
      const timer = setTimeout(() => {
        dispatch(authActions.resetProfileStatus());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [profileSuccess, dispatch]);

  useEffect(() => {
    if (passwordSuccess) {
      const timer = setTimeout(() => {
        dispatch(authActions.resetPasswordStatus());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [passwordSuccess, dispatch]);

  const handleUpdateProfile: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    dispatch(updateUserProfile({ name: name.trim(), email: email.trim() }));
  };

  const handleChangePassword: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setPasswordLocalError("");
    dispatch(authActions.resetPasswordStatus());

    if (password.length < 8) {
      setPasswordLocalError("Пароль должен содержать не менее 8 символов");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordLocalError("Пароли не совпадают");
      return;
    }

    dispatch(updateUserPassword(password)).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        setPassword("");
        setConfirmPassword("");
      }
    });
  };

  const registrationDate = user?.registeredAt
    ? new Date(user.registeredAt).toLocaleDateString("ru-RU")
    : "24.05.2026";

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
                <span className="profile-stat-value">{registrationDate}</span>
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
                  disabled={updateProfileLoading}
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
                  disabled={updateProfileLoading}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FieldGroup>

              {profileError && (
                <p className="profile-error-message">{profileError}</p>
              )}
              {profileSuccess && (
                <p className="profile-success-message">
                  Профиль успешно обновлен!
                </p>
              )}

              <div className="profile-form-footer">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={updateProfileLoading || profileSuccess}
                >
                  {updateProfileLoading ? (
                    <>
                      <Loader2 className="spinner-icon" size={16} />
                      Сохранение...
                    </>
                  ) : profileSuccess ? (
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
                  disabled={changePasswordLoading}
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
                  disabled={changePasswordLoading}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </FieldGroup>

              {(passwordLocalError || passwordError) && (
                <p className="profile-error-message">
                  {passwordLocalError || passwordError}
                </p>
              )}
              {passwordSuccess && (
                <p className="profile-success-message">
                  Пароль успешно изменен!
                </p>
              )}

              <div className="profile-form-footer">
                <Button
                  type="submit"
                  variant="outline"
                  size="md"
                  disabled={changePasswordLoading || passwordSuccess}
                >
                  {changePasswordLoading ? (
                    <>
                      <Loader2 className="spinner-icon" size={16} />
                      Обновление...
                    </>
                  ) : passwordSuccess ? (
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
