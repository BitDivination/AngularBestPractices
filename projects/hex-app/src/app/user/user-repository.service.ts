import { UserDataModel } from '@hex/imp';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  deleteUser(userId: number): Observable<boolean> {
    return this.httpClient.delete<void>(`https://jsonplaceholder.typicode.com/users/${userId}`).pipe(
      map(_ => true)
    );
  }
}
