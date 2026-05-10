import { createContext, useContext } from "react";
import { type SelectedCell, type TableSelection } from "@/lib/table";

type TableContextType = {
  selectedCell: SelectedCell | null;
  selection: TableSelection | null;
  setSelectedCell: (cell: SelectedCell | null) => void;
  setSelection: (selection: TableSelection | null) => void;
  clearSelection: () => void;
};

export const TableContext = createContext<TableContextType | null>(null);

export const useTable = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("useTable must be used within a TableProvider");
  }
  return context;
};
