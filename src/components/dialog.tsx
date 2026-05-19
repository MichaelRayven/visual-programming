import { createPortal } from "react-dom";
import "./dialog.css";
import { XIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "./button";

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
      <div id="modal">
        <div className="dialog">
          <div className="dialog-header">
            <p className="dialog-title">{title}</p>
            <div className="dialog-action">
              <Button
                className="dialog-close"
                onClick={() => onOpenChange(false)}
              >
                <XIcon />
              </Button>
            </div>
          </div>
          <div className="dialog-content">{content}</div>
          <div className="dialog-footer">{footer}</div>
        </div>
      </div>
    ),
    document.body
  );
}
