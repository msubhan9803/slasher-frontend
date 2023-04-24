import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsValidMongoDbLocation(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsValidMongoDbLocation',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: {
        message: (validationArgs) => `The '${validationArgs.property}' field must have`
        + "a shape of { type: 'Point', coordinates: [number, number] }",
        ...validationOptions,
      },
      validator: {
        validate(value: any): any {
          return value?.type === 'Point'
              && value?.coordinates?.length === 2
              && value?.coordinates?.every((val) => typeof (val) === 'number');
        },
      },
    });
  };
}
