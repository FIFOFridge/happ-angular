import { PostComment } from "../post-comment"

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

export interface CommentsQuery {
    meta: Meta
    data: PostComment[]
}