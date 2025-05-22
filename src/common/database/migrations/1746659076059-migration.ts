import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1746659076059 implements MigrationInterface {
  name = 'Migration1746659076059';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "managers" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "picture" character varying, "station_id" integer NOT NULL, "userId" integer NOT NULL, "created_by_id" integer NOT NULL, "user_id" integer, CONSTRAINT "REL_f041d245569d3b05305ec8dbea" UNIQUE ("user_id"), CONSTRAINT "PK_e70b8cc457276d9b4d82342a8ff" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "managers_user_id_uk" ON "managers" ("userId") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "stations" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "division_id" integer NOT NULL, "created_by_id" integer NOT NULL, CONSTRAINT "PK_f047974bd453c85b08bab349367" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "stations_name_division_id_uk" ON "stations" ("name", "division_id") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "divisions" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "created_by_id" integer NOT NULL, CONSTRAINT "PK_c1f864477b3fd0954564108ed96" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "divisions_name_uk" ON "divisions" ("name") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" DROP CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "roles_name_uk" ON "roles" ("name") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "managers" ADD CONSTRAINT "managers_created_by_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "managers" ADD CONSTRAINT "managers_station_id_fk" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "managers" ADD CONSTRAINT "managers_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stations" ADD CONSTRAINT "stations_created_by_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stations" ADD CONSTRAINT "stations_division_id_fk" FOREIGN KEY ("division_id") REFERENCES "divisions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "divisions" ADD CONSTRAINT "divisions_created_by_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "divisions" DROP CONSTRAINT "divisions_created_by_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stations" DROP CONSTRAINT "stations_division_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stations" DROP CONSTRAINT "stations_created_by_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "managers" DROP CONSTRAINT "managers_user_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "managers" DROP CONSTRAINT "managers_station_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "managers" DROP CONSTRAINT "managers_created_by_id_fk"`,
    );
    await queryRunner.query(`DROP INDEX "public"."roles_name_uk"`);
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`,
    );
    await queryRunner.query(`DROP INDEX "public"."divisions_name_uk"`);
    await queryRunner.query(`DROP TABLE "divisions"`);
    await queryRunner.query(
      `DROP INDEX "public"."stations_name_division_id_uk"`,
    );
    await queryRunner.query(`DROP TABLE "stations"`);
    await queryRunner.query(`DROP INDEX "public"."managers_user_id_uk"`);
    await queryRunner.query(`DROP TABLE "managers"`);
  }
}
