import {
  type CreateDocumentErrors,
  type CreateDocumentState,
} from "@/pages/dashboard/types/createDocument";

export function validateCreateDocument(
  state: CreateDocumentState
): CreateDocumentErrors {
  const errors: CreateDocumentErrors = {};
  const r = parseInt(state.rows);
  const c = parseInt(state.cols);

  if (!state.title.trim()) errors.title = "Название не может быть пустым";

  if (isNaN(r)) errors.rows = "Укажите целое число";
  if (isNaN(c)) errors.cols = "Укажите целое число";

  if (r <= 0) errors.rows = "Количество строк должно быть больше 0";
  if (c <= 0) errors.cols = "Количество столбцов должно быть больше 0";

  return errors;
}
