import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { type Document, documentActions } from "@/store/documentSlice";

export const useDocumentStore = () => {
  const dispatch = useDispatch<AppDispatch>();

  return {
    createDocument: (title: string, rows: number, cols: number) => {
      dispatch(documentActions.createDocument({ title, rows, cols }));
    },
    updateDocument: (id: string, newTitle: string) => {
      dispatch(documentActions.updateDocument({ id, title: newTitle }));
    },
    duplicateDocument: (id: string) => {
      dispatch(documentActions.duplicateDocument(id));
    },
    deleteDocument: (id: string) => {
      dispatch(documentActions.deleteDocument(id));
    },
    setOpenDocument: (id: string | null) => {
      dispatch(documentActions.setOpenDocument(id));
    },
    importDocument: (doc: Document) => {
      dispatch(documentActions.importDocument(doc));
    },
  };
};

export function useDocumentSaveStatus() {
  return useSelector((state: RootState) => state.document.saveStatus);
}

export function useDocumentById(id: string) {
  return useSelector((state: RootState) =>
    state.document.documents.find((doc) => doc.id === id)
  );
}

export function useDocumentList() {
  return useSelector((state: RootState) => state.document.documents);
}

export function useOpenDocument() {
  return useSelector((state: RootState) =>
    state.document.openDocumentId
      ? state.document.documents.find(
          (doc) => doc.id === state.document.openDocumentId
        )
      : null
  );
}
