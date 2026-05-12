import { createContext, useContext } from "react";
import { TableStore } from "@/lib/store";

export const TableStoreContext = createContext<TableStore | null>(null);

export const useStore = () => {
  const store = useContext(TableStoreContext);
  if (!store)
    throw new Error("useStore must be used within TableStoreProvider");
  return store;
};
