import { useEffect } from "react";
import { useDocumentList } from "@/hooks/useDocumentStore";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchDocuments } from "@/store/documentsSlice";
import { selectUser } from "./selectors";

export function useProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const documents = useDocumentList();

  // Ensure documents count and user data are loaded
  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  const registrationDate = user?.registeredAt
    ? new Date(user.registeredAt).toLocaleDateString("ru-RU")
    : new Date().toLocaleDateString("ru-RU");

  return {
    user,
    documentsCount: documents.length,
    registrationDate,
  };
}
