import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, genSalt, hash } from 'bcryptjs';
import { Queue } from 'bull';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import * as path from 'path';
import { QueryFailedError } from 'typeorm';
import { v4 } from 'uuid';

@Injectable()
export class UtilsService {
  constructor(public configService: ConfigService) {}

  getEnvironmentVariable<T>(key: string, defaultValue: T = undefined): T {
    return this.configService.get<T>(key) || defaultValue;
  }

  encrypt(text: string): string {
    const serverKey = this.getEnvironmentVariable<string>('SERVER_KEY');
    const serverIv = this.getEnvironmentVariable<string>('SERVER_IV');
    const cipher = createCipheriv('aes-256-cbc', serverKey, serverIv);
    let encryptedPayload = cipher.update(text, 'utf8', 'hex');
    encryptedPayload += cipher.final('hex');
    const randomString = randomBytes(3).toString('hex');
    return `${encryptedPayload}${randomString}`;
  }

  decrypt(encryptedText: string): string {
    try {
      const serverKey = this.getEnvironmentVariable<string>('SERVER_KEY');
      const serverIv = this.getEnvironmentVariable<string>('SERVER_IV');
      const decipher = createDecipheriv('aes-256-cbc', serverKey, serverIv);
      const actualEncryptedText = encryptedText.slice(0, -6);

      const decryptedText = Buffer.concat([
        decipher.update(Buffer.from(actualEncryptedText, 'hex')),
        decipher.final(),
      ]);
      return decryptedText.toString('utf8');
    } catch (error) {
      throw new BadRequestException();
    }
  }

