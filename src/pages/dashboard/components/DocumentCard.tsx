import { CalendarIcon, ClockIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { type Document } from "@/store/documentsSlice";
import styles from "../DashboardPage.module.css";
import { DocumentCardDropdown } from "./DocumentCardDropdown";
import { DocumentCardTitle } from "./DocumentCardTitle";
import { TablePreview } from "./TablePreview";

type DocumentCardProps = {
  doc: Document;
  onOpen: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onSetRenameModal: (renameInfo: { id: string; title: string }) => void;
  onDuplicate: (id: string) => void;
  onExportCsv: (doc: Document) => void;
  onExportJson: (doc: Document) => void;
  onSetDeleteModal: (id: string) => void;
};

export function DocumentCard({
  doc,
  onOpen,
  onUpdateTitle,
  onSetRenameModal,
  onDuplicate,
  onExportCsv,
  onExportJson,
  onSetDeleteModal,
}: DocumentCardProps) {
  return (
    <div
      className={styles.documentCard}
      onClick={() => onOpen(doc.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(doc.id);
        }
      }}
      tabIndex={0}
      role="button"
    >
      <div
        className={styles.documentCardHeader}
        onClick={(e) => e.stopPropagation()}
      >
        <DocumentCardTitle
          title={doc.title}
          onTitleChange={(t) => onUpdateTitle(doc.id, t)}
        />
        <DocumentCardDropdown
          onRename={() => onSetRenameModal({ id: doc.id, title: doc.title })}
          onDuplicate={() => onDuplicate(doc.id)}
          onExportCsv={() => onExportCsv(doc)}
          onExportJson={() => onExportJson(doc)}
          onDelete={() => onSetDeleteModal(doc.id)}
        />
      </div>

      <TablePreview snapshot={doc.tableSnapshot} />

      <div className={styles.documentCardMetadata}>
        <div className={styles.documentCardMetadataRow}>
          <CalendarIcon size={12} />
          <span>Создан: {formatDate(doc.createdAt)}</span>
        </div>
        <div className={styles.documentCardMetadataRow}>
          <ClockIcon size={12} />
          <span>Изменён: {formatDate(doc.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
