import {
  CopyIcon,
  DownloadIcon,
  FileJsonIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./button";
import { MenuContent, MenuItem, MenuSeparator } from "./menu";

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
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const action = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="card-actions-dropdown"
      style={{ position: "relative" }}
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        variant="ghost"
        className="btn-icon btn-icon-sm"
        aria-label="Document actions"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontalIcon size={16} />
      </Button>

      {open && (
        <MenuContent className="menu-dropdown">
          <MenuItem onClick={() => action(onRename)}>
            <PencilIcon size={14} />
            Переименовать
          </MenuItem>

          <MenuItem onClick={() => action(onDuplicate)}>
            <CopyIcon size={14} />
            Копия
          </MenuItem>

          <MenuSeparator />

          <MenuItem onClick={() => action(onExportCsv)}>
            <DownloadIcon size={14} />
            Экспорт в CSV
          </MenuItem>

          <MenuItem onClick={() => action(onExportJson)}>
            <FileJsonIcon size={14} />
            Экспорт в JSON
          </MenuItem>

          <MenuSeparator />

          <MenuItem danger onClick={() => action(onDelete)}>
            <Trash2Icon size={14} />
            Удалить
          </MenuItem>
        </MenuContent>
      )}
    </div>
  );
}
