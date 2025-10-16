
interface BaseResult {
  success: boolean;
}

export class SuccessfulResult<T> implements BaseResult {
  success: true = true;

  constructor(public result: T) { }
}

export class FailedResult<E> implements BaseResult {
  success: false = false;

  constructor(public error: E) { }
}

export type Result<T, E> = SuccessfulResult<T> | FailedResult<E>;
