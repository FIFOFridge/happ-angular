import { Component, OnInit } from '@angular/core';
import { delay } from 'rxjs';
import { TodosService } from 'src/app/services/todos.service';
import { FetchServiceProcessingStatus } from 'src/app/types/services/fetch-service-processing-status';
import { Todo } from 'src/app/types/todo';

@Component({
    selector: 'app-todos',
    templateUrl: './todos.component.html',
    // styleUrls: ['./todos.component.css']
    providers: [TodosService]
})
export class TodosComponent implements OnInit {
    todosService: TodosService

    todosServiceStatus: FetchServiceProcessingStatus
    todos: Todo[]

    constructor(
        todosService: TodosService
    ) { 
        this.todosService = todosService

        this.todosServiceStatus = this.todosService.getServiceStatus()
        this.todos = []
    }

    // ------------------------------
    // Lifecycle
    // ------------------------------
    ngOnInit(): void {
        // Subscribe to service changes
        this.todosService.statusSubject
        .pipe(
            delay(0) // fix synchronous loading from storage (NG0100) "Expression has changed after it was checked": https://blog.angular-university.io/angular-debugging/
        )
        .subscribe(newValue => {
            this.todosServiceStatus = newValue
        })
        this.todosService.todosSubject.subscribe(newValue => { 
            this.todos = newValue
        })

        // this.updateState()
    }
  
    ngAfterViewInit(): void {
        // Load from storage if cached or fetch otherwise
        if(this.todosService.hasInStorage()) {
            this.todosService.loadFromStorage()
        } else {
            this.todosService.submitTodosRequest()
        }
    }

    reload(): void {
        this.todosService.clear() // wipe current state
        this.todosService.submitTodosRequest() // submit request
    }

    // ------------------------------
    // Logic helpers for component rendering
    // ------------------------------
    isLoading(): boolean {
        return this.todosServiceStatus === FetchServiceProcessingStatus.Ongoing || this.todosServiceStatus === FetchServiceProcessingStatus.Idle
    }

    didSuccess(): boolean {
        return this.todosServiceStatus === FetchServiceProcessingStatus.CompletedSuccessfully
    }

    didFail(): boolean {
        return this.todosServiceStatus === FetchServiceProcessingStatus.CompletedWithError
    }
}
