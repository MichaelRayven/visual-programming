import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { DocumentLoading } from "./components/document-loading";
import { DocumentNotFound } from "./components/document-not-found";
import { ForbiddenAccess } from "./components/forbidden-access";
import { Table } from "./components/table";
import styles from "./document-page.module.css";
import { useDocumentPage } from "./hooks/useDocumentPage";

export function DocumentPage() {
  const { document, loading, error, blocker, handleBackToDashboard } =
    useDocumentPage();

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

      <Dialog
        open={blocker.state === "blocked"}
        onOpenChange={() => {
          if (blocker.state === "blocked") {
            blocker.reset();
          }
        }}
        title="Несохраняемые изменения"
        content="В данный момент происходит автосохранение документа. Если вы покинете страницу сейчас, последние изменения могут быть утеряны. Вы уверены, что хотите уйти?"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                if (blocker.state === "blocked") {
                  blocker.reset();
                }
              }}
            >
              Остаться
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (blocker.state === "blocked") {
                  blocker.proceed();
                }
              }}
            >
              Уйти
            </Button>
          </>
        }
      />
    </div>
  );
}
