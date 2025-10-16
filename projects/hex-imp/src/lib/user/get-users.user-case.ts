import { Result, UseCase } from '@hex/core';
import { User } from './user.model';
import { Observable } from 'rxjs';

export class NoPermissionsError extends Error {
  constructor(message: string = 'User does not have permissions to perform this action') {
    super(message);
    this.name = 'NoPermissionsError';
    Object.setPrototypeOf(this, NoPermissionsError.prototype);
  }
}

export class GetUserSpecificError extends Error {
  constructor(message: string = 'An error that only the get user use case can throw') {
    super(message);
    this.name = 'GetUserSpecificError';
    Object.setPrototypeOf(this, GetUserSpecificError.prototype);
  }
}

// NOTE: Return type will be different
export abstract class GetUsersUseCase extends UseCase<User[], NoPermissionsError | GetUserSpecificError> {
  abstract override execute(userId: number): Observable<Result<User[], NoPermissionsError | GetUserSpecificError>>;
}
