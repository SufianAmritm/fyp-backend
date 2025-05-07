import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export function SingleFile(
  field: string,
  properties?: Record<string, SchemaObject | ReferenceObject>,
  nullable = false,
  required?: string[],
) {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    UseInterceptors(FileInterceptor(field)),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [field]: {
            type: 'string',
            format: 'binary',
            nullable,
          },
          ...properties,
        },
        required,
      },
    }),
  );
}
