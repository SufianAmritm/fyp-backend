import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1746964073992 implements MigrationInterface {
  name = 'Migration1746964073992';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "employees_colony_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" RENAME COLUMN "colony_id" TO "station_id"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."applications_status_enum" AS ENUM('pending', 'approved', 'rejected', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "applications" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "employee_id" integer NOT NULL, "status" "public"."applications_status_enum" NOT NULL DEFAULT 'pending', "reason" character varying, "created_by_id" integer NOT NULL, "approved_by_id" integer, "rejected_by_id" integer, CONSTRAINT "PK_938c0a27255637bde919591888f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "application_priorities" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "application_id" integer NOT NULL, "colony_id" integer NOT NULL, "priority" integer NOT NULL, CONSTRAINT "PK_2a0007064eca4a37029c758b183" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_verifications" ADD "approved_by_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_verifications" ADD "rejected_by_id" integer`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."employee_verifications_status_enum" RENAME TO "employee_verifications_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."employee_verifications_status_enum" AS ENUM('pending', 'approved', 'rejected', 'cancelled')`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_verifications" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_verifications" ALTER COLUMN "status" TYPE "public"."employee_verifications_status_enum" USING "status"::"text"::"public"."employee_verifications_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_verifications" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."employee_verifications_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_verifications" ADD CONSTRAINT "employee_verification_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_verifications" ADD CONSTRAINT "employee_verification_rejected_by_id_fkey" FOREIGN KEY ("rejected_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "employees_station_id_fk" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "applications_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "applications_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "applications_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "applications_rejected_by_id_fkey" FOREIGN KEY ("rejected_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_priorities" ADD CONSTRAINT "applications_priorities_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_priorities" ADD CONSTRAINT "applications_priorities_colony_id_fkey" FOREIGN KEY ("colony_id") REFERENCES "colonies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_priorities" DROP CONSTRAINT "applications_priorities_colony_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_priorities" DROP CONSTRAINT "applications_priorities_application_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP CONSTRAINT "applications_rejected_by_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP CONSTRAINT "applications_approved_by_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP CONSTRAINT "applications_created_by_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP CONSTRAINT "applications_employee_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "employees_station_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_verifications" DROP CONSTRAINT "employee_verification_rejected_by_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_verifications" DROP CONSTRAINT "employee_verification_approved_by_id_fkey"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."employee_verifications_status_enum_old" AS ENUM('pending', 'approved', 'rejected')`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_verifications" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_verifications" ALTER COLUMN "status" TYPE "public"."employee_verifications_status_enum_old" USING "status"::"text"::"public"."employee_verifications_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_verifications" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."employee_verifications_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."employee_verifications_status_enum_old" RENAME TO "employee_verifications_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_verifications" DROP COLUMN "rejected_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_verifications" DROP COLUMN "approved_by_id"`,
    );
    await queryRunner.query(`DROP TABLE "application_priorities"`);
    await queryRunner.query(`DROP TABLE "applications"`);
    await queryRunner.query(`DROP TYPE "public"."applications_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "employees" RENAME COLUMN "station_id" TO "colony_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "employees_colony_id_fk" FOREIGN KEY ("colony_id") REFERENCES "colonies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
