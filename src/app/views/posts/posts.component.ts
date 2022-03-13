import { Component, OnInit } from '@angular/core';
import { delay } from 'rxjs';
import { PostsService } from 'src/app/services/posts.service';
import { Post } from 'src/app/types/post';
import { FetchServiceProcessingStatus } from 'src/app/types/services/fetch-service-processing-status';

@Component({
    selector: 'app-posts',
    templateUrl: './posts.component.html',
    // styleUrls: ['./posts.component.css']
    providers: [PostsService]
})
export class PostsComponent implements OnInit {
    #postsService: PostsService

    postsServiceStatus: FetchServiceProcessingStatus
    posts: Post[]

    constructor(
        postsService: PostsService
    ) { 
        this.#postsService = postsService

        this.postsServiceStatus = this.#postsService.getServiceStatus()
        this.posts = []
    }

    
    // ------------------------------
    // Lifecycle
    // ------------------------------
    ngOnInit(): void {
        // Subscribe to service changes
        this.#postsService.statusSubject
        .pipe(
            delay(0) // fix synchronous loading from storage (NG0100) "Expression has changed after it was checked": https://blog.angular-university.io/angular-debugging/
        )
        .subscribe(newValue => {
            this.postsServiceStatus = newValue
        })
        this.#postsService.postsSubject.subscribe(newValue => { 
            this.posts = newValue
        })

        // this.updateState()
    }
  
    ngAfterViewInit(): void {
        // Load from storage if cached or fetch otherwise
        if(this.#postsService.hasInStorage()) {
            this.#postsService.loadFromStorage()
        } else {
            this.#postsService.submitPostsRequest()
        }
    }

    reload(): void {
        this.#postsService.clear() // wipe current state
        this.#postsService.submitPostsRequest() // submit request
    }

    // ------------------------------
    // Logic helpers for component rendering
    // ------------------------------
    isLoading(): boolean {
        return this.postsServiceStatus === FetchServiceProcessingStatus.Ongoing || this.postsServiceStatus === FetchServiceProcessingStatus.Idle
    }

    didSuccess(): boolean {
        return this.postsServiceStatus === FetchServiceProcessingStatus.CompletedSuccessfully
    }

    didFail(): boolean {
        return this.postsServiceStatus === FetchServiceProcessingStatus.CompletedWithError
    }
}
