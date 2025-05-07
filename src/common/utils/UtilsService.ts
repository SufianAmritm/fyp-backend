import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, genSalt, hash } from 'bcryptjs';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

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
      date = new Date(year,0,1);
    } else {
      date = new Date(new Date().getFullYear(),0,1);
    }
    date.setHours(0, 0, 0, 0);
    return date;
  }
  getEndOfYear(year?: number): Date {
    let date: Date;
    if (year) {
      date = new Date(year,11,31);
    } else {
      date = new Date(new Date().getFullYear(),11,31);
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
}
