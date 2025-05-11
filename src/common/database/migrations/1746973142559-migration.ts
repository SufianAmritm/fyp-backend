import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1746973142559 implements MigrationInterface {
  name = 'Migration1746973142559';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."occupations_status_enum" AS ENUM('occupied', 'vacant', 'about_to_vacant')`,
    );
    await queryRunner.query(
      `CREATE TABLE "occupations" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "apartment_id" integer NOT NULL, "status" "public"."occupations_status_enum" NOT NULL DEFAULT 'vacant', "occupied_by_id" integer, "vacant_by_id" integer, "assigned_by_id" integer, "de_assigned_by_id" integer, "last_about_to_vacant_on" TIMESTAMP WITH TIME ZONE, "last_vacant_on" TIMESTAMP WITH TIME ZONE, "last_occupied_on" TIMESTAMP WITH TIME ZONE, CONSTRAINT "REL_db39470722a4671239e65dbb6e" UNIQUE ("apartment_id"), CONSTRAINT "REL_e07937f92c64c4511d8872db93" UNIQUE ("vacant_by_id"), CONSTRAINT "PK_0bf09083dd897df1e8ebb96b5c1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "occupations" ADD CONSTRAINT "occupations_apartment_id_fk" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "occupations" ADD CONSTRAINT "occupations_occupied_by_id_fk" FOREIGN KEY ("occupied_by_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "occupations" ADD CONSTRAINT "occupations_vacant_by_id_fk" FOREIGN KEY ("vacant_by_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "occupations" ADD CONSTRAINT "occupations_assigned_by_id_fk" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "occupations" ADD CONSTRAINT "occupations_de_assigned_by_id_fk" FOREIGN KEY ("de_assigned_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "occupations" DROP CONSTRAINT "occupations_de_assigned_by_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "occupations" DROP CONSTRAINT "occupations_assigned_by_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "occupations" DROP CONSTRAINT "occupations_vacant_by_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "occupations" DROP CONSTRAINT "occupations_occupied_by_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "occupations" DROP CONSTRAINT "occupations_apartment_id_fk"`,
    );
    await queryRunner.query(`DROP TABLE "occupations"`);
    await queryRunner.query(`DROP TYPE "public"."occupations_status_enum"`);
  }
}
