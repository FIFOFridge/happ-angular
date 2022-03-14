import { AfterViewInit, ApplicationRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { delay } from 'rxjs/operators';
import { UsersService } from 'src/app/services/users.service';
import { FetchServiceProcessingStatus } from 'src/app/types/services/fetch-service-processing-status';
import { User } from 'src/app/types/user';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    // styleUrls: ['./users.component.css'],
    providers: [UsersService], // inject UsersService
})
export class UsersComponent implements OnInit/* , OnDestroy*/, AfterViewInit {
    #usersService: UsersService

    usersServiceProcessingStatus: FetchServiceProcessingStatus
    users: User[]

    userForm = new FormGroup({
        userName: new FormControl(''),
        userEmail: new FormControl(''),
        userGender: new FormControl(''),
        userStatus: new FormControl('')
    })

    constructor(
        usersService: UsersService,
    ) { 
        this.#usersService = usersService

        this.usersServiceProcessingStatus = this.#usersService.getServiceStatus()
        this.users = []
    }

    // ------------------------------
    // Lifecycle
    // ------------------------------
    ngOnInit(): void {
        // ! Subscribe to service changes
        this.#usersService.statusSubject
        .pipe(
            delay(0) // fix synchronous loading from storage (NG0100) "Expression has changed after it was checked": https://blog.angular-university.io/angular-debugging/
        )
        .subscribe(newValue => {
            this.usersServiceProcessingStatus = newValue
        })

        // ! Subscribe to users changes
        this.#usersService.usersSubject.subscribe(newValue => { 
            this.users = newValue
        })
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

    onSubmitUser() {
        // todo: validation
        console.log(this.userForm.value)

        const status = this.userForm.value.userStatus === true ? "active" : "inactive"

        this.#usersService.tryAdd(
            this.userForm.value.userName,
            this.userForm.value.userEmail,
            this.userForm.value.userGender,
            status,
        )
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
}
