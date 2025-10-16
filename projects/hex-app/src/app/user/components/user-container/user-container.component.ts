import { Component, input, inject, toSignal } from '@angular/core';
import { User } from '@hex/imp';
import { DeleteUserUseCaseImp } from '../../delete-user.use-case-imp';
import { map, tap } from 'rxjs/operators';
import { GetUsersUserCaseImp } from '../../get-user.use-case-imp';


@Component({
  selector: 'app-user-container',
  standalone: true,
  template: `
    <app-user-display [user]="user()" (updatedUser)="updateUser()"></app-user-display>

    <button (click)="deleteAccount()">Delete account</button>
  `
})
export class UserContainerComponent {
  getUserUserCase = inject(GetUsersUserCaseImp)
  deleteUserUserCase = inject(DeleteUserUseCaseImp)

  user = toSignal(this.getUserUserCase
    .execute(1)
    .pipe(
      map(result => result.success ? result.result[0] : undefined)
    )
  )

  deleteAccount() {
    if (!this.user()) {
      return;
    }

    this.deleteUserUserCase.execute(this.user).pipe(
      tap(response => {
        if (!response.success) {
          console.error('Failed to delete user:', response.error);
          return;
        }

        console.log('User deleted successfully', response.result);
      }),
    ).subscribe();
  }

  updateUser() {
    // TODO
  }
}
