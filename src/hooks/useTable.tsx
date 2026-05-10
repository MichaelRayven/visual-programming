import { createContext, useContext } from "react";
import {
  type CellData,
  type CellPosition,
  type TableSelection,
} from "@/lib/table";

type TableContextType = {
  selectedCell: CellPosition | null;
  selection: TableSelection | null;
  setSelectedCell: (cell: CellPosition | null) => void;
  setSelection: (selection: TableSelection | null) => void;
  clearSelection: () => void;

  data: Record<string, string>;
  updateCell: (cellId: string, value: string) => void;
  getCellData: (cellId: string) => CellData;
};

export const TableContext = createContext<TableContextType | null>(null);

export const useTable = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("useTable must be used within a TableProvider");
  }
  return context;
};
