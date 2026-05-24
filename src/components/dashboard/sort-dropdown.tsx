import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/button";
import { Dropdown, MenuItem } from "@/components/menu";

export type SortOption = "name" | "dateCreated" | "dateModified";

type SortDropdownProps = {
  sortBy: SortOption;
  onSortChange: (val: SortOption) => void;
};

export function SortDropdown({ sortBy, onSortChange }: SortDropdownProps) {
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
    <Dropdown
      trigger={
        <Button variant="outline" size="sm">
          {getLabel(sortBy)}
          <ChevronDownIcon size={14} />
        </Button>
      }
    >
      <MenuItem onClick={() => onSortChange("dateModified")}>
        По дате изменения
      </MenuItem>
      <MenuItem onClick={() => onSortChange("dateCreated")}>
        По дате создания
      </MenuItem>
      <MenuItem onClick={() => onSortChange("name")}>По названию</MenuItem>
    </Dropdown>
  );
}
