import { Post } from "../post"

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

export interface PostsQuery {
    meta: Meta
    data: Post[]
}