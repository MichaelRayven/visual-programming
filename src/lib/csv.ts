export const exportToCSV = (data: string[][]): string => {
  let csvContent = "\uFEFF";

  for (const row of data) {
    const escapedRow = row.map(
      (cell) => `"${(cell || "").replace(/"/g, '""')}"`
    );
    csvContent += escapedRow.join(",") + "\r\n";
  }

  return csvContent;
};

export const parseCSV = (text: string): string[][] => {
  const cleanText = text.startsWith("\uFEFF") ? text.slice(1) : text;
  return cleanText
    .split(/\r?\n/)
    .filter((row) => row.trim() !== "")
    .map((row) =>
      row
        .split(",")
        .map((cell) => cell.replace(/^"|"$/g, "").replace(/""/g, '"'))
    );
};
