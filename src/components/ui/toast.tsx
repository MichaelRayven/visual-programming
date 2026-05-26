import {
  AlertCircleIcon,
  BellIcon,
  CheckCircleIcon,
  InfoIcon,
  XIcon,
} from "lucide-react";
import type React from "react";
import type { NotificationType } from "@/store/uiSlice";
import styles from "./toast.module.css";

type ToastProps = {
  type: NotificationType;
  message: React.ReactNode;
  icon?: React.ReactNode;
  onClose: () => void;
  isExiting: boolean;
};

export function Toast({ type, message, icon, onClose, isExiting }: ToastProps) {
  const getDefaultIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircleIcon size={20} className={styles.successIcon} />;
      case "error":
        return <AlertCircleIcon size={20} className={styles.errorIcon} />;
      case "info":
        return <InfoIcon size={20} className={styles.infoIcon} />;
      case "default":
      default:
        return <BellIcon size={20} className={styles.defaultIcon} />;
    }
  };

  const typeClass = styles[type] || styles.default;
  const animationClass = isExiting ? styles.slideOut : styles.slideIn;

  return (
    <div className={`${styles.toastWrapper} ${typeClass} ${animationClass}`}>
      <div className={styles.iconContainer}>{icon || getDefaultIcon()}</div>
      <div className={styles.textContainer}>{message}</div>
      <button
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Закрыть уведомление"
      >
        <XIcon size={16} />
      </button>
    </div>
  );
}
