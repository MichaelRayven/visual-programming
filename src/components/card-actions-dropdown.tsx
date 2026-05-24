import {
  CopyIcon,
  DownloadIcon,
  FileJsonIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "./button";
import { Dropdown, MenuItem, MenuSeparator } from "./menu";

type CardActionsDropdownProps = {
  onRename: () => void;
  onDuplicate: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onDelete: () => void;
};

export function CardActionsDropdown({
  onRename,
  onDuplicate,
  onExportCsv,
  onExportJson,
  onDelete,
}: CardActionsDropdownProps) {
  return (
    <Dropdown
      className="card-actions-dropdown"
      trigger={
        <Button
          variant="ghost"
          className="btn-icon btn-icon-sm"
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
