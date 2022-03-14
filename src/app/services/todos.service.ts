import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, of, Subject, timeout } from 'rxjs';
import { isError } from '../helpers/isError';
import { TodosQuery } from '../types/API/todosQuery';
import { FetchServiceProcessingStatus } from '../types/services/fetch-service-processing-status';
import { Todo } from '../types/todo';
import { StorageProviderService } from './storage-provider.service';

@Injectable({
    providedIn: 'root'
})
export class TodosService {
    // services
    storageProviderService: StorageProviderService
    httpClient: HttpClient

    #status: FetchServiceProcessingStatus
    statusSubject: Subject<FetchServiceProcessingStatus>
    todosSubject: Subject<Todo[]>

    // Urls
    getTodosUrl = "https://gorest.co.in/public/v1/todos"
    timeout = 1000 * 10 // in ms (10sec)

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

        this.statusSubject = new Subject() // create subjects for emitting changes
        this.todosSubject = new Subject()

        this.todosSubject.next([]) // init with empty array of todo's
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
        if (this.storageProviderService.has("todos-service-data"))
            return true

        return false
    }

    // load from storage provider
    loadFromStorage(): void {
        // make sure users are in storage
        if (!this.hasInStorage())
            throw new Error(`Storage don't contains todos`)

        console.log("Loading todos from storage...")
        const users = this.#getFromStorage()

        // update service status
        this.#updateServiceStatus(FetchServiceProcessingStatus.CompletedSuccessfully)

        // update users from storage
        this.todosSubject.next(users)
    }

    // -----------------------------------------------------------------------------
    // User related actions
    // -----------------------------------------------------------------------------
    submitTodosRequest() {
        if (this.hasInStorage())
            throw new Error(`Storage already contains todos, clear data before submitting request`)

        if (this.#status !== FetchServiceProcessingStatus.Idle)
            throw new Error(`Service cannot execute submitRequest with current state`)

        console.log("Fetching todos from API...")

        this.httpClient.get(this.getTodosUrl, this.httpOptions)
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
                // console.log(`Subscriber received: ${JSON.stringify(response)}`)

                if(isError(response))
                    return

                const requestResponse = response as TodosQuery
                
                // apply Date formatting
                const todosFormatted = requestResponse.data.forEach(todo => todo.due_on = new Date(todo.due_on).toLocaleDateString())

                this.#updateStorage(requestResponse.data) // update storage
                this.#updateServiceStatus(FetchServiceProcessingStatus.CompletedSuccessfully) // update service state
                this.todosSubject.next(requestResponse.data) // emit data changes
            })
    }

    // get from storage
    #getFromStorage(): Todo[] {
        return this.storageProviderService.get("todos-service-data") as Todo[]
    }

    #updateStorage(todos: Todo[]): void {
        this.storageProviderService.set("todos-service-data", todos)
    }

    clear(): void {
        this.#updateServiceStatus(FetchServiceProcessingStatus.Idle)
        this.storageProviderService.remove("todos-service-data")
    }

    handleError<T>(fallback?: T/*err: any, caught: Observable<Object>*/) {
        return (error: any) => {
            // log error
            console.error(`User service error occurred: ${error}`)

            // update status
            this.#updateServiceStatus(FetchServiceProcessingStatus.CompletedWithError)

            // rethrow error if fallback not specified
            if (fallback === undefined)
                throw error

            // return passed "fallback" 
            return of(fallback as T)
        }
    }
}
