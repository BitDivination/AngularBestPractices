import { AtLeastOne } from "../../utils/at-least-one-field.type";
import { ModelFieldViolations } from "./model-field-violations.error";

/**
 * Error thrown when using the "builder mode" to construct a model, and the getModel function
 * is used before the model is complete or valid.
 */
export class IncompleteModelError<T> extends Error {
  constructor(
    violations: AtLeastOne<ModelFieldViolations<T>>,
    message = 'Cannot instantiate model because it does not fulfil the metadata.',
  ) {
    super(message);
    this.name = 'IncompleteModelError';
    Object.setPrototypeOf(this, IncompleteModelError.prototype);
  }
}