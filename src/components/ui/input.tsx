import clsx from "clsx";
import styles from "./input.module.css";

export const Input = ({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) => {
  return (
    <input type={type} className={clsx(styles.input, className)} {...props} />
  );
};
