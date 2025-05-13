import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747096296287 implements MigrationInterface {
  name = 'Migration1747096296287';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" DROP CONSTRAINT "vacancy_requests_created_by_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" DROP CONSTRAINT "transfer_requests_created_by_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" ADD "employee_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" ADD "employee_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" ADD CONSTRAINT "vacancy_requests_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" ADD CONSTRAINT "vacancy_requests_created_by_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_created_by_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" DROP CONSTRAINT "transfer_requests_created_by_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" DROP CONSTRAINT "transfer_requests_employee_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" DROP CONSTRAINT "vacancy_requests_created_by_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" DROP CONSTRAINT "vacancy_requests_employee_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" DROP COLUMN "employee_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" DROP COLUMN "employee_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_created_by_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" ADD CONSTRAINT "vacancy_requests_created_by_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
