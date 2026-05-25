// biome-ignore lint/suspicious/noExplicitAny: we have to allow any function argument
export function debounce<T extends (...args: any[]) => unknown>(
  func: T,
  timeout: number
) {
  let timeoutId: number;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "только что";
  if (diffMins < 60) return `${diffMins} мин. назад`;
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays < 7) return `${diffDays} дн. назад`;

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function parseDateString(value: string): Date | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;

  // Pure numbers (like "12345" or "2026") are not accepted as valid dates
  if (/^\d+$/.test(trimmed)) {
    return null;
  }

  // 1. Try split parsing with typical separators: '.', '-', '/'
  const separators = [".", "-", "/"];
  for (const sep of separators) {
    const parts = trimmed.split(sep);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY.MM.DD
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (
          !isNaN(day) &&
          !isNaN(month) &&
          !isNaN(year) &&
          year >= 1000 &&
          year <= 9999
        ) {
          const d = new Date(year, month, day);
          if (!isNaN(d.getTime())) return d;
        }
      } else {
        // DD.MM.YYYY or MM.DD.YYYY
        const dayOrMonth = parseInt(parts[0], 10);
        const monthOrDay = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        if (
          !isNaN(dayOrMonth) &&
          !isNaN(monthOrDay) &&
          !isNaN(year) &&
          year >= 1000 &&
          year <= 9999
        ) {
          const d = new Date(year, monthOrDay, dayOrMonth);
          if (!isNaN(d.getTime())) return d;
        }
      }
    }
  }

  // 2. Try standard Date parsing for other formats, as long as it's not a pure number
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d;
  }

  return null;
}

export function formatValue(
  value: string | number | boolean,
  format?: "number" | "percent" | "currency" | "date"
): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";

  const strVal = String(value);
  if (strVal.startsWith("#")) return strVal; // spreadsheet formula errors

  if (!format) return strVal;

  const num = Number(value);
  const hasNum = !isNaN(num) && strVal.trim() !== "";

  switch (format) {
    case "number":
      if (hasNum) {
        return num.toLocaleString("ru-RU");
      }
      return strVal;
    case "percent":
      if (hasNum) {
        return `${(num * 100).toLocaleString("ru-RU")}%`;
      }
      return strVal;
    case "currency":
      if (hasNum) {
        return new Intl.NumberFormat("ru-RU", {
          style: "currency",
          currency: "RUB",
          maximumFractionDigits: 2,
        }).format(num);
      }
      return strVal;
    case "date": {
      const d = parseDateString(strVal);
      if (d) {
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
      }
      return strVal;
    }
    default:
      return strVal;
  }
}
