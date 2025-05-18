import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747584623995 implements MigrationInterface {
  name = 'Migration1747584623995';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" ADD "vacancy_reason" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" DROP COLUMN "vacancy_reason"`,
    );
  }
}
