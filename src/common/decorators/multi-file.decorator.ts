import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
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
    UseInterceptors(
      FileFieldsInterceptor(
        fields.map((key) => ({ name: key, maxCount: 1 })),
        {},
      ),
    ),
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
