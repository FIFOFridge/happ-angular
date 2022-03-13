import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostsComponent } from './views/posts/posts.component';
import { UsersComponent } from './views/users/users.component';

const routes: Routes = [
    {
        path: "users", 
        component: UsersComponent
    },
    {
        path: "posts",
        component: PostsComponent
    }
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule { }
