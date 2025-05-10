import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1746921085550 implements MigrationInterface {
  name = 'Migration1746921085550';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."employee_verifications_status_enum" AS ENUM('pending', 'approved', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "employee_verifications" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "employee_id" integer NOT NULL, "status" "public"."employee_verifications_status_enum" NOT NULL DEFAULT 'pending', "reason" character varying, "created_by_id" integer NOT NULL, CONSTRAINT "PK_29a1c0db2aeba7a6bdee55b77bd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_verifications" ADD CONSTRAINT "employee_verification_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_verifications" ADD CONSTRAINT "employee_verification_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee_verifications" DROP CONSTRAINT "employee_verification_created_by_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_verifications" DROP CONSTRAINT "employee_verification_employee_id_fkey"`,
    );
    await queryRunner.query(`DROP TABLE "employee_verifications"`);
    await queryRunner.query(
      `DROP TYPE "public"."employee_verifications_status_enum"`,
    );
  }
}
