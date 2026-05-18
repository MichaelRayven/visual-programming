import { createContext, useContext, useSyncExternalStore } from "react";
import { DocumentStore } from "@/stores/document";

export const DocumentStoreContext = createContext<DocumentStore | null>(null);

export const useDocumentStore = () => {
  const store = useContext(DocumentStoreContext);
  if (!store)
    throw new Error(
      "useDocumentStore must be used within DocumentStoreProvider"
    );
  return store;
};

export function useDocumentSaveStatus() {
  const store = useDocumentStore();
  return useSyncExternalStore(
    (l) => store.subscribeStatus(l),
    () => store.getSaveStatus()
  );
}

export function useDocument(id: string) {
  const store = useDocumentStore();
  return useSyncExternalStore(
    (l) => store.subscribeList(l),
    () => store.getDocumentById(id)
  );
}
