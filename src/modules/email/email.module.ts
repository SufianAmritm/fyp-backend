import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { IEmailService } from './interfaces/email.interface';

const EmailServiceProvider = [
  {
    provide: IEmailService,
    useClass: EmailService,
  },
];

@Module({
  providers: [...EmailServiceProvider],
  exports: [...EmailServiceProvider],
  controllers: [],
})
export class EmailModule {}
