import { Injectable } from '@angular/core';
import { observable, Observable, of, Subject, Subscriber } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';
import { FetchServiceProcessingStatus } from '../types/services/fetch-service-processing-status';
import { User } from '../types/user';
import { StorageProviderService } from './storage-provider.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UsersQuery } from '../types/API/usersQuery';
import { isError } from '../helpers/isError';

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    // services
    storageProviderService: StorageProviderService
    httpClient: HttpClient

    #status: FetchServiceProcessingStatus
    statusSubject: Subject<FetchServiceProcessingStatus>
    usersSubject: Subject<User[]>
    
    // Urls
    getUsersUrl = `https://gorest.co.in/public/v1/users`
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

        this.usersSubject = new Subject()
        this.usersSubject.next([]) // init with empty array of users
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
        if(this.storageProviderService.has("users-service-data"))
            return true

        return false
    }

    // load from storage provider
    loadFromStorage(): void {
        // make sure users are in storage
        if(!this.hasInStorage()) 
            throw new Error(`Storage don't contains users`)


        console.log("Loading users from storage...")
        const users = this.#getFromStorage()

        // update service status
        this.#updateServiceStatus(FetchServiceProcessingStatus.CompletedSuccessfully)

        // update users from storage
        this.usersSubject.next(users)
    }

    // -----------------------------------------------------------------------------
    // User related actions
    // -----------------------------------------------------------------------------
    submitUsersRequest() {
        if(this.hasInStorage())
            throw new Error(`Storage already contains users, clear data before submitting request`)

        if(this.#status !== FetchServiceProcessingStatus.Idle)
            throw new Error(`Service cannot execute submitRequest with current state`)

        console.log("Fetching users from API...")

        this.httpClient.get(this.getUsersUrl, this.httpOptions)
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
            console.log(`Subscriber received: ${JSON.stringify(response)}`) 
            
            // update storage and service state if success, error processing is handled with this.handleError(...)
            if(!isError(response)) {
                const requestResponse = response as UsersQuery
                this.#updateStorage(requestResponse.data) // update storage
                this.#updateServiceStatus(FetchServiceProcessingStatus.CompletedSuccessfully) // update service state
                this.usersSubject.next(requestResponse.data) // emit data changes
            }
        })
    }

    // get from storage
    #getFromStorage(): User[] {
        return this.storageProviderService.get("users-service-data") as User[]
    }

    tryAdd(): boolean {
        throw new Error(`Not implemented yet`)
    }

    #updateStorage(users: User[]): void {
        this.storageProviderService.set("users-service-data", users)
    }

    clear(): void {
        this.#updateServiceStatus(FetchServiceProcessingStatus.Idle)
        this.storageProviderService.remove("users-service-data")
    }

    handleError<T>(fallback?: T/*err: any, caught: Observable<Object>*/) {
        return (error: any) => {
            // log error
            console.error(`User service error occurred: ${error}`)

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
