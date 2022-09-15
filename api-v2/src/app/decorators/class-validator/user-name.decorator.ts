import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsValidUsername(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsValidUsername',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: {
        message: 'Username must be between 3 and 30 characters, can only include letters/numbers/special characters, '
          + 'and cannot begin or end with a special character.  Allowed special characters: period (.), hyphen (-), and underscore (_)',
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
