import { FileQuestionIcon, HomeIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.notFoundCard}>
        <div className={styles.notFoundIconWrapper}>
          <FileQuestionIcon size={48} className={styles.notFoundIcon} />
        </div>
        <h1 className={styles.notFoundTitle}>404</h1>
        <h2 className={styles.notFoundSubtitle}>Страница не найдена</h2>
        <p className={styles.notFoundDescription}>
          К сожалению, запрашиваемая вами страница не существует, была удалена
          или перенесена по новому адресу.
        </p>
        <Link to="/dashboard">
          <Button variant="primary" size="md">
            <HomeIcon size={16} />
            Вернуться на главную
          </Button>
        </Link>
      </div>
    </div>
  );
}
