import clsx from "clsx";
import "input.css";

export const Input = ({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) => {
  return <input type={type} className={clsx("input", className)} {...props} />;
};
