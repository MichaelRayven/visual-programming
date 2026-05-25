import { PersonalInfoForm } from "./components/personal-info-form";
import { ProfileSidebar } from "./components/profile-sidebar";
import { SecurityForm } from "./components/security-form";
import { useProfilePage } from "./hooks/useProfilePage";
import styles from "./profile-page.module.css";

export function ProfilePage() {
  const { user, documentsCount, registrationDate } = useProfilePage();

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <ProfileSidebar
          name={user?.name || "Пользователь"}
          email={user?.email || ""}
          documentsCount={documentsCount}
          registrationDate={registrationDate}
        />
        <div className={styles.settingsWrapper}>
          <PersonalInfoForm />
          <SecurityForm />
        </div>
      </div>
    </div>
  );
}
