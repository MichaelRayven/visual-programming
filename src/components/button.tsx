import clsx from "clsx";
import styles from "./Button.module.css";

type ButtonProps = {
  variant?: "primary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "icon";
} & React.ComponentProps<"button">;

export function Button({
  variant = "primary",
  type = "button",
  size,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        styles.btn,
        styles[variant],
        size === "sm" && styles.sm,
        size === "icon" && styles.icon,
        className
      )}
      {...props}
    />
  );
}
