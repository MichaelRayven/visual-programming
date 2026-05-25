import { type SubmitEventHandler, useState } from "react";
import { useDocumentStore } from "@/hooks/useDocumentStore";
import { useAppDispatch } from "@/store";
import { documentsActions } from "@/store/documentsSlice";
import type {
  CreateDocumentErrors,
  CreateDocumentState,
} from "../types/createDocument";
import { validateCreateDocument } from "../utils/validateCreateDocument";

export function useCreateDocumentForm(onSuccess?: () => void) {
  const dispatch = useAppDispatch();
  const documentStore = useDocumentStore();

  const [formState, setFormState] = useState<CreateDocumentState>({
    title: "",
    rows: "",
    cols: "",
  });

  const [errors, setErrors] = useState<CreateDocumentErrors>({});
  const [loading, setLoading] = useState(false); // Added to match the rename hook structure

  const handleChange = (field: keyof CreateDocumentState, value: string) => {
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

    // Matching the rename validation logic wrapper style
    const validationErrors = validateCreateDocument(formState);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Assuming this could be asynchronous or just standard store sync processing
      dispatch(
        documentsActions.createDocument({
          title: formState.title.trim(),
          rows: parseInt(formState.rows),
          cols: parseInt(formState.cols),
        })
      );

      setFormState({ title: "", rows: "", cols: "" });
      documentStore.setCreateModalOpen(false);
      onSuccess?.();
    } catch (err) {
      setErrors({
        form: (err as string) || "Не удалось создать документ",
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
