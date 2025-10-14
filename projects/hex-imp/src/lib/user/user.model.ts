import { DomainModel, FieldMetadata } from '@hex/core';
import { UserDataModel } from './user.interface';

export class User extends DomainModel<UserDataModel> {
  protected readonly domainObjectMetadata: { [K in keyof UserDataModel]: FieldMetadata } = {
    id: { required: true },
    name: { required: true, validator: (value) => value.matches('[0-9]+') ? 'Name cannot contain numbers' : null },
    username: { required: true },
    email: { required: true },
    phone: { required: true },
    website: { required: true },
  };

  constructor(
    model: UserDataModel,
    builderMode = false,
  ) {super(User, model, builderMode);}

  get id(): number | string {
    return this.model.id;
  }

  getDisplayName(): string {
    return `${this.model.username} (${this.model.name})`
  }
}
