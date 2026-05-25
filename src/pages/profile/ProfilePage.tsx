import { PersonalInfoForm } from "./components/PersonalInfoForm";
import { ProfileSidebar } from "./components/ProfileSidebar";
import { SecurityForm } from "./components/SecurityForm";
import styles from "./ProfilePage.module.css";
import { useProfilePage } from "./useProfilePage";

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
