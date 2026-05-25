import {
  CopyIcon,
  DownloadIcon,
  FileJsonIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/button";
import { Dropdown, MenuItem, MenuSeparator } from "@/components/menu";
import styles from "../DashboardPage.module.css";

type DocumentCardDropdownProps = {
  onRename: () => void;
  onDuplicate: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onDelete: () => void;
};

export function DocumentCardDropdown({
  onRename,
  onDuplicate,
  onExportCsv,
  onExportJson,
  onDelete,
}: DocumentCardDropdownProps) {
  return (
    <Dropdown
      className={styles.cardDropdown}
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className={styles.dropdownTrigger}
          aria-label="Document actions"
        >
          <MoreHorizontalIcon size={16} />
        </Button>
      }
    >
      <MenuItem onClick={onRename}>
        <PencilIcon size={14} />
        Переименовать
      </MenuItem>

      <MenuItem onClick={onDuplicate}>
        <CopyIcon size={14} />
        Копия
      </MenuItem>

      <MenuSeparator />

      <MenuItem onClick={onExportCsv}>
        <DownloadIcon size={14} />
        Экспорт в CSV
      </MenuItem>

      <MenuItem onClick={onExportJson}>
        <FileJsonIcon size={14} />
        Экспорт в JSON
      </MenuItem>

      <MenuSeparator />

      <MenuItem danger onClick={onDelete}>
        <Trash2Icon size={14} />
        Удалить
      </MenuItem>
    </Dropdown>
  );
}
