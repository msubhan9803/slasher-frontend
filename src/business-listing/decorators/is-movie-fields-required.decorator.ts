import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { BusinessType } from 'src/schemas/businessListing/businessListing.enums';

export function IsMovieFieldsRequired(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isMovieFieldsRequired',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as Record<string, any>;
          const businessType = obj.businesstype;

          if (businessType === BusinessType.MOVIES) {
            return value !== null && value !== undefined && value !== '';
          }
          return true;
        },
        defaultMessage() {
          return 'Field is required for movie business type';
        },
      },
    });
  };
}
