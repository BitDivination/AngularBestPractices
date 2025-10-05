import { AtLeastOne } from "../../utils/at-least-one-field.type";
import { ModelFieldViolations } from "./model-field-violations.error";

/**
 * Error thrown when attempting to apply an update to a model that is not valid.
 * is used before the model is complete or valid.
 */
  export class InvalidUpdateError<T> extends Error {
  constructor(
    violations: AtLeastOne<ModelFieldViolations<T>>,
    message = 'Model cannot be updated in a way that would make it invalid',
  ) {
    super(message);
    this.name = 'InvalidUpdateError';
    Object.setPrototypeOf(this, InvalidUpdateError.prototype);
  }
}