import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { catchError, forkJoin, of, Subject, timeout } from 'rxjs'
import { isError } from '../helpers/isError'
import { CommentsQuery } from '../types/API/comments-query'
import { PostsQuery } from '../types/API/posts-query'
import { Post } from '../types/post'
import { PostComment } from '../types/post-comment'
import { FetchServiceProcessingStatus } from '../types/services/fetch-service-processing-status'
import { StorageProviderService } from './storage-provider.service'

@Injectable({
    providedIn: 'root'
})
export class PostsService {
    // services
    storageProviderService: StorageProviderService
    httpClient: HttpClient

    #status: FetchServiceProcessingStatus
    statusSubject: Subject<FetchServiceProcessingStatus>
    postsSubject: Subject<Post[]>
    // comments: PostComment[]
    
    // Endpoints
    getPostsUrl = "https://gorest.co.in/public/v1/posts"
    getCommentsUrl = "https://gorest.co.in/public/v1/comments"
    timeout = 1000 * 10 // in ms

    // Request headers
    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }) // set required response format to json
    }

    constructor(
        storageProviderService: StorageProviderService,
        httpClient: HttpClient
    ) {
        // assign services for further usage
        this.storageProviderService = storageProviderService
        this.httpClient = httpClient

        this.#status = FetchServiceProcessingStatus.Idle // init service status
        this.statusSubject = new Subject() // create subject for emitting status changes
        this.postsSubject = new Subject()
        
        // this.comments = [] // create empty comments array
    }

    // -----------------------------------------------------------------------------
    // Service status methods
    // -----------------------------------------------------------------------------
    getServiceStatus(): FetchServiceProcessingStatus {
        return this.#status
    }

    #updateServiceStatus(status: FetchServiceProcessingStatus): void {
        this.#status = status
        this.statusSubject.next(this.#status) // emit changes
    }
    // -----------------------------------------------------------------------------
    // Storage management methods
    // -----------------------------------------------------------------------------
    hasInStorage(): boolean {
        if(this.storageProviderService.has("posts-service-data"))
            return true

        return false
    }

    // load from storage provider
    loadFromStorage(): void {
        // make sure posts are in storage
        if(!this.hasInStorage()) 
            throw new Error(`Storage don't contains posts`)

        console.log("Loading posts from storage...")
        const posts = this.#getFromStorage()

        // update service status
        this.#updateServiceStatus(FetchServiceProcessingStatus.CompletedSuccessfully)

        // update users from storage
        this.postsSubject.next(posts)
    }

    // -----------------------------------------------------------------------------
    // Posts related actions
    // -----------------------------------------------------------------------------
    submitPostsRequest() {
        if(this.hasInStorage())
            throw new Error(`Storage already contains posts, clear data before submitting request`)

        if(this.#status !== FetchServiceProcessingStatus.Idle)
            throw new Error(`Service cannot execute submitPostsRequest with current state`)

        console.log("Fetching posts from API...")

        forkJoin({
            posts: this.httpClient.get(this.getPostsUrl, this.httpOptions),
            comments: this.httpClient.get(this.getCommentsUrl, this.httpOptions)
        })
        .pipe(
            // ! configure timeout
            timeout({
                each: this.timeout, // 10 seconds should be enough
                with: () => { throw new Error(`Operation timeout`) } // throw timeout error
            }),

            // tap(_ => { throw new Error(`Crash test`) }),
            
            // ! handle error if needed
            catchError(this.handleError(undefined).bind(this)), 
        )
        .subscribe(response => { 
            if(isError(response))
                return

            const postsResponse = response?.posts as PostsQuery
            const commentsResponse = response?.comments as CommentsQuery

            postsResponse.data.forEach(post => post.comments = []) // initialize comments filed for each post

            const postsWithComments = this.assignComments(postsResponse.data, commentsResponse.data)

            this.#updateStorage(postsWithComments) // update storage
            this.#updateServiceStatus(FetchServiceProcessingStatus.CompletedSuccessfully) // update service state
            this.postsSubject.next(postsWithComments) // emit data changes
        })
    }

    assignComments(posts: Post[], comments: PostComment[]): Post[] {
        const postsWithComments = posts.slice() // copy original array to avoid modifying source (array passed as argument)

        for(const comment of comments) {
            // try to find commented post
            const commentedPost = postsWithComments.find(post => post.id === comment.post_id)

            if(commentedPost === undefined) // skip if not found
                continue
            
            commentedPost.comments.push(comment)
        }

        return postsWithComments
    }

    // get from storage
    #getFromStorage(): Post[] {
        return this.storageProviderService.get("posts-service-data") as Post[]
    }

    #updateStorage(posts: Post[]): void {
        this.storageProviderService.set("posts-service-data", posts)
    }

    clear(): void {
        this.#updateServiceStatus(FetchServiceProcessingStatus.Idle)
        this.storageProviderService.remove("posts-service-data")
    }

    handleError<T>(fallback?: T/*err: any, caught: Observable<Object>*/) {
        return (error: any) => {
            // log error
            console.error(`Posts service error occurred: ${error}`)

            // update status
            this.#updateServiceStatus(FetchServiceProcessingStatus.CompletedWithError)

            // rethrow error if fallback not specified
            if(fallback === undefined)
                throw error

            // return passed "fallback" 
            return of(fallback as T)
        }
    }
}
