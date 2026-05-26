import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useAppDispatch } from "@/store";
import { documentsActions } from "@/store/documentsSlice";
import { uiActions } from "@/store/uiSlice";
import { DashboardControls } from "./components/dashboard-controls";
import { DocumentCard } from "./components/document-card";
import { EmptyState } from "./components/empty-state";
import { RenameDocumentDialog } from "./components/rename-document-dialog";
import styles from "./dashboard-page.module.css";
import { useDashboardPage } from "./hooks/useDashboardPage";

export function DashboardPage() {
  const {
    filteredAndSortedDocuments,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    deleteOpen,
    importInputRef,
    handleExportCsv,
    handleExportJson,
    handleImportCsv,
    handleOpenDocument,
  } = useDashboardPage();
  const dispatch = useAppDispatch();

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <DashboardControls
          searchQuery={searchQuery}
          onChangeSearch={setSearchQuery}
          sortBy={sortBy}
          onChangeSort={setSortBy}
          importInputRef={importInputRef}
          onImportCsv={handleImportCsv}
        />

        {filteredAndSortedDocuments.length === 0 ? (
          <EmptyState hasQuery={!!searchQuery} />
        ) : (
          <div className={styles.grid}>
            {filteredAndSortedDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onOpen={handleOpenDocument}
                onUpdateTitle={(id, title) =>
                  dispatch(documentsActions.updateDocument({ id, title }))
                }
                onSetRenameModal={(data) =>
                  dispatch(uiActions.setRenameModal(data))
                }
                onDuplicate={(id) =>
                  dispatch(documentsActions.duplicateDocument(id))
                }
                onExportCsv={handleExportCsv}
                onExportJson={handleExportJson}
                onSetDeleteModal={(id) =>
                  dispatch(uiActions.setDeleteModal(id))
                }
              />
            ))}
          </div>
        )}

        <Dialog
          open={!!deleteOpen}
          onOpenChange={() => dispatch(uiActions.setDeleteModal(null))}
          title="Удаление документа"
          content="Вы уверены? Это действие нельзя отменить."
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => dispatch(uiActions.setDeleteModal(null))}
              >
                Отмена
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  dispatch(documentsActions.deleteDocument(deleteOpen!));
                  dispatch(uiActions.setDeleteModal(null));
                }}
              >
                Удалить
              </Button>
            </>
          }
        />

        <RenameDocumentDialog />
      </main>
    </div>
  );
}
