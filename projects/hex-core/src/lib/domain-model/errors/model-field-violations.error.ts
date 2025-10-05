export interface ModelFieldViolations<T> {
  syncFields: (keyof T)[];
  requiredFields: (keyof T)[];
  asyncFields: (keyof T)[];
}