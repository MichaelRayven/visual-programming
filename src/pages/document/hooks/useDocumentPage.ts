import { useCallback, useEffect, useRef } from "react";
import {
  type BlockerFunction,
  useBlocker,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  useDocumentById,
  useDocumentLoadingStatus,
  useDocumentSaveStatus,
} from "@/hooks/useDocumentStore";
import { useAppDispatch, useAppSelector } from "@/store";
import { documentsActions } from "@/store/documentsSlice";
import { spreadsheetActions } from "@/store/spreadsheetSlice";

export function useDocumentPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const document = useDocumentById(documentId || "");
  const loadingStatus = useDocumentLoadingStatus();
  const saveStatus = useDocumentSaveStatus();
  const error = useAppSelector((state) => state.documents.error);

  const initializedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (documentId) {
      dispatch(documentsActions.setActiveDocumentId(documentId));
      dispatch(documentsActions.fetchDocumentById(documentId));
    }
    return () => {
      dispatch(documentsActions.setActiveDocumentId(null));
    };
  }, [documentId, dispatch]);

  useEffect(() => {
    if (document && initializedIdRef.current !== document.id) {
      dispatch(spreadsheetActions.initTable(document.tableSnapshot));
      initializedIdRef.current = document.id;
    }
  }, [document, dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isSpreadsheetInput =
        target.classList?.contains("table-cell-input") ||
        target.classList?.contains("table-top-bar-input");
      const isForeignInput =
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA") &&
        !isSpreadsheetInput;

      if (isForeignInput) return;

      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        dispatch(spreadsheetActions.triggerSave());
      } else if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        dispatch(spreadsheetActions.undo());
      } else if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        dispatch(spreadsheetActions.redo());
      } else if (e.ctrlKey && e.shiftKey && e.key === "Z") {
        e.preventDefault();
        dispatch(spreadsheetActions.redo());
      } else if (e.ctrlKey && e.key === "c") {
        e.preventDefault();
        dispatch(spreadsheetActions.copySelection());
      } else if (e.ctrlKey && e.key === "x") {
        e.preventDefault();
        dispatch(spreadsheetActions.cutSelection());
      } else if (e.ctrlKey && e.key === "v") {
        e.preventDefault();
        dispatch(spreadsheetActions.pasteSelection());
      } else if (e.ctrlKey && e.key === "a") {
        e.preventDefault();
        dispatch(spreadsheetActions.selectAll());
      } else if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        dispatch(spreadsheetActions.toggleBold());
      } else if (e.ctrlKey && e.key === "i") {
        e.preventDefault();
        dispatch(spreadsheetActions.toggleItalic());
      } else if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
        dispatch(spreadsheetActions.toggleUnderline());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "saving") {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  const shouldBlock = useCallback<BlockerFunction>(
    () => saveStatus === "saving",
    [saveStatus]
  );

  const blocker = useBlocker(shouldBlock);

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return {
    document,
    loadingStatus,
    error,
    blocker,
    handleBackToDashboard,
  };
}
