import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { DateTime } from 'luxon';

const getEarlierDate = (yearsBeforeToday: number) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsBeforeToday);
  return d;
};

export function MinYearsBeforeToday(numYears: number, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'MinYearsBeforeToday',
      target: object.constructor,
      propertyName,
      constraints: [numYears],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments): any {
          const [numyearsConstraint] = args.constraints;

          const zeroHMSMilli = {
            hour: 0, minute: 0, second: 0, millisecond: 0,
          };
          const midnightOnGivenDate = DateTime.fromJSDate(value).set(zeroHMSMilli);
          const midnightOnlatestAllowedIsoDate = DateTime.now().set(zeroHMSMilli).minus({ years: numyearsConstraint });

          return midnightOnGivenDate <= midnightOnlatestAllowedIsoDate;
        },
        defaultMessage(args: ValidationArguments) {
          const [numyearsConstraint] = args.constraints;
          return `${propertyName} must be earlier than ${getEarlierDate(numyearsConstraint).toISOString()}`;
        },
      },
    });
  };
}
