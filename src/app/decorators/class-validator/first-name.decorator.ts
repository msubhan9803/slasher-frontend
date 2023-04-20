import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsValidFirstname(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsValidFirstname',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: {
        message: 'Firstname must be between 3 and 30 characters, can only include letters/numbers/special characters, '
          + 'and cannot begin or end with a special character.  Allowed special characters: period (.), hyphen (-), and space ( )',
        ...validationOptions,
      },
      validator: {
        validate(value: any): any {
          const nameLength = value.length;
          if (nameLength < 3 || nameLength > 30) {
            return false;
          }

          if (/^[a-f\d]{24}$/i.test(value)) {
            // This is our user id format, so we don't want a firstname to match this in case we ever
            // have an endpoint that matches on user id OR firstname
            return false;
          }

          if (!(/^[A-Za-z0-9][-A-Za-z0-9 .-]*[A-Za-z0-9]$/.test(value))) {
            return false; // validate that firstname starts, contains, and ends with the correct characters
          }

          return true;
        },
      },
    });
  };
}
