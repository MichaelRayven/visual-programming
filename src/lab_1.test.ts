import { describe, it, expect } from 'vitest'
import {
    createUser,
    createBook,
    calculateArea,
    getStatusColor,
    formatterOne,
    formatterTwo,
    getFirstElement,
    findById,
    type User,
    type Book,
    type Status,
    type HasId
} from './lab_1'

describe('User functions', () => {
    it('should create user with all fields', () => {
        const user = createUser(1, 'John Doe', 'john@example.com', true)
        expect(user).toEqual({
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            isActive: true
        })
    })

    it('should create user with default isActive', () => {
        const user = createUser(2, 'Jane Doe', 'jane@example.com')
        expect(user.isActive).toBe(true)
    })

    it('should create user without email', () => {
        const user = createUser(3, 'Bob Smith')
        expect(user).toEqual({
            id: 3,
            name: 'Bob Smith',
            email: undefined,
            isActive: true
        })
    })
})

describe('Book functions', () => {
    it('should create book with all fields', () => {
        const book: Book = {
            title: 'Test Book',
            author: 'Test Author',
            year: 2023,
            genre: 'fiction'
        }
        const createdBook = createBook(book)
        expect(createdBook).toEqual(book)
    })

    it('should create book without optional year', () => {
        const book: Book = {
            title: 'Another Book',
            author: 'Another Author',
            genre: 'non-fiction'
        }
        const createdBook = createBook(book)
        expect(createdBook).toEqual(book)
        expect(createdBook.year).toBeUndefined()
    })
})

describe('calculateArea function', () => {
    it('should calculate circle area correctly', () => {
        const radius = 5
        const area = calculateArea('circle', radius)
        expect(area).toBeCloseTo(Math.PI * 25, 5)
    })

    it('should calculate square area correctly', () => {
        const side = 4
        const area = calculateArea('square', side)
        expect(area).toBe(16)
    })
})

describe('getStatusColor function', () => {
    it('should return green for active status', () => {
        expect(getStatusColor('active')).toBe('green')
    })

    it('should return gray for inactive status', () => {
        expect(getStatusColor('inactive')).toBe('gray')
    })

    it('should return yellow for new status', () => {
        expect(getStatusColor('new')).toBe('yellow')
    })
})

describe('String formatters', () => {
    describe('formatterOne', () => {
        it('should capitalize first letter when uppercase is false', () => {
            const result = formatterOne('hello world', false)
            expect(result).toBe('Hello world')
        })

        it('should capitalize first letter when uppercase is true', () => {
            const result = formatterOne('hello world', true)
            expect(result).toBe('Hello world')
        })

        it('should capitalize first letter by default', () => {
            const result = formatterOne('hello world')
            expect(result).toBe('Hello world')
        })
    })

    describe('formatterTwo', () => {
        it('should trim spaces', () => {
            const result = formatterTwo('  hello world  ', false)
            expect(result).toBe('hello world')
        })

        it('should trim and uppercase when uppercase is true', () => {
            const result = formatterTwo('  hello world  ', true)
            expect(result).toBe('HELLO WORLD')
        })

        it('should trim spaces by default', () => {
            const result = formatterTwo('  hello world  ')
            expect(result).toBe('hello world')
        })
    })
})

describe('getFirstElement function', () => {
    it('should return first element of number array', () => {
        const numbers = [1, 2, 3, 4, 5]
        expect(getFirstElement(numbers)).toBe(1)
    })

    it('should return first element of string array', () => {
        const strings = ['hello', 'world', 'test']
        expect(getFirstElement(strings)).toBe('hello')
    })

    it('should return undefined for empty array', () => {
        expect(getFirstElement([])).toBeUndefined()
    })

    it('should work with object array', () => {
        const objects = [{ id: 1 }, { id: 2 }]
        expect(getFirstElement(objects)).toEqual({ id: 1 })
    })
})

describe('findById function', () => {
    interface TestItem extends HasId {
        name: string
    }

    const testItems: TestItem[] = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
        { id: 4, name: 'Item 4' },
        { id: 5, name: 'Item 5' }
    ]

    it('should find item by existing id', () => {
        const found = findById(testItems, 3)
        expect(found).toEqual({ id: 3, name: 'Item 3' })
    })

    it('should return undefined for non-existing id', () => {
        const found = findById(testItems, 999)
        expect(found).toBeUndefined()
    })

    it('should work with empty array', () => {
        const found = findById([], 1)
        expect(found).toBeUndefined()
    })

    it('should find first item with matching id', () => {
        const duplicates = [
            { id: 1, name: 'First' },
            { id: 1, name: 'Second' },
            { id: 2, name: 'Third' }
        ]
        const found = findById(duplicates, 1)
        expect(found).toEqual({ id: 1, name: 'First' })
    })
})