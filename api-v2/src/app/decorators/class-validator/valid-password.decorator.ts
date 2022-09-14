import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsValidPassword(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsValidPassword',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: {
        message: 'Password must at least 8 characters long, contain at least one (1) capital letter, '
        + 'and contain at least one (1) special character.',
        ...validationOptions,
      },
      validator: {
        validate(value: any): any {
          const passwordRegex = /^(?=.*[A-Z])(?=.*[?!@#$%^&*()_+=,-])[a-zA-Z0-9?!@#$%^&*()-_+=,]{8,}$/;
          return passwordRegex.test(value);
        },
      },
    });
  };
}
