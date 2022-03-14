import { Todo } from "../todo";

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

export interface TodosQuery {
    meta: Meta
    data: Todo[]
}