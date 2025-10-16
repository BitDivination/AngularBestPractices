import { GetUserSpecificError, NoPermissionsError, User, GetUsersUseCase } from '@hex/imp';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UserRepositoryService } from './user-repository.service';
import { FailedResult, Result, SuccessfulResult } from '@hex/core';

@Injectable({
  providedIn: 'root'
})
export class GetUsersUserCaseImp extends GetUsersUseCase {

  userRepository = inject(UserRepositoryService);

  execute(...args: any[]): Observable<Result<User[], NoPermissionsError | GetUserSpecificError>> {
    return this.userRepository.getUsers().pipe(
      map(users => new SuccessfulResult(users.map(user => new User(user)))),
      catchError(error => {
        if (error.status === 403) {
          return of(new FailedResult(new NoPermissionsError()));
        } else {
          return of(new FailedResult(new GetUserSpecificError(error.message)));
        }
      }),
    );
  }
}
