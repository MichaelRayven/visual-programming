import { readFile, writeFile } from 'node:fs/promises';

export function csvToJSON(input: string[], delimiter: string): object[] {
  if (input.length === 0) {
    throw new Error('Input array is empty');
  }

  // Получаем заголовки
  const headers = input[0]!.split(delimiter).map(h => h.trim());

  if (headers.length === 0 || headers.some(h => h === '')) {
    throw new Error('Headers are empty or contain empty values');
  }

  const result: object[] = [];

  // Получаем значения
  for (let i = 1; i < input.length; i++) {
    const row = input[i] ?? "";
    const values = row.split(delimiter).map(v => v.trim());

    if (values.length !== headers.length) {
      throw new Error(`Row ${i + 1} has ${values.length} values, but ${headers.length} headers were provided`);
    }


    // Создаем объект для текущей строки
    const obj: Record<string, any> = {};
    for (const [j, header] of headers.entries()) {
      const value = values[j];

      if (value !== '' && !isNaN(Number(value))) {
        obj[header] = Number(value);
      } else {
        obj[header] = value;
      }
    }

    result.push(obj);
  }

  return result;
}

export async function formatCSVFileToJSONFile(
  input: string,
  output: string,
  delimiter: string
): Promise<void> {
  try {
    const data = await readFile(input, 'utf-8');
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const jsonData = csvToJSON(lines, delimiter);
    await writeFile(output, JSON.stringify(jsonData, null, 2));
  } catch (error) {
    throw new Error(`Error processing CSV file: ${error instanceof Error ? error.message : String(error)}`);
  }
}