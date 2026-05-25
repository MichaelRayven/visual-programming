import { CalendarIcon, FileSpreadsheetIcon, UserIcon } from "lucide-react";
import styles from "../ProfilePage.module.css";

type ProfileSidebarProps = {
  name: string;
  email: string;
  documentsCount: number;
  registrationDate: string;
};

export function ProfileSidebar({
  name,
  email,
  documentsCount,
  registrationDate,
}: ProfileSidebarProps) {
  return (
    <div className={`${styles.card} ${styles.sidebar}`}>
      <div className={styles.avatar}>
        <UserIcon size={48} />
      </div>
      <h2 className={styles.name}>{name}</h2>
      <p className={styles.email}>{email}</p>

      <span className={styles.divider} />

      <div className={styles.statsList}>
        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <FileSpreadsheetIcon size={18} />
          </div>
          <div className={styles.statDetails}>
            <span className={styles.statValue}>{documentsCount}</span>
            <span className={styles.statLabel}>Всего таблиц</span>
          </div>
        </div>

        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <CalendarIcon size={18} />
          </div>
          <div className={styles.statDetails}>
            <span className={styles.statValue}>{registrationDate}</span>
            <span className={styles.statLabel}>Дата регистрации</span>
          </div>
        </div>
      </div>
    </div>
  );
}
