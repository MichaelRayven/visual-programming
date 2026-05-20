import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ContextMenuContext,
  type Position,
  useContextMenu,
} from "@/hooks/useContextMenu";
import { MenuContent, MenuItem } from "./menu";

type ContextMenuProps = {
  children: React.ReactNode;
};

export const ContextMenu = ({ children }: ContextMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  return (
    <ContextMenuContext.Provider
      value={{ isOpen, setIsOpen, position, setPosition }}
    >
      {children}
    </ContextMenuContext.Provider>
  );
};

type ContextMenuTriggerProps = {
  children: React.ReactNode;
  className?: string;
} & React.ComponentPropsWithoutRef<"div">;

export const ContextMenuTrigger = ({
  children,
  className,
  onContextMenu,
  ...props
}: ContextMenuTriggerProps) => {
  const { setIsOpen, setPosition } = useContextMenu();

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOpen(true);
    setPosition({ x: e.clientX, y: e.clientY });
    if (onContextMenu) onContextMenu(e);
  };

  return (
    <div
      className={clsx("context-menu-trigger", className)}
      onContextMenu={handleContextMenu}
      {...props}
    >
      {children}
    </div>
  );
};

type ContextMenuContentProps = {
  children: React.ReactNode;
  className?: string;
} & React.ComponentPropsWithoutRef<"div">;

export const ContextMenuContent = ({
  children,
  className,
  style,
  ...props
}: ContextMenuContentProps) => {
  const { isOpen, setIsOpen, position } = useContextMenu();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("contextmenu", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("contextmenu", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const menuContent = (
    <MenuContent
      ref={menuRef}
      className={className}
      style={{
        top: position.y,
        left: position.x,
        position: "fixed",
        zIndex: "var(--z-popover)",
        ...style,
      }}
      {...props}
    >
      {children}
    </MenuContent>
  );

  return typeof document !== "undefined"
    ? createPortal(menuContent, document.body)
    : menuContent;
};

type ContextMenuItemProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
} & React.ComponentPropsWithoutRef<"button">;

export const ContextMenuItem = ({
  children,
  className,
  onClick,
  disabled,
  ...props
}: ContextMenuItemProps) => {
  const { setIsOpen } = useContextMenu();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (onClick) onClick(e);
    setIsOpen(false);
  };

  return (
    <MenuItem
      className={className}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </MenuItem>
  );
};
