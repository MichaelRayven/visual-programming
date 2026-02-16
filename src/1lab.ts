interface User {
    id: number
    name: string
    email?: string | undefined
    isActive: boolean
}

function createUser(id: number, name: string, email?: string, isActive: boolean = true): User {
    return {
        id,
        name,
        email,
        isActive
    }
}

interface Book {
    title: string
    author: string
    year?: number | undefined
    genre: 'fiction' | 'non-fiction'
}

function createBook(book: Book): Book {
    return book
}

createBook({
    title: "Название 1", 
    author: "Я", 
    genre: "fiction", 
    year: 2017
})

createBook({
    title: "Название 1", 
    author: "Я", 
    genre: "non-fiction",
})

type Shape = 'circle' | 'square'

function calculateArea(shape: 'circle', radius: number): number
function calculateArea(shape: 'square', side: number): number


function calculateArea(shape: Shape, side: number): number {
    if (shape == 'circle') {
        return Math.PI*side**2
    } else {
        return side**2
    }
}

type Status = 'active' | 'inactive' | 'new'

function getStatusCode(status: Status): string {
    switch(status) {
        case 'active': return 'green'
        case 'inactive': return 'gray'
        case 'new': return 'yellow'
    }
}

type StringFormatter = (str: string, uppercase: boolean) => string

function formatterOne(str: string, uppercase: boolean): string {
    if (uppercase) {
        return str.charAt(0).toLocaleUpperCase() + str.slice(1)
    }
    return str
}

function formatterTwo(str: string, uppercase: boolean): string {
    let result = str.trim()
    if (uppercase) {
        result = result.toLocaleUpperCase()
    }
    return result
}

function getFirstElement<T>(arr: T[]): T | undefined {
    if (arr.length > 0) {
        return arr[0]
    } else {
        return undefined
    }
}

interface HasId {
    id: number
}

function findById<T extends HasId>(items: T[], id: number): T | undefined {
    for (let entry of items) {
        if (entry.id === id) {
            return entry
        }
    } 
    return undefined
}

function test(formatter: StringFormatter): void {
    console.log(formatter("test", true))
}

test(formatterOne)
test(formatterTwo)

console.log(
    findById([
    {id: 1, name: "name1"},
    {id: 2, name: "name2"},
    {id: 3, name: "name3"},
    {id: 4, name: "name4"},
    {id: 5, name: "name5"}
], 3)
)

console.log(getStatusCode("active"))
