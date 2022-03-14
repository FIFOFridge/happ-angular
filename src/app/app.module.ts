import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { UsersComponent } from './views/users/users.component';

import { StorageProviderService } from './services/storage-provider.service';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { PostComponent } from './components/posts/post.component';
// import { CommentComponent } from './components/posts/comment.component';
import { PostsComponent } from './views/posts/posts.component';
import { TodoComponent } from './components/todo/todo.component';
import { TodosComponent } from './views/todos/todos.component';
import { HomeComponent } from './views/home/home.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        AppComponent,
        UsersComponent,
        PostsComponent,
        PostComponent,
        TodoComponent,
        TodosComponent,
        HomeComponent,
        // CommentComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        ReactiveFormsModule
    ],
    providers: [StorageProviderService],
    bootstrap: [AppComponent]
})
export class AppModule { }
