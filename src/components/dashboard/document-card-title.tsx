import { useEffect, useState } from "react";
import { Input } from "@/components/input";

type DocumentCardTitleProps = {
  title?: string;
  onTitleChange?: (value: string) => void;
};

export function DocumentCardTitle({
  title = "",
  onTitleChange,
}: DocumentCardTitleProps) {
  const [value, setValue] = useState(title);

  // Update local state when prop changes
  useEffect(() => {
    setValue(title);
  }, [title]);

  return (
    <Input
      className="document-card-title"
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
