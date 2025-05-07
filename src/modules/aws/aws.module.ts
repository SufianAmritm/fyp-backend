import { Global, Module } from '@nestjs/common';
import { AWS_PROVIDERS } from 'src/common/constants/enums';
import { AwsS3Service } from './aws-s3/aws-s3.service';
import { AwsProvider } from './aws.provider';
import { IS3Service } from './interface/aws-s3.interface';

const awsServicesProvider = [
  {
    provide: IS3Service,
    useClass: AwsS3Service,
  },
];
@Global()
@Module({
  providers: [AwsProvider(AWS_PROVIDERS.S3), ...awsServicesProvider],
  exports: [...awsServicesProvider],
})
export class AwsModule {}
