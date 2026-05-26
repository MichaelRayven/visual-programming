import { useMemo } from "react";
import { useAppSelector } from "@/store";
import {
  makeSelectDocumentById,
  selectAllDocuments,
  selectOpenDocument,
} from "@/store/selectors/document";

export function useDocumentList() {
  return useAppSelector(selectAllDocuments);
}

export function useOpenDocument() {
  return useAppSelector(selectOpenDocument);
}

export function useDocumentById(id: string) {
  const selectDocumentById = useMemo(makeSelectDocumentById, []);
  return useAppSelector((state) => selectDocumentById(state, id));
}

export function useUIModals() {
  return useAppSelector((state) => state.ui.modals);
}
