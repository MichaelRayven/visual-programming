import { XIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";
import styles from "./dialog.module.css";

type DialogProps = {
  open?: boolean;
  onOpenChange?: (value: boolean) => void;
  trigger?: ReactNode;
  content?: ReactNode;
  title?: ReactNode;
  footer?: ReactNode;
};

export function Dialog({
  open: externalOpen,
  onOpenChange,
  trigger,
  content,
  title,
  footer,
}: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  return (
    <>
      <DialogPortal
        onOpenChange={(open) => handleOpenChange(open)}
        open={open}
        content={content}
        footer={footer}
        title={title}
      />
      {trigger && (
        <Button
          className="dialog-trigger"
          onClick={() => handleOpenChange(true)}
        >
          {trigger}
        </Button>
      )}
    </>
  );
}

type DialogPortalProps = {
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  content?: ReactNode;
  title?: ReactNode;
  footer?: ReactNode;
};

function DialogPortal({
  onOpenChange = () => null,
  open,
  content,
  title,
  footer,
}: DialogPortalProps) {
  return createPortal(
    open && (
      <div className={styles.modalOverlay}>
        <div className={styles.dialog}>
          <div className={styles.dialogHeader}>
            <p className={styles.dialogTitle}>{title}</p>
            <div className={styles.dialogAction}>
              <button
                type="button"
                className={styles.dialogClose}
                onClick={() => onOpenChange(false)}
                aria-label="Close dialog"
              >
                <XIcon />
              </button>
            </div>
          </div>
          <div className={styles.dialogContent}>{content}</div>
          <div className={styles.dialogFooter}>{footer}</div>
        </div>
      </div>
    ),
    document.body
  );
}
