import { DocumentLoading } from "./components/document-loading";
import { DocumentNotFound } from "./components/document-not-found";
import { ForbiddenAccess } from "./components/forbidden-access";
import { Table } from "./components/table";
import { UnsavedChangesBlocker } from "./components/unsaved-changes-blocker";
import styles from "./document-page.module.css";
import { useDocumentPage } from "./hooks/useDocumentPage";

export function DocumentPage() {
  const { document, loading, error, handleBackToDashboard } = useDocumentPage();

  if (error === "403") {
    return <ForbiddenAccess onBack={handleBackToDashboard} />;
  }

  if (loading) {
    return <DocumentLoading />;
  }

  if (!document) {
    return <DocumentNotFound onBack={handleBackToDashboard} />;
  }

  return (
    <div className={styles.documentPage}>
      <main className={styles.documentMain}>
        <Table snapshot={document.tableSnapshot} />
      </main>

      <UnsavedChangesBlocker />
    </div>
  );
}
