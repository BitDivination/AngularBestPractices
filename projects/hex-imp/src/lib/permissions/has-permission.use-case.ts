import { Result, UseCase } from '@hex/core';
import { Observable } from 'rxjs';

export abstract class HasPermissionUseCase extends UseCase<boolean, never> {
  abstract override execute(permission: string): Observable<Result<boolean, never>>;
}
