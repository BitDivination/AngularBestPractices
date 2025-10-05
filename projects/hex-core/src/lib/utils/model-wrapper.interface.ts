/**
 * Intended as a pseudo-serialize function for Domain Objects to communicate with the existing architecture.
 */
export interface ModelWrapper<T extends object> {
  getModel(): T;
}
