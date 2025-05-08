import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export function MultiFile(
  fields: string[],
  properties?: Record<string, SchemaObject | ReferenceObject>,
  required?: string[],
) {
  const fileProperties = {
    ...fields.reduce((acc, key) => {
      acc[key] = { type: 'string', format: 'binary' };
      return acc;
    }, {}),
  };

  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          ...fileProperties,
          ...properties,
        },
        required,
      },
    }),
  );
}
