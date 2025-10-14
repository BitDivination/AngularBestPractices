import { Observable } from 'rxjs';

export interface UseCase<R, E> {
  execute(...args: any[]): Observable<R | E>;
}
