import { UseCase } from '@hex/core';
import { User } from './user.model';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { UserDataModel } from './user.interface';

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

export type GetUsersUseCase = UseCase<User[], NoPermissionsError | GetUserSpecificError>;
