import { createContext, type ReactNode, useContext, useState } from "react";
import {
  getSelectionBounds,
  type SelectedCell,
  type Selection,
} from "@/lib/table";

type TableContextType = {
  selectedCell: SelectedCell | null;
  selection: Selection | null;
  setSelectedCell: (cell: SelectedCell | null) => void;
  setSelection: (selection: Selection | null) => void;
  clearSelection: () => void;
};

const TableContext = createContext<TableContextType | null>(null);

export const useTable = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("useTable must be used within a TableProvider");
  }
  return context;
};

type TableProviderProps = {
  children: ReactNode;
  initialSelectedCell?: SelectedCell | null;
  initialSelection?: Selection | null;
};

export const TableContextProvider = ({
  children,
  initialSelectedCell = null,
  initialSelection = null,
}: TableProviderProps) => {
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(
    initialSelectedCell
  );
  const [selection, setSelection] = useState<Selection | null>(
    initialSelection
  );

  const setSelectionBounds = (selection: Selection | null) => {
    setSelection(selection ? getSelectionBounds(selection) : null);
  };

  const clearSelection = () => {
    setSelectedCell(null);
    setSelection(null);
  };

  const value: TableContextType = {
    selectedCell,
    selection,
    setSelectedCell,
    setSelection: setSelectionBounds,
    clearSelection,
  };

  return (
    <TableContext.Provider value={value}>{children}</TableContext.Provider>
  );
};
