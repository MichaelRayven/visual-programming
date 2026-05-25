import { type SubmitEventHandler, useEffect, useState } from "react";
import {
  useDocumentById,
  useDocumentStore,
  useUIModals,
} from "@/hooks/useDocumentStore";
import {
  type RenameDocumentErrors,
  type RenameDocumentState,
} from "@/pages/dashboard/types/renameDocument";
import { validateRenameDocument } from "@/pages/dashboard/utils/validateRenameDocument";
import { useAppDispatch } from "@/store";
import { documentsActions } from "@/store/documentsSlice";

export function useRenameDocumentForm() {
  const dispatch = useAppDispatch();
  const documentStore = useDocumentStore();
  const { renameOpen } = useUIModals();
  const document = useDocumentById(renameOpen?.id ?? "");

  const [formState, setFormState] = useState<RenameDocumentState>({
    name: document?.title ?? "",
  });

  const [errors, setErrors] = useState<RenameDocumentErrors>({});
  const [loading, setLoading] = useState(false);

  // Keep document title in sync
  useEffect(() => {
    if (document) {
      setFormState((prev) => ({
        ...prev,
        name: document.title,
      }));
    }
  }, [document]);

  const handleChange = (field: keyof RenameDocumentState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
    if (errors.form) {
      setErrors((prev) => ({
        ...prev,
        form: undefined,
      }));
    }
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const { isValid, errors: validationErrors } =
      validateRenameDocument(formState);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (!document) return;
      await dispatch(
        documentsActions.updateDocument({
          id: document.id,
          title: formState.name.trim(),
        })
      ).unwrap();
      setFormState({ name: "" });
      documentStore.setRenameModal(null);
    } catch (err) {
      setErrors({
        form: (err as string) || "Не удалось переименовать документ",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formState,
    errors,
    loading,
    handleChange,
    handleSubmit,
  };
}
