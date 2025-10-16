import { Result, UseCase } from '@hex/core';
import { Observable } from 'rxjs';
import { HasPermissionUseCase } from '../permissions';

export class UserNotFoundError extends Error {
  constructor(message: string = 'User not found') {
    super(message);
    this.name = 'UserNotFoundError';
    Object.setPrototypeOf(this, UserNotFoundError.prototype);
  }
}

export class NoDeleteUserPermissionError extends Error {
  constructor(message: string = 'User does not have delete permission') {
    super(message);
    this.name = 'NoDeleteUserPermissionError';
    Object.setPrototypeOf(this, NoDeleteUserPermissionError.prototype);
  }
}

export abstract class DeleteUserUseCase extends UseCase<boolean, UserNotFoundError | NoDeleteUserPermissionError> {

  // Must check for permissions before deleting a user
  constructor(
    hasPermissionUseCase: HasPermissionUseCase
  ) {
    super();
  }

  abstract override execute(userId: number): Observable<Result<boolean, UserNotFoundError | NoDeleteUserPermissionError>>;
}
