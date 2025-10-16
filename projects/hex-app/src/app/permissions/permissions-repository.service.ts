import { UseCase } from '@hex/core';
import { GetUserSpecificError, NoPermissionsError, User, UserDataModel } from '@hex/imp';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PermissionsRepositoryService {

  constructor(
    private readonly httpClient: HttpClient
  ) {}

  hasPermission(): Observable<boolean> {
    return this.httpClient.get<boolean>('https://jsonplaceholder.typicode.com/users');
  }
}
