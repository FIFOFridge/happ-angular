import { PostComment } from "./post-comment"

export interface Post {
    id: number
    user_id: number
    title: string
    body: string,
    comments: PostComment[]
}