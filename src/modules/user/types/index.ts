import { EntityManager } from 'typeorm';
import { TransactionRunner } from '../../../common/database/utils/db-transaction-factory';
import { User } from '../entities/user.entity';

export type EmailData = {
  name: string;
  email: string;
  role: string;
  otp?: string;
  frontendBaseUrl?: string;
};
export type NewManagerUserReturn = {
  runner: TransactionRunner;
  user: User;
  transactionManager: EntityManager;
  emailData: EmailData;
};
