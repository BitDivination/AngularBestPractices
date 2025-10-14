import { GetUserSpecificError, NoPermissionsError, User, GetUsersUseCase } from '@hex/imp';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UserRepositoryService } from './user-repository.service';

@Injectable({
  providedIn: 'root'
})
export class GetUsersUserCaseImp implements GetUsersUseCase {

  userRepository = inject(UserRepositoryService);

  execute(...args: any[]): Observable<User[] | NoPermissionsError | GetUserSpecificError> {
    return this.userRepository.getUsers().pipe(
      map(users => users.map(user => new User(user))),
      catchError(error => {
        if (error.status === 403) {
          return of(new NoPermissionsError());
        } else {
          return of(new GetUserSpecificError(error.message));
        }
      }),
    );
  }
}
