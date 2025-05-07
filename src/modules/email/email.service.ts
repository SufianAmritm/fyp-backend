import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import * as fs from 'fs';
import Handlebars from 'handlebars';
import Mailgun from 'mailgun.js';
import { IMailgunClient } from 'mailgun.js/Interfaces/index';
import { MailgunMessageData } from 'mailgun.js/Types/index';
import { join } from 'path';
import { IEmailService } from './interfaces/email.interface';

@Injectable()
export class EmailService implements IEmailService {

  private readonly mailGunClient: IMailgunClient;

  constructor(private readonly configService: ConfigService) {
    const mailgun = new Mailgun(FormData);
    this.mailGunClient = mailgun.client({
      username: 'support',
      key: this.configService.get<string>('MAILGUN_API_KEY'),
      timeout: 6000,
    });
  }

  async send(
    email: string,
    subject: string,
    slug: string,
    data: any,
    attachment?: any,
    inline?: any,
  ): Promise<boolean> {
    try {
      const templatePath = join(__dirname, `./templates/${slug}.handlebars`);

      const template = Handlebars.compile(
        fs.readFileSync(templatePath, 'utf-8'),
      );
      const templateWithData = template(data);

      const options: MailgunMessageData = {
        from: this.configService.get<string>('FROM_EMAIL'),
        to: email,
        subject,
        html: templateWithData,
        attachment,
        inline,
      };

      await this.mailGunClient.messages.create(
        this.configService.get<string>('DOMAIN'),
        options,
      );
      return true;
    } catch (error) {
      console.error('Error rendering EJS template:', error);
      return false;
    }
  }
}
