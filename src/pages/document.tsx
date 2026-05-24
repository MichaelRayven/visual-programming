import { AlertCircleIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useBlocker, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Table } from "@/components/table";
import {
  useDocumentById,
  useDocumentLoadingStatus,
  useDocumentSaveStatus,
} from "@/hooks/useDocumentStore";
import { useAppDispatch, useAppSelector } from "@/store";
import { documentsActions, fetchDocumentById } from "@/store/documentsSlice";
import { spreadsheetActions } from "@/store/spreadsheetSlice";
import "./document.css";

export function DocumentPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const document = useDocumentById(documentId || "");
  const loadingStatus = useDocumentLoadingStatus();
  const saveStatus = useDocumentSaveStatus();
  const error = useAppSelector((state) => state.documents.error);

  useEffect(() => {
    if (documentId) {
      dispatch(documentsActions.setActiveDocumentId(documentId));
      // Retrieve document details on mount/reload to assert permission & populate state
      dispatch(fetchDocumentById(documentId));
    }
    return () => {
      dispatch(documentsActions.setActiveDocumentId(null));
    };
  }, [documentId, dispatch]);

  const initializedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (document && initializedIdRef.current !== document.id) {
      dispatch(spreadsheetActions.initTable(document.tableSnapshot));
      initializedIdRef.current = document.id;
    }
  }, [document, dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "saving") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveStatus, dispatch]);

  const blocker = useBlocker(() => {
    return saveStatus === "saving";
  });

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  // Render 403 Forbidden Access Page State
  if (loadingStatus === "failed" && error === "403") {
    return (
      <div className="forbidden-page-container">
        <div className="forbidden-card">
          <div className="forbidden-icon-wrapper">
            <AlertCircleIcon size={32} />
          </div>
          <h1 className="forbidden-title">Доступ ограничен (403)</h1>
          <p className="forbidden-message">
            Вы не являетесь владельцем этого документа и не имеете прав на его
            просмотр.
          </p>
          <Button variant="primary" size="md" onClick={handleBackToDashboard}>
            Вернуться в Мои документы
          </Button>
        </div>
      </div>
    );
  }

  if (!document && loadingStatus === "loading") {
    return (
      <div className="not-found-container">
        <div className="not-found-card">
          <LoadingSpinner size={40} className="document-loading-icon" />
          <h2 className="not-found-subtitle document-loading-title">
            Загрузка документа...
          </h2>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="not-found-container">
        <div className="not-found-card">
          <AlertCircleIcon size={48} className="document-error-icon" />
          <h2 className="not-found-subtitle">Документ не найден</h2>
          <p className="not-found-description">
            К сожалению, запрашиваемый вами документ не существует или к нему
            нет доступа.
          </p>
          <Button variant="primary" size="md" onClick={handleBackToDashboard}>
            Вернуться в список документов
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="document-page">
      <main className="document-main">
        <Table snapshot={document.tableSnapshot} />
      </main>

      {/* Unsaved changes blocker dialog */}
      <Dialog
        open={blocker.state === "blocked"}
        onOpenChange={() => {
          if (blocker.state === "blocked") {
            blocker.reset();
          }
        }}
        title="Несохраняемые изменения"
        content="В данный момент происходит автосохранение документа. Если вы покинете страницу сейчас, последние изменения могут быть утеряны. Вы уверены, что хотите уйти?"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                if (blocker.state === "blocked") {
                  blocker.reset();
                }
              }}
            >
              Остаться
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (blocker.state === "blocked") {
                  blocker.proceed();
                }
              }}
            >
              Уйти
            </Button>
          </>
        }
      />
    </div>
  );
}
