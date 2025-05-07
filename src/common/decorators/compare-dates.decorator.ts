import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsDateGreaterThan(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsDateGreaterThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: {
        ...validationOptions,
        message: `${propertyName} must be greater than ${property}`,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const relatedValue = (args.object as any)[property];
          const endDate = new Date(value);
          const fromDate = new Date(relatedValue);
          if (isNaN(endDate.getTime()) || isNaN(fromDate.getTime())) {
            return false;
          }
          return endDate.getTime() > fromDate.getTime();
        },
      },
    });
  };
}
