import { RenameDocumentDialog } from "@/components/rename-document-dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { DashboardControls } from "./components/dashboard-controls";
import { DocumentCard } from "./components/document-card";
import { EmptyState } from "./components/empty-state";
import styles from "./dashboard-page.module.css";
import { useDashboardPage } from "./useDashboardPage";

export function DashboardPage() {
  const {
    filteredAndSortedDocuments,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    renameOpen,
    deleteOpen,
    importInputRef,
    docStore,
    handleExportCsv,
    handleExportJson,
    handleImportCsv,
    handleOpenDocument,
  } = useDashboardPage();

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
                onUpdateTitle={(id, t) => docStore.updateDocument(id, t)}
                onSetRenameModal={docStore.setRenameModal}
                onDuplicate={docStore.duplicateDocument}
                onExportCsv={handleExportCsv}
                onExportJson={handleExportJson}
                onSetDeleteModal={docStore.setDeleteModal}
              />
            ))}
          </div>
        )}

        <Dialog
          open={!!deleteOpen}
          onOpenChange={() => docStore.setDeleteModal(null)}
          title="Удаление документа"
          content="Вы уверены? Это действие нельзя отменить."
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => docStore.setDeleteModal(null)}
              >
                Отмена
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  docStore.deleteDocument(deleteOpen!);
                  docStore.setDeleteModal(null);
                }}
              >
                Удалить
              </Button>
            </>
          }
        />

        <RenameDocumentDialog
          open={!!renameOpen}
          onOpenChange={(open) => !open && docStore.setRenameModal(null)}
          currentTitle={renameOpen?.title || ""}
          onRename={(newTitle) => {
            if (renameOpen) {
              docStore.updateDocument(renameOpen.id, newTitle);
            }
          }}
        />
      </main>
    </div>
  );
}
