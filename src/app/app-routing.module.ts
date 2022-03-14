import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { PostsComponent } from './views/posts/posts.component';
import { TodosComponent } from './views/todos/todos.component';
import { UsersComponent } from './views/users/users.component';

const routes: Routes = [
    {
        path: '', 
        pathMatch: 'full',
        component: HomeComponent
    },    
    {
        path: "users", 
        component: UsersComponent
    },
    {
        path: "posts",
        component: PostsComponent
    },
    {
        path: "todos",
        component: TodosComponent
    },
    // Redirect invalid/unmatched URLs to home
    {
        path: '**', 
        pathMatch: 'full',
        component: HomeComponent
    }
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule { }
