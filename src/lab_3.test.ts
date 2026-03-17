import { describe, it, expect, vi, beforeEach, afterEach, MockedFunction } from 'vitest';
import { csvToJSON, formatCSVFileToJSONFile } from './lab_3';
import { readFile, writeFile } from "node:fs/promises"

vi.mock('node:fs/promises', () => ({
    readFile: vi.fn(),
    writeFile: vi.fn()
}));

describe('csvToJSON', () => {
    it('should convert CSV to JSON correctly with semicolon delimiter', () => {
        const input = [
            'p1;p2;p3;p4',
            '1;A;b;c',
            '2;B;v;d'
        ];

        const result = csvToJSON(input, ';');

        expect(result).toEqual([
            { p1: 1, p2: 'A', p3: 'b', p4: 'c' },
            { p1: 2, p2: 'B', p3: 'v', p4: 'd' }
        ]);
    });

    it('should convert CSV to JSON correctly with comma delimiter', () => {
        const input = [
            'name,age,city',
            'John,30,New York',
            'Jane,25,Los Angeles'
        ];

        const result = csvToJSON(input, ',');

        expect(result).toEqual([
            { name: 'John', age: 30, city: 'New York' },
            { name: 'Jane', age: 25, city: 'Los Angeles' }
        ]);
    });

    it('should handle numeric values correctly', () => {
        const input = [
            'id,price,quantity',
            '1,19.99,5',
            '2,29.99,3'
        ];

        const result = csvToJSON(input, ',');

        expect(result).toEqual([
            { id: 1, price: 19.99, quantity: 5 },
            { id: 2, price: 29.99, quantity: 3 }
        ]);
    });

    it('should throw error when input array is empty', () => {
        expect(() => csvToJSON([], ',')).toThrow('Input array is empty');
    });

    it('should throw error when headers are empty', () => {
        const input = [''];
        expect(() => csvToJSON(input, ',')).toThrow('Headers are empty or contain empty values');
    });

    it('should throw error when row has different number of values than headers', () => {
        const input = [
            'a,b,c',
            '1,2'
        ];

        expect(() => csvToJSON(input, ',')).toThrow('Row 2 has 2 values, but 3 headers were provided');
    });

    it('should handle whitespace around values', () => {
        const input = [
            ' name , age , city ',
            ' John , 30 , New York '
        ];

        const result = csvToJSON(input, ',');

        expect(result).toEqual([
            { name: 'John', age: 30, city: 'New York' }
        ]);
    });

    it('should handle empty values', () => {
        const input = [
            'a,b,c',
            '1,,3'
        ];

        const result = csvToJSON(input, ',');

        expect(result).toEqual([
            { a: 1, b: '', c: 3 }
        ]);
    });

    it('should handle tab delimiter', () => {
        const input = [
            'id\tname\tvalue',
            '1\tTest\t100'
        ];

        const result = csvToJSON(input, '\t');

        expect(result).toEqual([
            { id: 1, name: 'Test', value: 100 }
        ]);
    });
});

describe('formatCSVFileToJSONFile', () => {
    // Cleanup
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call readFile and writeFile with correct parameters', async () => {
        const csvContent = 'name,age\nJohn,30\nJane,25';
        const expectedJson = JSON.stringify([
            { name: 'John', age: 30 },
            { name: 'Jane', age: 25 }
        ], null, 2);

        vi.mocked(readFile).mockResolvedValue(csvContent);
        vi.mocked(writeFile).mockResolvedValue(undefined);

        await formatCSVFileToJSONFile('input.csv', 'output.json', ',');

        expect(readFile).toHaveBeenCalledOnce();
        expect(readFile).toHaveBeenCalledWith('input.csv', 'utf-8');

        expect(writeFile).toHaveBeenCalledOnce();
        expect(writeFile).toHaveBeenCalledWith('output.json', expectedJson);
    });

    it('should handle errors from readFile', async () => {
        vi.mocked(readFile).mockRejectedValue(new Error('File not found'));

        await expect(
            formatCSVFileToJSONFile('input.csv', 'output.json', ',')
        ).rejects.toThrow('Error processing CSV file: File not found');

        expect(writeFile).not.toHaveBeenCalled();
    });

    it('should handle errors from csvToJSON', async () => {
        vi.mocked(readFile).mockResolvedValue('');

        await expect(
            formatCSVFileToJSONFile('input.csv', 'output.json', ',')
        ).rejects.toThrow('Error processing CSV file: Input array is empty');

        expect(writeFile).not.toHaveBeenCalled();
    });

    it('should handle different delimiters', async () => {
        const csvContent = 'p1;p2;p3\n1;A;b\n2;B;v';
        const expectedJson = JSON.stringify([
            { p1: 1, p2: 'A', p3: 'b' },
            { p1: 2, p2: 'B', p3: 'v' }
        ], null, 2);

        vi.mocked(readFile).mockResolvedValue(csvContent);
        vi.mocked(writeFile).mockResolvedValue(undefined);

        await formatCSVFileToJSONFile('input.csv', 'output.json', ';');

        expect(writeFile).toHaveBeenCalledWith('output.json', expectedJson);
    });

    it('should handle multiple calls correctly', async () => {
        const csvContent1 = 'a,b\n1,2';
        const expectedJson1 = JSON.stringify([{ a: 1, b: 2 }], null, 2);

        const csvContent2 = 'x,y,z\n10,20,30';
        const expectedJson2 = JSON.stringify([{ x: 10, y: 20, z: 30 }], null, 2);

        vi.mocked(readFile)
            .mockResolvedValueOnce(csvContent1)
            .mockResolvedValueOnce(csvContent2);
        vi.mocked(writeFile).mockResolvedValue(undefined);

        await formatCSVFileToJSONFile('input1.csv', 'output1.json', ',');
        await formatCSVFileToJSONFile('input2.csv', 'output2.json', ',');

        expect(readFile).toHaveBeenCalledTimes(2);
        expect(readFile).toHaveBeenNthCalledWith(1, 'input1.csv', 'utf-8');
        expect(readFile).toHaveBeenNthCalledWith(2, 'input2.csv', 'utf-8');

        expect(writeFile).toHaveBeenCalledTimes(2);
        expect(writeFile).toHaveBeenNthCalledWith(1, 'output1.json', expectedJson1);
        expect(writeFile).toHaveBeenNthCalledWith(2, 'output2.json', expectedJson2);
    });
});