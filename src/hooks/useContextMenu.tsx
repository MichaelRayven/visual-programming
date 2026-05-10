import { createContext, useContext } from "react";

export type Position = { x: number; y: number };

type ContextMenuContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  position: Position;
  setPosition: (pos: Position) => void;
};

export const ContextMenuContext = createContext<ContextMenuContextType | null>(
  null
);

export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error(
      "useContextMenu must be used within a ContextMenu provider"
    );
  }
  return context;
};
