import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1746742050291 implements MigrationInterface {
  name = 'Migration1746742050291';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."managers_user_id_uk"`);
    await queryRunner.query(
      `CREATE TABLE "employees" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "picture" character varying, "cnic_front" character varying, "cnic_back" character varying, "service_card" character varying, "address" character varying, "colony_id" integer, "members" integer, "user_id" integer NOT NULL, "profile_complete" boolean NOT NULL DEFAULT false, "created_by_id" integer, CONSTRAINT "REL_2d83c53c3e553a48dadb9722e3" UNIQUE ("user_id"), CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "managers" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "managers" DROP CONSTRAINT "managers_user_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "managers" ALTER COLUMN "user_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "managers_user_id_uk" ON "managers" ("user_id") WHERE deleted_at IS NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "managers" ADD CONSTRAINT "managers_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "employees_created_by_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "managers_station_id_fk" FOREIGN KEY ("colony_id") REFERENCES "colonies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "employees_user_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "managers_station_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "employees_created_by_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "managers" DROP CONSTRAINT "managers_user_id_fk"`,
    );
    await queryRunner.query(`DROP INDEX "public"."managers_user_id_uk"`);
    await queryRunner.query(
      `ALTER TABLE "managers" ALTER COLUMN "user_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "managers" ADD CONSTRAINT "managers_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "managers" ADD "userId" integer NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "employees"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "managers_user_id_uk" ON "managers" ("userId") WHERE (deleted_at IS NOT NULL)`,
    );
  }
}
