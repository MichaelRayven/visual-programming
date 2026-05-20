import { ChevronDownIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/button";
import { MenuContent, MenuItem } from "@/components/menu";

export type SortOption = "name" | "dateCreated" | "dateModified";

type SortDropdownProps = {
  sortBy: SortOption;
  onSortChange: (val: SortOption) => void;
};

export function SortDropdown({ sortBy, onSortChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const action = (val: SortOption) => {
    onSortChange(val);
    setOpen(false);
  };

  const getLabel = (val: SortOption) => {
    switch (val) {
      case "dateModified":
        return "По дате изменения";
      case "dateCreated":
        return "По дате создания";
      case "name":
        return "По названию";
    }
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {getLabel(sortBy)}
        <ChevronDownIcon size={14} />
      </Button>
      {open && (
        <MenuContent className="menu-dropdown">
          <MenuItem onClick={() => action("dateModified")}>
            По дате изменения
          </MenuItem>
          <MenuItem onClick={() => action("dateCreated")}>
            По дате создания
          </MenuItem>
          <MenuItem onClick={() => action("name")}>По названию</MenuItem>
        </MenuContent>
      )}
    </div>
  );
}
