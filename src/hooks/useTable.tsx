import { createContext, useContext } from "react";

type TableSelection = {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

type TableColumn = {
  width: number;
  header: string;
};

type TableContext = {
  selection: TableSelection | null;
  columns: TableColumn[];
};

const TableContext = createContext<TableContext | null>(null);
const TableRowContext = createContext(null);
const TableCellContext = createContext(null);

export const useTable = () => {
  const tableData = useContext(TableContext);
  if (tableData == null) {
    throw Error("A TableRow must have a Table parent");
  }
  return tableData;
};

export const useTableRow = () => {
  const tableRowData = useContext(TableRowContext);
  if (tableRowData == null) {
    throw Error("A TabPanel must have a Tabs parent");
  }
  return tableRowData;
};

export const useTableCell = () => {
  const tableCellData = useContext(TableCellContext);
  if (tableCellData == null) {
    throw Error("A TabList must have a Tabs parent");
  }
  return tableCellData;
};
