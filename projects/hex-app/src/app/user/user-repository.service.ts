import { UseCase } from '@hex/core';
import { GetUserSpecificError, NoPermissionsError, User, UserDataModel } from '@hex/imp';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserRepositoryService {

  constructor(
    private readonly httpClient: HttpClient
  ) {}

  getUsers(): Observable<UserDataModel[]> {
    return this.httpClient.get<UserDataModel[]>('https://jsonplaceholder.typicode.com/users');
  }
}
