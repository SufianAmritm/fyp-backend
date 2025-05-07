import {
  CopyObjectCommand,
  CopyObjectCommandInput,
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable } from '@nestjs/common';
import { AWS_PROVIDERS, TIME_IN_SECONDS } from 'src/common/constants/enums';
import { UtilsService } from 'src/common/utils/UtilsService';
import { IS3Service } from '../interface/aws-s3.interface';
import { AwsUploadResponse } from '../types';

@Injectable()
export class AwsS3Service implements IS3Service {
  constructor(
    @Inject(AWS_PROVIDERS.S3) private readonly client: S3Client,
    private readonly utilsService: UtilsService,
  ) {}

  async getFromS3(
    options: GetObjectCommandInput,
  ): Promise<GetObjectCommandOutput | Error> {
    const bucket = this.utilsService.getEnvironmentVariable<string>(
      options.Bucket,
    );
    const command = new GetObjectCommand({ ...options, Bucket: bucket });

    const getResponse = await this.client.send(command);
    if (getResponse.$metadata.httpStatusCode === 200) {
      return getResponse;
    }
    return new Error('Failed to get object');
  }

  async getSignedUrl(
    options: GetObjectCommandInput,
    expireTime: TIME_IN_SECONDS,
  ): Promise<string | Error> {
    const bucket = this.utilsService.getEnvironmentVariable<string>(
      options.Bucket,
    );
    const command = new GetObjectCommand({ ...options, Bucket: bucket });

    return getSignedUrl(this.client, command, {
      expiresIn: expireTime,
    });
  }

  async deleteFromS3(
    keys: string[],
    bucketEnvVariableName: string,
  ): Promise<string[] | Error | null> {
    const bucket = this.utilsService.getEnvironmentVariable<string>(
      bucketEnvVariableName,
    );
    const opt = [];

    keys.forEach((key) => {
      const deleteCommand: DeleteObjectCommand = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      opt.push(this.client.send(deleteCommand));
    });
    const response = await Promise.allSettled(opt);
    const failedDeleteKeys = response
      .map((res, index) => (res.status === 'fulfilled' ? null : keys[index]))
      .filter((key) => key !== null);
    if (failedDeleteKeys.length > 0) {
      return failedDeleteKeys;
    }
    return null;
  }

  async uploadFile(options: PutObjectCommandInput): Promise<AwsUploadResponse> {
    const bucket = this.utilsService.getEnvironmentVariable<string>(
      options.Bucket,
    );
    const uploadCommand = new PutObjectCommand({ ...options, Bucket: bucket });
    const upload = await this.client.send(uploadCommand);

    if (upload.$metadata.httpStatusCode === 200) {
      return { key: options.Key, bucket, upload };
    }
    throw new Error(
      `File upload failed with status code: ${upload.$metadata.httpStatusCode}`,
    );
  }

  async copyFile(options: CopyObjectCommandInput): Promise<AwsUploadResponse> {
    const bucket = this.utilsService.getEnvironmentVariable<string>(
      options.Bucket,
    );
    const command = new CopyObjectCommand({ ...options });
    const upload = await this.client.send(command);
    if (upload.$metadata.httpStatusCode === 200) {
      return { key: options.Key, bucket, upload };
    }
    throw new Error(
      `File copy failed with status code: ${upload.$metadata.httpStatusCode}`,
    );
  }
}
