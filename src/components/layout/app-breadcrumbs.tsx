import { NavLink, useLocation, useParams } from "react-router-dom";
import { useDocumentById } from "@/hooks/useDocumentStore";
import styles from "./app-breadcrumbs.module.css";

type AppBreadcrumbsProps = {
  titleValue: string;
  onTitleChange: (value: string) => void;
  onTitleBlur: () => void;
};

export function AppBreadcrumbs({
  titleValue,
  onTitleChange,
  onTitleBlur,
}: AppBreadcrumbsProps) {
  const { documentId } = useParams<{ documentId: string }>();
  const activeDocument = useDocumentById(documentId || "");
  const location = useLocation();

  const isDocumentPage = location.pathname.startsWith("/documents/");

  if (isDocumentPage && activeDocument) {
    return (
      <div className={styles.breadcrumbs}>
        <NavLink to="/dashboard" className={styles.link}>
          Мои документы
        </NavLink>
        <span className={styles.slash}>/</span>
        <input
          type="text"
          className={styles.titleInput}
          value={titleValue}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={onTitleBlur}
          placeholder="Без названия"
        />
      </div>
    );
  }

  return (
    <div className={styles.breadcrumbs}>
      <NavLink to="/dashboard" className={styles.link}>
        Мои документы
      </NavLink>
      {location.pathname === "/profile" && (
        <>
          <span className={styles.slash}>/</span>
          <span className={styles.current}>Профиль</span>
        </>
      )}
    </div>
  );
}
