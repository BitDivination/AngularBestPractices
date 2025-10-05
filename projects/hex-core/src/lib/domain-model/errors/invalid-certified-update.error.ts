import { CertifiedUpdate } from "../../certified-update";

export class InvalidCertifiedUpdateError<T extends object, F extends keyof T> extends Error {
  constructor(
    failedCert: CertifiedUpdate<T, F>,
    message = 'Failed to apply certified update'
  ) {
    super(message);
    this.name = 'InvalidCertifiedUpdateError';
    Object.setPrototypeOf(this, InvalidCertifiedUpdateError.prototype);
  }
}