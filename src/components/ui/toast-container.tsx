import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Toast } from "@/components/ui/toast";
import { toast } from "@/lib/toast";
import { useAppSelector } from "@/store";
import type { Notification } from "@/store/uiSlice";
import styles from "./toast.module.css";

export function ToastContainer() {
  const queue = useAppSelector((state) => state.ui.notifications);
  const [activeToast, setActiveToast] = useState<Notification | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let element = document.getElementById("toast-portal");
    if (!element) {
      element = document.createElement("div");
      element.id = "toast-portal";
      document.body.appendChild(element);
    }
    setPortalElement(element);

    return () => {
      if (element && element.parentNode === document.body) {
        document.body.removeChild(element);
      }
    };
  }, []);

  useEffect(() => {
    if (queue.length > 0 && !activeToast && !isExiting) {
      setActiveToast(queue[0]);
    }
  }, [queue, activeToast, isExiting]);

  const handleClose = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);

    setTimeout(() => {
      if (activeToast) {
        toast.dismiss(activeToast.id);
        setActiveToast(null);
      }
      setIsExiting(false);
    }, 250);
  }, [activeToast, isExiting]);

  useEffect(() => {
    if (!activeToast) return;

    const duration = activeToast.duration ?? 4000;
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [activeToast, handleClose]);

  if (!portalElement || !activeToast) return null;

  return createPortal(
    <div className={styles.toastOverlay}>
      <Toast
        key={activeToast.id}
        type={activeToast.type}
        message={activeToast.message}
        onClose={handleClose}
        isExiting={isExiting}
      />
    </div>,
    portalElement
  );
}
