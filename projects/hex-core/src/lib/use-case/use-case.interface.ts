import { Observable } from 'rxjs';
import { Result } from '../utils';

export abstract class UseCase<R, E> {
  abstract execute(...args: any[]): Observable<Result<R, E>>;
}
