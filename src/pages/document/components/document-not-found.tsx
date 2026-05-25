import { AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "../document-page.module.css";

type DocumentNotFoundProps = {
  onBack: () => void;
};

export function DocumentNotFound({ onBack }: DocumentNotFoundProps) {
  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.notFoundCard}>
        <AlertCircleIcon size={48} className={styles.documentErrorIcon} />
        <h2 className={styles.notFoundSubtitle}>Документ не найден</h2>
        <p className={styles.notFoundDescription}>
          К сожалению, запрашиваемый вами документ не существует или к нему нет
          доступа.
        </p>
        <Button variant="primary" size="md" onClick={onBack}>
          Вернуться в список документов
        </Button>
      </div>
    </div>
  );
}
