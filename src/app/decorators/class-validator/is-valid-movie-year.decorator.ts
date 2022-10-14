import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsValidMovieYear(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsValidMovieYear',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: {
        message: 'minimum year is >= 1895 and maximum year is <= 2099',
        ...validationOptions,
      },
      validator: {
        validate(value: any): any {
          const year = value;
          if (year < 1895 || year > 2099) {
            return false;
          }
          return true;
        },
      },
    });
  };
}
