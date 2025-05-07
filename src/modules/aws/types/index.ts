import { PutObjectCommandOutput } from '@aws-sdk/client-s3';

export type AwsUploadResponse = {
  key: string;
  bucket: string;
  upload: PutObjectCommandOutput;
};
