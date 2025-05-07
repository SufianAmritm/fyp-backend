import {
  CopyObjectCommandInput,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { TIME_IN_SECONDS } from 'src/common/constants/enums';
import { AwsUploadResponse } from '../types';

export const IS3Service = Symbol('IS3Service');
export interface IS3Service {
  getFromS3(
    options: GetObjectCommandInput,
  ): Promise<GetObjectCommandOutput | Error>;
  uploadFile(options: PutObjectCommandInput): Promise<AwsUploadResponse>;
  copyFile(options: CopyObjectCommandInput): Promise<AwsUploadResponse>;
  getSignedUrl(
    options: GetObjectCommandInput,
    expireTime: TIME_IN_SECONDS,
  ): Promise<string | Error>;
  deleteFromS3(
    keys: string[],
    bucketEnvVariableName: string,
  ): Promise<string[] | Error | null>;
}
