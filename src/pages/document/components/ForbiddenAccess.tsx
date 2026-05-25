import { AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/button";
import styles from "../DocumentPage.module.css";

type ForbiddenAccessProps = {
  onBack: () => void;
};

export function ForbiddenAccess({ onBack }: ForbiddenAccessProps) {
  return (
    <div className={styles.forbiddenPageContainer}>
      <div className={styles.forbiddenCard}>
        <div className={styles.forbiddenIconWrapper}>
          <AlertCircleIcon size={32} />
        </div>
        <h1 className={styles.forbiddenTitle}>Доступ ограничен (403)</h1>
        <p className={styles.forbiddenMessage}>
          Вы не являетесь владельцем этого документа и не имеете прав на его
          просмотр.
        </p>
        <Button variant="primary" size="md" onClick={onBack}>
          Вернуться в Мои документы
        </Button>
      </div>
    </div>
  );
}
