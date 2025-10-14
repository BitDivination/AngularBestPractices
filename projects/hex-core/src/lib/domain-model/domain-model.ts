import {
  HasId,
  ModelWrapper
} from '../utils';
import { CertifiedUpdate } from '../certified-update';
import {
  IncompleteModelError,
  InvalidCertifiedUpdateError,
  InvalidUpdateError
} from './errors';

/**
 * A metadata entry for a field. An entry is required for each field in the data model.
 */
export interface FieldMetadata {
  required: boolean;
  needsUpdateCertification: boolean;
  validator?: (value: any) => string | null;
}

export abstract class DomainModel<T extends object> implements ModelWrapper<T>, HasId {
  // Metadata for each field
  protected abstract readonly domainObjectMetadata: { [K in keyof T]: FieldMetadata };
  // Way to quickly identify domain models for `trackBy`s and such
  abstract get id(): number | string;
  // constructor so that subclasses can make use of the fluid api syntax
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
    // Reference to the current class to be used as a constructor
    ctor: new (...args: any[]) => any,
    // The model the class is wrapping
    protected model: T,
    // Builder mode is used in the case of an incomplete model, or when starting from scratch with the intention on having a full model.
    protected builderMode = false,
  ) {
    // If not using builder mode, do a quick scan and warn the dev if the model has violations
    if (!this.builderMode) {
      const syncFieldViolations = this.validateSyncFields(model);
      if (syncFieldViolations.length) {
        console.warn(`Field(s) [${syncFieldViolations.join(', ')}] failed their sync validation check(s) during creation!`);
      }

      const requiredFieldValidations = this.validateModelIsComplete(model);
      if (requiredFieldValidations.length) {
        console.warn(`Field(s) [${syncFieldViolations.join(', ')}] failed their required validation check(s) during creation!`);
      }
    }

    this.ctor = ctor;
  }

  /**
   * Function used to unwrap the raw data model from the logic.
   * 
   * @param returnPartial Whether or not a partial model should be returned by the function, or if the model being built should be validated.
   * @returns The complete model, incomplete model in the case of returning a partial, or an error when in builder mode and the model is incomplete.
   */
  getModel(returnPartial = false): T {
    if (this.builderMode && !returnPartial) {
      const syncFieldViolations = this.validateSyncFields(this.model);
      if (syncFieldViolations.length) {
        throw new IncompleteModelError<T>({ syncFields: syncFieldViolations });
      }

      const missingRequiredFields = this.validateModelIsComplete(this.model);
      if (missingRequiredFields.length) {
        throw new IncompleteModelError<T>({ requiredFields: missingRequiredFields });
      }
    }

    return this.model as T;
  }

  /**
   * Update a field in the model with the given value
   * 
   * @param field field in the model to update
   * @param value value for the field
   * @returns new instance of the DomainModel
   * @throws
   */
  update<F extends keyof T>(field: F, value: T[F]): this {
    const patch: Pick<T, F> = { [field]: value } as Pick<T, F>;

    return this.patch(patch);
  }

  /**
   * Update multiple fields for the given model, validate each field to ensure model status.
   * 
   * @param patchFields list of fields containing changes to the model. Will only validate fields that apply to the model's metadata
   */
  patch<F extends keyof T>(patchFields: Pick<T, F>): this;
  patch(patchFields: Partial<T>): this {
    const syncFieldViolations = this.validateSyncFields(patchFields);
    if (syncFieldViolations.length) {
      throw new InvalidUpdateError({ syncFields: syncFieldViolations });
    }

    const asyncFieldViolations = this.validateNoAsyncFieldUpdates(patchFields);
    if (asyncFieldViolations.length) {
      throw new InvalidUpdateError({ asyncFields: asyncFieldViolations });
    }

    const requiredFieldValidations = this.validateNoNonNullRequiredFieldUpdates(patchFields);
    if (requiredFieldValidations.length) {
      throw new InvalidUpdateError({ requiredFields: requiredFieldValidations });
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
    // If cert cannot be applied to the model, throw error
    if (!certifiedUpdate.validateCert(this)) {
      throw new InvalidCertifiedUpdateError(certifiedUpdate);
    }

    // Validate if there are any additional sync validators that need to be run
    const patch: Pick<T, F> = { [certifiedUpdate.field]: certifiedUpdate.value } as Pick<T, F>;
    const syncFieldViolations = this.validateSyncFields(patch as Partial<T>);
    if (syncFieldViolations.length) {
      throw new InvalidUpdateError({ syncFields: syncFieldViolations });
    }

    // If all is well, apply the update, and return the new model
    return new this.ctor(this.ctor, { ...this.model, ...patch } as T, this.builderMode);
  }

  /**
   * Validate all of the proposed updated to the model and find any potential violations
   * 
   * @param updatedModel 
   * @returns 
   */
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

  /**
   * Validate that all of the potential updates do not touch fields that require async (certified update) validation
   * 
   * @param updatedModel 
   * @returns 
   */
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

  validateNoNonNullRequiredFieldUpdates(updatedModel: Partial<T>): (keyof T)[] {
    if (!updatedModel || !Object.keys(this.domainObjectMetadata || {})?.length) {
      return [];
    }

    return Object.keys(updatedModel).reduce(
      (totalViolations, key) => {
        const field = key as keyof T;
        return this.domainObjectMetadata[field]?.required && updatedModel[field] == null ?
          [...totalViolations, field] :
          totalViolations;
      },
      [] as (keyof T)[]
    );
  }

  /**
   * Validate that the model is complete and all required fields have a value
   *
   * @param updatedModel 
   * @returns 
   */
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
