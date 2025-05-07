import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsDependentOn(
  property: string | string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsDependentOn',
      target: object.constructor,
      propertyName: propertyName,
      constraints: property instanceof Array ? property : [property],
      options: {
        ...validationOptions,
        message: `${propertyName} is dependent on ${property.toString()}.`,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (property instanceof Array) {
            property.forEach((prop) => {
              const dependentValue = (args.object as any)[prop];
              if (!dependentValue) {
                return false;
              }
            });
          } else {
            const dependentValue = (args.object as any)[property];
            if (!dependentValue) {
              return false;
            }
          }
          return true;
        },
      },
    });
  };
}
