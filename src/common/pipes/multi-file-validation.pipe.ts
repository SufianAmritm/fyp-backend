import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { APP_ERROR_MESSAGES } from '../constants/errors';
type validations = Array<{
  field: string;
  validations: {
    maxFileSize: number;
    fileType: RegExp;
    required: boolean;
  };
}>;
type multerFiles = Record<string, Express.Multer.File[]>;
export class MultiFileValidatorPipe implements PipeTransform {
  private validations: validations;
  constructor(validations: validations) {
    this.validations = validations;
  }

  transform(value: multerFiles, metadata: ArgumentMetadata) {
    this.validations.forEach((validation) => {
      if (validation.validations.required && !value[validation.field]) {
        throw new Error(APP_ERROR_MESSAGES.REQUIRED(validation.field));
      }
    });
    Object.entries(value).forEach(([key, value]) => {
      const validation = this.validations.find((item) => item.field === key);
      if (validation) {
        const file = value[0];
        if (file.size > validation.validations.maxFileSize) {
          throw new Error(APP_ERROR_MESSAGES.MAX_FILE_SIZE_5MB);
        }
        const extension = file.originalname.split('.').pop();
        console.log(extension);
        if (!validation.validations.fileType.test(`.${extension}`)) {
          const mimeType = file.mimetype.split('/').pop();
          if (!validation.validations.fileType.test(`.${mimeType}`)) {
            throw new Error(APP_ERROR_MESSAGES.INVALID_FILE_TYPE);
          }
        }
      }
    });
    return value;
  }
}
