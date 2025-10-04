import { Observable } from "rxjs";
import { CertifiedUpdate } from "./certified-update";

export interface CertifyUpdateUseCase<T extends object, F extends keyof T> {
  validate(model: T, field: F, value: T[F]): Observable<CertifiedUpdate<T, F>>;
}