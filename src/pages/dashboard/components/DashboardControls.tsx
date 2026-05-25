import { SearchIcon, UploadIcon } from "lucide-react";
import type { ChangeEvent, RefObject } from "react";
import { Button } from "@/components/button";
import { CreateDocumentDialog } from "@/components/create-document-dialog";
import styles from "../DashboardPage.module.css";
import { SortDropdown, type SortOption } from "./SortDropdown";

type DashboardControlsProps = {
  searchQuery: string;
  onChangeSearch: (query: string) => void;
  sortBy: SortOption;
  onChangeSort: (option: SortOption) => void;
  importInputRef: RefObject<HTMLInputElement | null>;
  onImportCsv: (e: ChangeEvent<HTMLInputElement>) => void;
};

export function DashboardControls({
  searchQuery,
  onChangeSearch,
  sortBy,
  onChangeSort,
  importInputRef,
  onImportCsv,
}: DashboardControlsProps) {
  return (
    <div className={styles.controls}>
      <div className={styles.searchWrapper}>
        <div className={styles.searchIcon}>
          <SearchIcon size={16} />
        </div>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Поиск документов..."
          value={searchQuery}
          onChange={(e) => onChangeSearch(e.target.value)}
        />
      </div>

      <div className={styles.sortGroup}>
        <label className={styles.sortLabel}>Сортировка:</label>
        <SortDropdown sortBy={sortBy} onSortChange={onChangeSort} />
      </div>

      <div className={styles.controlsRight}>
        <input
          ref={importInputRef}
          type="file"
          accept=".csv"
          className={styles.importInput}
          aria-label="Import CSV file"
          onChange={onImportCsv}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => importInputRef.current?.click()}
          title="Import CSV"
        >
          <UploadIcon size={16} />
          Импорт CSV
        </Button>
        <CreateDocumentDialog />
      </div>
    </div>
  );
}
