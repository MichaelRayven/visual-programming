import { useAppDispatch, useAppSelector } from "@/store";
import { type Document, documentsActions } from "@/store/documentsSlice";
import { uiActions } from "@/store/uiSlice";

export const useDocumentStore = () => {
  const dispatch = useAppDispatch();

  return {
    createDocument: (title: string, rows: number, cols: number) => {
      dispatch(documentsActions.createDocument({ title, rows, cols }));
    },
    updateDocument: (id: string, newTitle: string) => {
      dispatch(documentsActions.updateDocument({ id, title: newTitle }));
    },
    duplicateDocument: (id: string) => {
      dispatch(documentsActions.duplicateDocument(id));
    },
    deleteDocument: (id: string) => {
      dispatch(documentsActions.deleteDocument(id));
    },
    setOpenDocument: (id: string | null) => {
      dispatch(documentsActions.setActiveDocumentId(id));
    },
    importDocument: (doc: Document) => {
      dispatch(documentsActions.importDocument(doc));
    },
    fetchDocuments: () => {
      dispatch(documentsActions.fetchDocuments());
    },
    fetchDocumentById: (id: string) => {
      dispatch(documentsActions.fetchDocumentById(id));
    },
    setCreateModalOpen: (open: boolean) => {
      dispatch(uiActions.setCreateModalOpen(open));
    },
    setRenameModal: (renameInfo: { id: string; title: string } | null) => {
      dispatch(uiActions.setRenameModal(renameInfo));
    },
    setDeleteModal: (deleteId: string | null) => {
      dispatch(uiActions.setDeleteModal(deleteId));
    },
  };
};

export function useDocumentSaveStatus() {
  return useAppSelector((state) => state.ui.saveStatus);
}

export function useDocumentById(id: string) {
  return useAppSelector((state) =>
    state.documents.documents.find((doc) => doc.id === id)
  );
}

export function useDocumentList() {
  return useAppSelector((state) => state.documents.documents);
}

export function useDocumentLoadingStatus() {
  return useAppSelector((state) => state.documents.loadingStatus);
}

export function useOpenDocument() {
  return useAppSelector((state) =>
    state.documents.activeDocumentId
      ? state.documents.documents.find(
          (doc) => doc.id === state.documents.activeDocumentId
        )
      : null
  );
}

export function useUIModals() {
  return useAppSelector((state) => state.ui.modals);
}
