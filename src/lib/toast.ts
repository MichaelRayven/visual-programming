import { store } from "@/store";
import { type NotificationType, uiActions } from "@/store/uiSlice";

export const toast = {
  show: (
    message: string,
    options?: { type?: NotificationType; duration?: number }
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    store.dispatch(
      uiActions.addNotification({
        id,
        type: options?.type || "default",
        message,
        duration: options?.duration,
      })
    );
    return id;
  },

  dismiss: (id: string) => {
    store.dispatch(uiActions.removeNotification(id));
  },
};
