import { User } from "../user"

// generated with: http://www.json2ts.com/
export interface Links {
    previous?: any
    current: string
    next: string
}

export interface Pagination {
    total: number
    pages: number
    page: number
    limit: number
    links: Links
}

export interface Meta {
    pagination: Pagination
}

export interface UsersQuery {
    meta: Meta
    data: User[]
}


