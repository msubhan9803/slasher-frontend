import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsValidUsername(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsValidUsername',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: {
        message: 'Can contain userName length between 3 to 30, Cannot start and end with any special character,'
          + 'Can only include letters, numbers, and the following special characters: [".", "-", "_"].',
        ...validationOptions,
      },
      validator: {
        validate(value: any): any {
          const nameLength = value.length;
          if (nameLength >= 3 && nameLength <= 30 && /^[a-zA-Z0-9]([a-zA-Z0-9_.-]+)[a-zA-Z0-9]$/.test(value)) {
            return true;
          }
          return false;
        },
      },
    });
  };
}
