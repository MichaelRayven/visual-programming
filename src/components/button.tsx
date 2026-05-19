import clsx from "clsx";

type ButtonProps = {
  variant?: "primary" | "outline";
} & React.ComponentProps<"button">;

export function Button({
  variant = "primary",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        "btn",
        {
          "btn-primary": variant == "primary",
          "btn-outline": variant == "outline",
        },
        className
      )}
      {...props}
    />
  );
}
