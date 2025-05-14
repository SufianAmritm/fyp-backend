import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747263155626 implements MigrationInterface {
  name = 'Migration1747263155626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" ADD "cache_apartment_id" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" DROP COLUMN "cache_apartment_id"`,
    );
  }
}
