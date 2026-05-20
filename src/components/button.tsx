import clsx from "clsx";
import "./button.css";

type ButtonProps = {
  variant?: "primary" | "outline" | "ghost" | "destructive";
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
        "btn",
        variant === "primary" && "btn-primary",
        variant === "outline" && "btn-outline",
        variant === "ghost" && "btn-ghost",
        variant === "destructive" && "btn-danger",
        size === "sm" && "btn-sm",
        className
      )}
      {...props}
    />
  );
}