  awsUploadKeyBuilder(
    fileName: string,
    folder?: string,
    bucket?: string,
    orderId?: bigint,
  ): string {
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    const sanitizedFileName = fileName
      .replace(fileExtension, '')
      .replace(/[^a-zA-Z0-9.]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const uniqueIdentifier = v4().toString();

    let key = `${uniqueIdentifier}-${sanitizedFileName}${orderId ? -orderId : ''}${fileExtension}`;
    if (folder) {
      key = `${folder}/${key}`;
    }
    if (bucket) {
      key = `${bucket}/${key}`;
    }
    return key;
  }

  awsPublicUrlBuilder(bucket: string, key: string, folder?: string): string {
    let url = `https://${bucket}.s3.amazonaws.com/`;
    if (folder) {
      url += `${folder}/`;
    }
    url += key;
    return url;
  }

  saveFileToPublicFolder(file: Express.Multer.File): string | undefined {
    let savePath = null;
    try {
      const extension = file.originalname.split('.').pop();
      const uniqueId = `${crypto.randomUUID()}.${extension}`;

      savePath = path.join(__dirname, `../../../public`);
      const dir = path.dirname(savePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(`${savePath}/${uniqueId}`, file.buffer);
      return `${this.configService.get('BASE_URL')}/${uniqueId}`;
    } catch (error) {
      console.error(error);
      if (savePath) {
        fs.unlinkSync(savePath);
      }
    }
    return undefined;
  }

  async redisAvailabilityCheck(client: any): Promise<boolean> {
    let count = 0;
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (client.status === 'ready') {
          clearInterval(interval);
          resolve(true);
        }
        count++;
        if (count === 5) {
          clearInterval(interval);
          reject(false);
        }
      }, 2000);
    });
  }

  async addJob(queue: Queue, processor: string, data: any): Promise<void> {
    const redisStatus = queue.client.status;
    if (redisStatus !== 'ready') {
      console.error('Failed to reconnect to Redis');
      return;
    }

    await queue.add(processor, data);
  }

  getStateFromUrl(url: string): string | null {
    const params = new URLSearchParams(url);
    return params.get('state');
  }

  secondsToMinutesAndHours(s: number) {
    const hours = Math.floor(s / 3600) || 0;
    const minutes = Math.floor((s % 3600) / 60) || 0;
    const seconds = s % 60 || 0;
    return { hours, minutes, seconds };
  }

  async hash(data: string): Promise<string> {
    const salt = await genSalt();
    return hash(data, salt);
  }

  async compare(data: string, encrypted: string): Promise<boolean> {
    return compare(data, encrypted);
  }

  getStartOfMonth(): Date {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  getEndOfMonth(): Date {
    const endOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
    );
    endOfMonth.setHours(0, 0, 0, 0);
    return endOfMonth;
  }
  getStartOfWeek(): Date {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay());
    date.setHours(0, 0, 0, 0);
    return date;
  }
  getEndOfWeek(): Date {
    const startOfWeek = this.getStartOfWeek();
    startOfWeek.setDate(startOfWeek.getDate() + 6);
    startOfWeek.setHours(23, 59, 59, 999);
    return startOfWeek;
  }
  getStartOfYear(year?: number): Date {
    let date: Date;
    if (year) {
      date = new Date(year, 0, 1);
    } else {
      date = new Date(new Date().getFullYear(), 0, 1);
    }
    date.setHours(0, 0, 0, 0);
    return date;
  }
  getEndOfYear(year?: number): Date {
    let date: Date;
    if (year) {
      date = new Date(year, 11, 31);
    } else {
      date = new Date(new Date().getFullYear(), 11, 31);
    }
    date.setHours(23, 59, 59, 999);
    return date;
  }

  getEndOfDay(): Date {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date;
  }
  getStartOfDay(): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  buildTypeormErrors(error: QueryFailedError) {
    let message = '';
    switch (error['code']) {
      case '23503': {
        const match = error['detail']?.match(
          /Key \((.*?)\)=\((.*?)\) is not present in table "(.*?)"/,
        );

        if (match) {
          const [, column, value, table] = match;
          message = `The ${column} value ${value} does not exist in ${table} table`;
        }
      }
    }
    if (message) {
      throw new BadRequestException(message);
    }
    throw error;
  }

  async processCSVFile<T>(
    file: Express.Multer.File,
    settings: {
      dto: Record<string, any>;
      validatorColumns: string[];
      rowStart: number;
      arbitraryReg: RegExp;
      impReg: RegExp;
      arbitraryReplacementReg: RegExp;
      arbitraryVal: string;
    },
  ): Promise<T[]> {
    const parser = parse(file.buffer, {
      columns: true,
      skip_empty_lines: true,
    });

    const {
      validatorColumns,
      rowStart,
      arbitraryReg,
      arbitraryReplacementReg,
      arbitraryVal,
      impReg,
      dto,
    } = settings;

    const dtoMap = new Map<string, any>();
    for (const [key, val] of Object.entries(dto)) {
      dtoMap.set(key, val);
    }

    let row = rowStart;
    const records: T[] = [];

    // Wrap the parser in a Promise
    return new Promise((resolve, reject) => {
      parser.on('data', (chunk) => {
        try {
          const columnsFromCSV = new Set(Object.keys(chunk));
          const record = {} as unknown as T;

          validatorColumns.forEach((col) => {
            if (impReg.test(col)) {
              const columnName = col.slice(0, -1);
              const isArbitrary = arbitraryReg.test(columnName);

              if (!columnsFromCSV.has(columnName) && !isArbitrary) {
                throw new BadRequestException(
                  `Column ${columnName} is missing at row ${row}`,
                );
              } else if (!columnsFromCSV.has(columnName) && isArbitrary) {
                const baseName = columnName.replace(
                  arbitraryReplacementReg,
                  arbitraryVal,
                );
                const hasMatchingColumn = Array.from(columnsFromCSV).some(
                  (csvCol) => {
                    const csvBaseName = csvCol.replace(
                      arbitraryReplacementReg,
                      arbitraryVal,
                    );
                    return csvBaseName === baseName;
                  },
                );
                if (!hasMatchingColumn) {
                  throw new BadRequestException(
                    `Column ${columnName} is missing at row ${row}`,
                  );
                }
              } else {
                const columnValue = chunk[columnName];
                if (!columnName || columnValue === '') {
                  throw new BadRequestException(
                    `Column ${columnName} value is required at row ${row}`,
                  );
                }
              }
            }
          });

          dtoMap.forEach((from, to) => {
            if (typeof from === 'object') {
              if (from.value) {
                let value = '';
                let arbitraryValue = '';
                const baseName = from.value.replace(
                  arbitraryReplacementReg,
                  arbitraryVal,
                );
                Object.entries(chunk).forEach(([key, csvValue]) => {
                  const csvBaseName = key.replace(
                    arbitraryReplacementReg,
                    arbitraryVal,
                  );
                  if (csvBaseName === baseName) {
                    value = csvValue as any;
                    arbitraryValue = key.match(arbitraryReplacementReg)[1];
                  }
                  record[to] = {
                    value,
                    arbitraryValue,
                  };
                });
              }
            } else {
              let fr = from;
              if (impReg.test(from)) {
                fr = from.slice(0, -1);
              }
              record[to] = chunk[fr];
            }
          });

          records.push(record);
          row++;
        } catch (error) {
          reject(error);
        }
      });

      parser.on('end', () => {
        console.info('CSV parse complete');
        resolve(records);
      });

      parser.on('error', (error) => {
        console.error(error.message, error.stack);
        reject(error);
      });
    });
  }
}
