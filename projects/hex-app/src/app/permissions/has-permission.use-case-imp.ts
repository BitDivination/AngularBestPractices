import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HasPermissionUseCase } from '../../../../hex-imp/src/lib/permissions';
import { PermissionsRepositoryService } from './permissions-repository.service';
import { Result, SuccessfulResult } from '@hex/core';

@Injectable({
  providedIn: 'root'
})
export class HasPermissionUseCaseImp extends HasPermissionUseCase {

  permissionRepository = inject(PermissionsRepositoryService);

  execute(permission: string): Observable<Result<boolean, never>> {
    return this.permissionRepository.hasPermission().pipe(
      map(hasPermission => new SuccessfulResult(hasPermission))
    );
  }
}
