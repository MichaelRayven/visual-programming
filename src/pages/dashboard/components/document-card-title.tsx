import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import styles from "../dashboard-page.module.css";

type DocumentCardTitleProps = {
  title?: string;
  onTitleChange?: (value: string) => void;
};

export function DocumentCardTitle({
  title = "",
  onTitleChange,
}: DocumentCardTitleProps) {
  const [value, setValue] = useState(title);

  useEffect(() => {
    setValue(title);
  }, [title]);

  return (
    <Input
      className={styles.documentCardTitle}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        if (value !== "") {
          onTitleChange?.(value);
        } else {
          setValue(title);
        }
      }}
      onClick={(e) => e.stopPropagation()}
    />
  );
}
