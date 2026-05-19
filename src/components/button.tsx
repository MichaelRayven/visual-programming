import clsx from "clsx";
import styles from "./button.module.css";

type ButtonProps = {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md";
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
        {
          [styles.btnPrimary]: variant === "primary",
          [styles.btnOutline]: variant === "outline",
          [styles.btnGhost]: variant === "ghost",
          [styles.btnSm]: size === "sm",
        },
        className
      )}
      {...props}
    />
  );
}
