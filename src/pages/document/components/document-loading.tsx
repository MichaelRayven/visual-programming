import { LoadingSpinner } from "@/components/loading-spinner";
import styles from "../document-page.module.css";

export function DocumentLoading() {
  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.notFoundCard}>
        <LoadingSpinner size={40} className={styles.documentLoadingIcon} />
        <h2
          className={`${styles.notFoundSubtitle} ${styles.documentLoadingTitle}`}
        >
          Загрузка документа...
        </h2>
      </div>
    </div>
  );
}
