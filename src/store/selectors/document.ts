import { createSelector } from "@reduxjs/toolkit";
import { type RootState } from "@/store";
import { type Document } from "@/store/documentsSlice";

export const selectDocumentsState = (state: RootState) => state.documents;
export const selectAllDocuments = (state: RootState) =>
  state.documents.documents;
export const selectActiveDocumentId = (state: RootState) =>
  state.documents.activeDocumentId;
export const selectDocumentsError = (state: RootState) => state.documents.error;

export const selectOpenDocument = createSelector(
  [selectAllDocuments, selectActiveDocumentId],
  (documents, activeId): Document | null => {
    if (!activeId) return null;
    return documents.find((doc) => doc.id === activeId) || null;
  }
);

export const makeSelectDocumentById = () =>
  createSelector(
    [selectAllDocuments, (_state: RootState, id: string) => id],
    (documents, id): Document | null => {
      return documents.find((doc) => doc.id === id) || null;
    }
  );
