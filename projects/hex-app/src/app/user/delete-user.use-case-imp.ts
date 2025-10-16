import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { HasPermissionUseCaseImp } from '../permissions';
import { DeleteUserUseCase, NoDeleteUserPermissionError, UserNotFoundError } from '../../../../hex-imp/src/lib/user/delete-user.use-case';
import { UserRepositoryService } from './user-repository.service';
import { FailedResult, Result, SuccessfulResult } from '@hex/core';

@Injectable({
  providedIn: 'root'
})
export class DeleteUserUseCaseImp extends DeleteUserUseCase {

  userRepository = inject(UserRepositoryService);

  constructor(
    private readonly hasPermissionUseCase: HasPermissionUseCaseImp
  ) {
    super(hasPermissionUseCase);
  }

  execute(userId: number): Observable<Result<boolean, UserNotFoundError | NoDeleteUserPermissionError>> {
    return this.hasPermissionUseCase.execute('delete.user').pipe(
      switchMap(hasPermission => {
        if (!hasPermission) {
          return of(new FailedResult(new NoDeleteUserPermissionError()));
        }

        return this.userRepository.deleteUser(userId).pipe(
          map(response => new SuccessfulResult(response)),
          catchError(error => {
            return of(new FailedResult(new UserNotFoundError()));
          })
        );
      }),
    );
  }
}
