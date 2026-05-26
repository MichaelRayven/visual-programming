import { useCallback } from "react";
import { type BlockerFunction, useBlocker } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useAppSelector } from "@/store";

export function UnsavedChangesBlocker() {
  const saveStatus = useAppSelector((state) => state.ui.saveStatus);

  const shouldBlock = useCallback<BlockerFunction>(
    () => saveStatus === "saving",
    [saveStatus]
  );

  const blocker = useBlocker(shouldBlock);

  return (
    <Dialog
      open={blocker.state === "blocked"}
      onOpenChange={() => {
        if (blocker.state === "blocked") {
          blocker.reset();
        }
      }}
      title="Несохраняемые изменения"
      content="В данный момент происходит автосохранение документа. Если вы покинете страницу сейчас, последние изменения могут быть утеряны. Вы уверены, что хотите уйти?"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => {
              if (blocker.state === "blocked") {
                blocker.reset();
              }
            }}
          >
            Остаться
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (blocker.state === "blocked") {
                blocker.proceed();
              }
            }}
          >
            Уйти
          </Button>
        </>
      }
    />
  );
}
