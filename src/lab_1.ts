// 1 пункт
export interface User {
    id: number
    name: string
    email?: string | undefined
    isActive: boolean
}

export function createUser(id: number, name: string, email?: string, isActive: boolean = true): User {
    return {
        id,
        name,
        email,
        isActive
    }
}

// 2 пункт
export interface Book {
    title: string
    author: string
    year?: number | undefined
    genre: 'fiction' | 'non-fiction'
}

export function createBook(book: Book): Book {
    return book
}

// 3 пункт
export type Shape = 'circle' | 'square'

export function calculateArea(shape: 'circle', radius: number): number
export function calculateArea(shape: 'square', side: number): number


export function calculateArea(shape: Shape, side: number): number {
    if (shape == 'circle') {
        return Math.PI*side**2
    } else {
        return side**2
    }
}

// 4 пункт
export type Status = 'active' | 'inactive' | 'new'

export function getStatusColor(status: Status): string {
    switch(status) {
        case 'active': return 'green'
        case 'inactive': return 'gray'
        case 'new': return 'yellow'
    }
}

// 5 пункт
export type StringFormatter = (str: string, uppercase?: boolean) => string

export const formatterOne: StringFormatter = (str: string, uppercase: boolean = false): string => {
    return str.charAt(0).toLocaleUpperCase() + str.slice(1)
}

export const formatterTwo: StringFormatter = (str: string, uppercase: boolean = false): string => {
    let result = str.trim()
    if (uppercase) {
        result = result.toLocaleUpperCase()
    }
    return result
}

// 6 пункт
export function getFirstElement<T>(arr: T[]): T | undefined {
    if (arr.length > 0) {
        return arr[0]
    } else {
        return undefined
    }
}

// 7 пункт
export interface HasId {
    id: number
}

export function findById<T extends HasId>(items: T[], id: number): T | undefined {
    for (let entry of items) {
        if (entry.id === id) {
            return entry
        }
    } 
    return undefined
}
