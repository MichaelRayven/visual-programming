import { createPortal } from "react-dom";
import "./dialog.css";
import { XIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "./button";

type DialogProps = {
  trigger?: ReactNode;
  content?: ReactNode;
  title?: ReactNode;
  footer?: ReactNode;
};

export function Dialog({ trigger, content, title, footer }: DialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <DialogPortal
        onOpenChange={(open) => setOpen(open)}
        open={open}
        content={content}
        footer={footer}
        title={title}
      />
      <Button className="dialog-trigger" onClick={() => setOpen(true)}>
        {trigger}
      </Button>
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
