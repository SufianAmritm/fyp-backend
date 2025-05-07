import { Logger } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

const isolationLevel: IsolationLevel = 'READ COMMITTED';

interface ITransactionRunner {
  start(className: string): Promise<void>;
  end(className: string): Promise<void>;
}

export class TransactionRunner implements ITransactionRunner {
  private logger = new Logger();
  constructor(private readonly queryRunner: QueryRunner) {}
  public async start(className: string): Promise<void> {
    if (this.queryRunner.isTransactionActive) return;
    this.logger.log(`Transaction started in ${className}`);
    await this.queryRunner.startTransaction(isolationLevel);
  }
  public async end(className: string): Promise<void> {
    if (!this.queryRunner.isTransactionActive) return;
    try {
      await this.queryRunner.commitTransaction();
    } catch (error) {
      this.logger.error(
        error?.message || `Error during transaction in ${className}`,
      );
      await this.queryRunner.rollbackTransaction();
    } finally {
      this.logger.log(`Transaction committed in ${className}`);
      await this.queryRunner.release();
    }
  }
}
