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
    if (!updatedModel || !Object.keys(this.domainObjectMetadata || {})?.length) {
      return [];
    }

    // Find all fields that violate their validators for the given model
    return Object.keys(this.domainObjectMetadata).reduce(
      (totalViolations, field) =>
        updatedModel[field] &&
        this.domainObjectMetadata[field]?.validator &&
        this.domainObjectMetadata[field]?.validator(updatedModel[field])
          ? [...totalViolations, field]
          : totalViolations,
      [],
    );
  }

  validateNoAsyncFieldUpdates(updatedModel: Partial<T>): (keyof T)[] {
    if (!updatedModel || !Object.keys(this.domainObjectMetadata || {})?.length) {
      return [];
    }

    return Object.keys(this.domainObjectMetadata)
      .filter((field) => this.domainObjectMetadata[field].needsUpdateCertification)
      .reduce(
        (totalViolations, currentCertField) => (updatedModel[currentCertField] ? [...totalViolations, currentCertField] : totalViolations),
        [],
      );
  }

  validateModelIsComplete(updatedModel: Partial<T>): (keyof T)[] {
    if (!updatedModel || !Object.keys(this.domainObjectMetadata || {})?.length) {
      return [];
    }

    return Object.keys(this.domainObjectMetadata)
      .filter((field) => this.domainObjectMetadata[field].required)
      .reduce(
        (totalViolations, currentRequiredField) =>
          updatedModel[currentRequiredField] == null ? [...totalViolations, currentRequiredField] : totalViolations,
        [],
      );
  }
}
