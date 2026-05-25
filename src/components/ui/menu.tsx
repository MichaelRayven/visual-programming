import clsx from "clsx";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./menu.module.css";

export const DropdownContext = createContext<{ close: () => void } | null>(
  null
);

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
  menuClassName?: string;
}

export function Dropdown({
  trigger,
  children,
  align = "right",
  className,
  menuClassName,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <DropdownContext.Provider value={{ close }}>
      <div
        ref={containerRef}
        className={clsx(styles.menuDropdownWrapper, className)}
      >
        <span
          onClick={() => setOpen((prev) => !prev)}
          className={styles.dropdownTriggerContainer}
          aria-expanded={open}
        >
          {trigger}
        </span>
        {open && (
          <MenuContent
            className={clsx(
              styles.menuDropdown,
              align === "left" && styles.alignLeft,
              menuClassName
            )}
          >
            {children}
          </MenuContent>
        )}
      </div>
    </DropdownContext.Provider>
  );
}

export const MenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={clsx(styles.menuContent, className)} {...props} />
));
MenuContent.displayName = "MenuContent";

export const MenuItem = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { danger?: boolean }
>(({ className, danger, onClick, ...props }, ref) => {
  const dropdown = useContext(DropdownContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    }
    if (dropdown) {
      dropdown.close();
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      className={clsx(
        styles.menuItem,
        danger && styles.menuItemDanger,
        className
      )}
      onClick={handleClick}
      {...props}
    />
  );
});
MenuItem.displayName = "MenuItem";

export const MenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={clsx(styles.menuSeparator, className)} {...props} />
));
MenuSeparator.displayName = "MenuSeparator";
