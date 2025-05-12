import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747087913193 implements MigrationInterface {
  name = 'Migration1747087913193';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" DROP CONSTRAINT "vacancy_requests_apartment_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "employees_station_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" RENAME COLUMN "station_id" TO "colony_id"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transfer_requests_status_enum" AS ENUM('pending', 'approved', 'rejected', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transfer_requests" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "from_colony_id" integer NOT NULL, "to_colony_id" integer NOT NULL, "status" "public"."transfer_requests_status_enum" NOT NULL DEFAULT 'pending', "reason" character varying, "within_station" boolean NOT NULL DEFAULT false, "approved_by_from_id" integer, "approved_by_to_id" integer, "rejected_by_from_id" integer, "rejected_by_to_id" integer, "created_by_id" integer, CONSTRAINT "PK_f97530bf47e4af43166089627ba" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" DROP COLUMN "apartment_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" DROP CONSTRAINT "vacancy_requests_created_by_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" ALTER COLUMN "occupation_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" DROP CONSTRAINT "REL_8ad25d617dfb4ad74654918042"`,
    );
    await queryRunner.query(
      `ALTER TABLE "occupations" DROP CONSTRAINT "occupations_vacant_by_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "occupations" DROP CONSTRAINT "REL_e07937f92c64c4511d8872db93"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" ADD CONSTRAINT "vacancy_requests_occupation_id_fk" FOREIGN KEY ("occupation_id") REFERENCES "occupations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" ADD CONSTRAINT "vacancy_requests_created_by_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "occupations" ADD CONSTRAINT "occupations_vacant_by_id_fk" FOREIGN KEY ("vacant_by_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_from_colony_id_fk" FOREIGN KEY ("from_colony_id") REFERENCES "colonies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_to_colony_id_fk" FOREIGN KEY ("to_colony_id") REFERENCES "colonies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_created_by_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_approved_by_from_id_fk" FOREIGN KEY ("approved_by_from_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_rejected_by_from_id_fk" FOREIGN KEY ("rejected_by_from_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_approved_by_to_id_fk" FOREIGN KEY ("approved_by_to_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_rejected_by_to_id_fk" FOREIGN KEY ("rejected_by_to_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "employees_colony_id_fk" FOREIGN KEY ("colony_id") REFERENCES "colonies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "employees_colony_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" DROP CONSTRAINT "transfer_requests_rejected_by_to_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" DROP CONSTRAINT "transfer_requests_approved_by_to_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" DROP CONSTRAINT "transfer_requests_rejected_by_from_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" DROP CONSTRAINT "transfer_requests_approved_by_from_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" DROP CONSTRAINT "transfer_requests_created_by_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" DROP CONSTRAINT "transfer_requests_to_colony_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" DROP CONSTRAINT "transfer_requests_from_colony_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "occupations" DROP CONSTRAINT "occupations_vacant_by_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" DROP CONSTRAINT "vacancy_requests_created_by_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" DROP CONSTRAINT "vacancy_requests_occupation_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "occupations" ADD CONSTRAINT "REL_e07937f92c64c4511d8872db93" UNIQUE ("vacant_by_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "occupations" ADD CONSTRAINT "occupations_vacant_by_id_fk" FOREIGN KEY ("vacant_by_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" ADD CONSTRAINT "REL_8ad25d617dfb4ad74654918042" UNIQUE ("created_by_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" ALTER COLUMN "occupation_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" ADD CONSTRAINT "vacancy_requests_created_by_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" ADD "apartment_id" integer NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "transfer_requests"`);
    await queryRunner.query(
      `DROP TYPE "public"."transfer_requests_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" RENAME COLUMN "colony_id" TO "station_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "employees_station_id_fk" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" ADD CONSTRAINT "vacancy_requests_apartment_id_fk" FOREIGN KEY ("occupation_id") REFERENCES "occupations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
