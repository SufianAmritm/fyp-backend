import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747935352055 implements MigrationInterface {
  name = 'Migration1747935352055';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employees" ADD "retirement_date" TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "employees" ADD "grade" integer`);
    await queryRunner.query(
      `ALTER TABLE "employees" ADD "years_of_service" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD "year_of_induction" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD "service_number" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "managers" ADD "retirement_date" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "managers" DROP COLUMN "retirement_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP COLUMN "service_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP COLUMN "year_of_induction"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP COLUMN "years_of_service"`,
    );
    await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "grade"`);
    await queryRunner.query(
      `ALTER TABLE "employees" DROP COLUMN "retirement_date"`,
    );
  }
}
