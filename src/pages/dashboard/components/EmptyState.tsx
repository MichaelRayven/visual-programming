import { FileTextIcon } from "lucide-react";
import styles from "../DashboardPage.module.css";

type EmptyStateProps = {
  hasQuery: boolean;
};

export function EmptyState({ hasQuery }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <FileTextIcon size={64} className={styles.emptyStateIcon} />
      <h2 className={styles.emptyStateTitle}>
        {hasQuery ? "Документы не найдены" : "Нет документов"}
      </h2>
      <p className={styles.emptyStateDescription}>
        {hasQuery
          ? "Попробуйте изменить поисковый запрос"
          : "Создайте свой первый документ, чтобы начать работу"}
      </p>
    </div>
  );
}
