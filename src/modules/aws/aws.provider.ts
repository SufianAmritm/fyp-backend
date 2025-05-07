import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { AWS_PROVIDERS } from 'src/common/constants/enums';

/**
 * A default aws provider, add clients inside ternary operator
 * */
export const AwsProvider = (provider: AWS_PROVIDERS) => {
  return {
    provide: provider,
    useFactory: async (configService: ConfigService) => {
      const region = configService.get('AWS_REGION');
      const credentials = {
        accessKeyId: configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: configService.get('AWS_SECRET_KEY'),
      };
      return provider === AWS_PROVIDERS.S3
        ? new S3Client({
            region,
            credentials,
          })
        : null;
    },
    inject: [ConfigService],
  };
};
