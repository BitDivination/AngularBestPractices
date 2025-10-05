/**
 * Type must have at least one field.
 * Defining the required interface second forces the one field to be required
 */
export type AtLeastOne<T, Keys extends keyof T = keyof T> = {
  // Remove any optional modifiers from the original definition
  [K in Keys]-?:
    // Makes one field required
    Required<Pick<T, K>>
    // Marks all other fields optional and unions the together (Required wins in collision).
    & Partial<Pick<T, Exclude<Keys, K>>>
  ;
}[Keys];
