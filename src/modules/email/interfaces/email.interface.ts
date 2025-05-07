//! replace with any email system we will use, mailgun is for boiler

import { MessagesSendResult } from 'mailgun.js/Types/index';

export const IEmailService = Symbol('IEmailService');
export interface IEmailService {
  send(
    email: string,
    subject,
    slug: string,
    data: any,
    attachment?: any,
    inline?: any,
  ): Promise<boolean>;
}
