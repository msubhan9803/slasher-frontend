import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsOnlyDate(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsOnlyDate',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: {
        message: 'You are not eligble',
        ...validationOptions,
      },
      validator: {
        validate(value: any): any {
          const today = new Date();
          const birthDate = new Date(value);
          let age = today.getFullYear() - birthDate.getFullYear();
          const month = today.getMonth() - birthDate.getMonth();
          if (
            month < 0
            || (month === 0 && today.getDate() < birthDate.getDate())
          ) {
            age -= 1;
          }
          return age >= 18;
        },
      },
    });
  };
}
