import { ChangeDetectionStrategy } from '@angular/compiler';
import { AfterViewInit, ApplicationRef, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { delay } from 'rxjs/operators';
import { UsersService } from 'src/app/services/users.service';
import { FetchServiceProcessingStatus } from 'src/app/types/services/fetch-service-processing-status';
import { User } from 'src/app/types/user';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css'],
    providers: [UsersService], // inject UsersService
})
export class UsersComponent implements OnInit/* , OnDestroy*/, AfterViewInit {
    #usersService: UsersService
    #applicationRef: ApplicationRef

    usersServiceProcessingStatus: FetchServiceProcessingStatus
    users: User[]

    // isLoading = true
    // didFail = false
    // didSuccess = false

    constructor(
        usersService: UsersService,
        applicationRef: ApplicationRef
    ) { 
        this.#usersService = usersService
        this.#applicationRef = applicationRef

        this.usersServiceProcessingStatus = this.#usersService.getServiceStatus()
        this.users = []
    }

    // ------------------------------
    // Lifecycle
    // ------------------------------
    ngOnInit(): void {
        // Subscribe to service changes
        this.#usersService.statusSubject
        .pipe(
            delay(0) // fix synchronous loading from storage (NG0100) "Expression has changed after it was checked": https://blog.angular-university.io/angular-debugging/
        )
        .subscribe(newValue => {
            this.usersServiceProcessingStatus = newValue
        })
        this.#usersService.usersSubject.subscribe(newValue => { 
            this.users = newValue
        })

        // this.updateState()
    }
  
    ngAfterViewInit(): void {
        // Load from storage if cached or fetch otherwise
        if(this.#usersService.hasInStorage()) {
            this.#usersService.loadFromStorage()
        } else {
            this.#usersService.submitUsersRequest()
        }
    }

    // ngOnDestroy(): void {
    //     // inline callbacks don't require cleanup
    // }    

    handleAddUser(): void {
        throw new Error(`Not implemented`)
    }

    reload(): void {
        this.#usersService.clear() // wipe current state
        this.#usersService.submitUsersRequest() // submit request
    }

    // ------------------------------
    // Logic helpers for component rendering
    // ------------------------------
    isLoading(): boolean {
        return this.usersServiceProcessingStatus === FetchServiceProcessingStatus.Ongoing || this.usersServiceProcessingStatus === FetchServiceProcessingStatus.Idle
    }

    didSuccess(): boolean {
        return this.usersServiceProcessingStatus === FetchServiceProcessingStatus.CompletedSuccessfully
    }

    didFail(): boolean {
        return this.usersServiceProcessingStatus === FetchServiceProcessingStatus.CompletedWithError
    }

    // updateState() {
    //     this.isLoading = this.usersServiceProcessingStatus === UsersServiceProcessingStatus.Ongoing || this.usersServiceProcessingStatus === UsersServiceProcessingStatus.Idle
    //     this.didFail = this.usersServiceProcessingStatus === UsersServiceProcessingStatus.CompletedWithError
    //     this.didSuccess = this.usersServiceProcessingStatus === UsersServiceProcessingStatus.CompletedSuccessfully
    // }
}
