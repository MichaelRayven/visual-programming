import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { Table } from "@/components/table";
import { DocumentLoading } from "./components/DocumentLoading";
import { DocumentNotFound } from "./components/DocumentNotFound";
import { ForbiddenAccess } from "./components/ForbiddenAccess";
import styles from "./DocumentPage.module.css";
import { useDocumentPage } from "./useDocumentPage";

export function DocumentPage() {
  const { document, loadingStatus, error, blocker, handleBackToDashboard } =
    useDocumentPage();

  if (loadingStatus === "failed" && error === "403") {
    return <ForbiddenAccess onBack={handleBackToDashboard} />;
  }

  if (!document && loadingStatus === "loading") {
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
