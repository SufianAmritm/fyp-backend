import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1746982872200 implements MigrationInterface {
  name = 'Migration1746982872200';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."vacancy_requests_status_enum" AS ENUM('pending', 'approved', 'rejected', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "vacancy_requests" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "apartment_id" integer NOT NULL, "status" "public"."vacancy_requests_status_enum" NOT NULL DEFAULT 'pending', "reason" character varying, "approved_by_id" integer, "rejected_by_id" integer, "created_by_id" integer, "occupation_id" integer, CONSTRAINT "REL_8ad25d617dfb4ad74654918042" UNIQUE ("created_by_id"), CONSTRAINT "PK_3d4d8a77f86b671780a61d30e35" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" ADD CONSTRAINT "vacancy_requests_apartment_id_fk" FOREIGN KEY ("occupation_id") REFERENCES "occupations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" ADD CONSTRAINT "vacancy_requests_created_by_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" ADD CONSTRAINT "vacancy_requests_approved_by_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" ADD CONSTRAINT "vacancy_requests_rejected_by_id_fk" FOREIGN KEY ("rejected_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" DROP CONSTRAINT "vacancy_requests_rejected_by_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" DROP CONSTRAINT "vacancy_requests_approved_by_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" DROP CONSTRAINT "vacancy_requests_created_by_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" DROP CONSTRAINT "vacancy_requests_apartment_id_fk"`,
    );
    await queryRunner.query(`DROP TABLE "vacancy_requests"`);
    await queryRunner.query(
      `DROP TYPE "public"."vacancy_requests_status_enum"`,
    );
  }
}
