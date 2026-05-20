import clsx from "clsx";
import React from "react";
import "./menu.css";

export const MenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={clsx("menu-content", className)} {...props} />
));
MenuContent.displayName = "MenuContent";

export const MenuItem = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { danger?: boolean }
>(({ className, danger, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={clsx("menu-item", danger && "menu-item-danger", className)}
    {...props}
  />
));
MenuItem.displayName = "MenuItem";

export const MenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={clsx("menu-separator", className)} {...props} />
));
MenuSeparator.displayName = "MenuSeparator";
