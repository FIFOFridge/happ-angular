import { Component, Input, OnInit } from '@angular/core'
import { PostComment } from 'src/app/types/post-comment'

@Component({
    selector: 'app-post',
    templateUrl: './post.component.html',
    // styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
    @Input() title: string = ""
    @Input() body: string = ""
    @Input() comments: PostComment[] = []

    constructor() { }

    ngOnInit(): void {

    }
}
