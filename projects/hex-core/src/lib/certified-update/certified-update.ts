// This existing is proof you can do it, right?

import { hashObject, ModelWrapper } from '../utils';


/**
 *  TODO :: Better docs
 *  NO NEED FOR ABSTRACT IMPLEMENTATION, this class is generic and supports all it needs thorugh there
 */
export class CertifiedUpdate<T extends object, F extends keyof T> {
  private readonly modelHash: number;

  /**
   * A Certified Update represents and async validation that needs to be performed on a Domain Model
   * Certified Updates cannot be created through regular means. It can only be created via a validation function, and it is limited to a
   * single Model or Domain Model.
   */
  constructor(
    private domainObject: T,
    private targetField: F,
    private newValue: T[F],
  ) {
    if (!domainObject || !targetField) {
      // TODO :: ERROR
      throw new Error();
    }

    this.modelHash = hashObject(domainObject);
  }

  get field(): F {
    return this.targetField;
  }

  get value(): T[F] {
    return this.newValue;
  }

  validateCert(comparand: ModelWrapper<T>): boolean {
    return hashObject(comparand) === this.modelHash;
  }
}
