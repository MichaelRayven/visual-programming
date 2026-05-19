import {
  CopyIcon,
  DownloadIcon,
  FileJsonIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "./card-actions-dropdown.css";

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
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="btn btn-ghost btn-icon btn-icon-sm"
        aria-label="Document actions"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontalIcon size={16} />
      </button>

      {open && (
        <div className="card-actions-menu" role="menu">
          <button
            type="button"
            className="card-actions-menu-item"
            role="menuitem"
            onClick={() => action(onRename)}
          >
            <PencilIcon size={14} />
            Rename
          </button>

          <button
            type="button"
            className="card-actions-menu-item"
            role="menuitem"
            onClick={() => action(onDuplicate)}
          >
            <CopyIcon size={14} />
            Duplicate
          </button>

          <div className="card-actions-menu-separator" />

          <button
            type="button"
            className="card-actions-menu-item"
            role="menuitem"
            onClick={() => action(onExportCsv)}
          >
            <DownloadIcon size={14} />
            Export CSV
          </button>

          <button
            type="button"
            className="card-actions-menu-item"
            role="menuitem"
            onClick={() => action(onExportJson)}
          >
            <FileJsonIcon size={14} />
            Export JSON
          </button>

          <div className="card-actions-menu-separator" />

          <button
            type="button"
            className="card-actions-menu-item card-actions-menu-item-danger"
            role="menuitem"
            onClick={() => action(onDelete)}
          >
            <Trash2Icon size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
