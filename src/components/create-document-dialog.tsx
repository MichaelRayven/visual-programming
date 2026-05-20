import { type SubmitEventHandler, useRef, useState } from "react";
import { useDocumentStore, useUIModals } from "@/hooks/useDocumentStore";
import { Button } from "./button";
import "./create-document-dialog.css";
import { Dialog } from "./dialog";
import { FieldError, FieldGroup, FieldInput, FieldLabel } from "./field";

export function CreateDocumentDialog() {
  const documentStore = useDocumentStore();
  const { createOpen } = useUIModals();

  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState({ rows: "", cols: "", title: "" });
  const [errors, setErrors] = useState<{
    title?: string;
    rows?: string;
    cols?: string;
  }>({});

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const r = parseInt(values.rows);
    const c = parseInt(values.cols);

    const newErrors: typeof errors = {};
    if (isNaN(r) || r <= 0) newErrors.rows = "Укажите корректное число";
    if (isNaN(c) || c <= 0) newErrors.cols = "Укажите корректное число";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    documentStore.createDocument(values.title, r, c);
    setErrors({});
    setValues({ rows: "", cols: "", title: "" });
    documentStore.setCreateModalOpen(false);
  };

  return (
    <Dialog
      open={createOpen}
      onOpenChange={(open) => documentStore.setCreateModalOpen(open)}
      trigger="Создать файл"
      title="Новый документ"
      content={
        <form ref={formRef} onSubmit={handleSubmit}>
          <FieldGroup>
            <FieldLabel htmlFor="doc-name">Название</FieldLabel>
            <FieldInput
              id="doc-name"
              value={values.title}
              onChange={(e) => setValues({ ...values, title: e.target.value })}
            />
          </FieldGroup>

          <FieldLabel htmlFor="doc-rows">Начальный размер</FieldLabel>
          <div className="create-doc-size-grid">
            <FieldGroup className="create-doc-size-grid-item">
              <FieldInput
                id="doc-rows"
                placeholder="Строк"
                value={values.rows}
                error={!!errors.rows}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d+$/.test(v)) {
                    setValues({ ...values, rows: v });
                    setErrors({ ...errors, rows: undefined });
                  }
                }}
              />
              {errors.rows && <FieldError>{errors.rows}</FieldError>}
            </FieldGroup>

            <span className="create-doc-size-multiplier">×</span>

            <FieldGroup className="create-doc-size-grid-item">
              <FieldInput
                placeholder="Столбцов"
                value={values.cols}
                error={!!errors.cols}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d+$/.test(v)) {
                    setValues({ ...values, cols: v });
                    setErrors({ ...errors, cols: undefined });
                  }
                }}
              />
              {errors.cols && <FieldError>{errors.cols}</FieldError>}
            </FieldGroup>
          </div>
        </form>
      }
      footer={
        <Button onClick={() => formRef.current?.requestSubmit()}>
          Создать
        </Button>
      }
    />
  );
}
