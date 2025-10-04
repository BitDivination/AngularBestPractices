import { ModelWrapper } from '../util-interfaces';
import { HasId } from '../util-interfaces/has-id.interface';
import { CertifiedUpdate } from '../certified-update';

export interface FieldMetadata {
  required: boolean;
  needsUpdateCertification: boolean;
  validator?: (value: any) => string | null;
}

// TODO :: introduce abstract constructor getter function to dynamically create
export abstract class DomainModel<T extends object> implements ModelWrapper<T>, HasId {
  protected abstract readonly domainObjectMetadata: { [K in keyof T]: FieldMetadata };
  // Way to quickly identify domain models for `trackBy`s and such
  abstract get id(): number | string;

  protected readonly ctor: new (...args: any[]) => this;

  // protected constructor(
  //   ctor: new (...args: any[]) => any,
  //   model: Partial<T>,
  //   builderMode: true
  // );
  // protected constructor(
  //   ctor: new (...args: any[]) => any,
  //   model: T,
  //   builderMode: false
  // );
  protected constructor(
    ctor: new (...args: any[]) => any,
    protected model: T,
    protected builderMode = false,
  ) {
    if (!this.builderMode) {
      const syncFieldViolations = this.validateSyncFields(model);
      if (syncFieldViolations.length) {
        console.warn(`Field(s) [${syncFieldViolations.join(', ')}] failed their validation check(s) during creation!`);
      }
    }

    this.ctor = ctor;
  }

  getModel(returnPartial = false): T {
    if (this.builderMode && !returnPartial) {
      const syncFieldViolations = this.validateSyncFields(this.model);
      if (syncFieldViolations.length) {
        throw new Error();
      }

      const missingRequiredFields = this.validateModelIsComplete(this.model);
      if (missingRequiredFields.length) {
        throw new Error();
      }
    }

    return this.model as T;
  }

  update<F extends keyof T>(field: F, value: T[F]): this {
    const patch: Pick<T, F> = { [field]: value } as Pick<T, F>;

    return this.patch(patch);
  }

  patch<F extends keyof T>(patchFields: Pick<T, F>): this;
  patch(patchFields: Partial<T>): this {
    const syncFieldViolations = this.validateSyncFields(patchFields);
    if (syncFieldViolations.length) {
      throw new Error();
    }

    const asyncFieldViolations = this.validateNoAsyncFieldUpdates(patchFields);
    if (asyncFieldViolations.length) {
      throw new Error();
    }

    return new this.ctor(this.ctor, { ...this.model, ...patchFields } as T, this.builderMode);
  }

  /**
   * Apply a certified update to a protected field that requires async logic in order to validate.
   *
   * @param certifiedUpdate
   * @throws Cert errors if the cert does not match the supplied model.
   */
  applyCertifiedUpdate<F extends keyof T>(certifiedUpdate: CertifiedUpdate<T, F>): this {
    if (!certifiedUpdate.validateCert(this)) {
      // TODO ::Not sure on this one
      throw new Error();
    }

    const patch: Pick<T, F> = { [certifiedUpdate.field]: certifiedUpdate.value } as Pick<T, F>;
    const syncFieldViolations = this.validateSyncFields(patch as Partial<T>);
    if (syncFieldViolations.length) {
      throw new Error();
    }

    return new this.ctor(this.ctor, { ...this.model, ...patch } as T, this.builderMode);
  }

  validateSyncFields(updatedModel: Partial<T>): (keyof T)[] {
    if (!updatedModel || !Object.keys(updatedModel).length || !Object.keys(this.domainObjectMetadata || {})?.length) {
      return [];
    };

    // Validate that the fields match their expected metadata
    return Object.keys(updatedModel).reduce(
      (totalViolations, key) => {
        // No metadata for field, field may be from a subclass or irrelevant to the current model
        const fieldMetadata = this.domainObjectMetadata[key];
        if (!this.domainObjectMetadata[key]) {
          return totalViolations;
        }

        const field = key as keyof T;

        // Validate required first
        if (fieldMetadata.required && updatedModel[field] == null) {
          return [...totalViolations, field];
        }

        // Validate validator does not return an error
        const validator = fieldMetadata.validator;
        if (validator && validator(updatedModel[field])) {
          return [...totalViolations, field];
        }

        return totalViolations;
      },
      [] as (keyof T)[]
    );
  }

  validateNoAsyncFieldUpdates(updatedModel: Partial<T>): (keyof T)[] {
    if (!updatedModel || !Object.keys(this.domainObjectMetadata || {})?.length) {
      return [];
    }

    return Object.keys(updatedModel).reduce(
      (totalViolations, key) => {
        const field = key as keyof T;
        return !!this.domainObjectMetadata[field]?.needsUpdateCertification ? [...totalViolations, field] : totalViolations
      },
      [] as (keyof T)[]
    );
  }

  validateModelIsComplete(updatedModel: Partial<T>): (keyof T)[] {
    if (!updatedModel || !Object.keys(this.domainObjectMetadata || {})?.length) {
      return [];
    }

    return Object.keys(this.domainObjectMetadata).reduce(
      (totalViolations, key) => {
        const field = key as keyof T;
        return this.domainObjectMetadata[field].required && updatedModel[field] == null ? [...totalViolations, field] : totalViolations;
      },
      [] as (keyof T)[]
    );;
  }
}
