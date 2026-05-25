import { type SubmitEventHandler, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import { FieldError, FieldGroup, FieldInput, FieldLabel } from "./ui/field";

type RenameDocumentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTitle: string;
  onRename: (newTitle: string) => void;
};

export function RenameDocumentDialog({
  open,
  onOpenChange,
  currentTitle,
  onRename,
}: RenameDocumentDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [title, setTitle] = useState(currentTitle);
  const [error, setError] = useState("");

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Название не может быть пустым");
      return;
    }

    onRename(trimmedTitle);
    setError("");
    setTitle("");
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (open) {
          setTitle(currentTitle);
          setError("");
        }
      }}
      title="Переименовать документ"
      content={
        <form onSubmit={handleSubmit} ref={formRef}>
          <FieldGroup>
            <FieldLabel htmlFor="rename-title">Новое название</FieldLabel>
            <FieldInput
              id="rename-title"
              value={title}
              error={!!error}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              autoFocus
            />
            {error && <FieldError>{error}</FieldError>}
          </FieldGroup>
        </form>
      }
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={() => formRef.current?.requestSubmit()}>
            Переименовать
          </Button>
        </>
      }
    />
  );
}
